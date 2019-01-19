window.sleepingInit = function(convert) {
	var defaultPrimary = "#009688";
	var defaultAccent = "#E91E63";
	var defaultLink = defaultAccent;
	window.sleeping = {
		customEmojiHook: function(html) {
			try {
				var dummy = document.createElement('div');
				dummy.innerHTML = html;
				if (dummy.childNodes.length == 0) return html;
				if (localStorage["sleeping-verbose-handles"] === "true") {
					var allMentions = dummy.querySelectorAll('.mention:not(.hashtag)');
					for (var i = 0; i < allMentions.length; i++) {
						var mention = allMentions[i];
						var split = mention.pathname.split('/');
						var last = split[split.length-1];
						if (last.indexOf('@') == 0) last = last.substring(1);
						mention.querySelector('span').textContent = last+'@'+mention.host;
					}
				}
				var allEmojos = dummy.querySelectorAll('.emojione')
				for (var i = 0; i < allEmojos.length; i++) {
					var emojo = allEmojos[i];
					// no shortcode in alt text means it's a Unicode emoji
					if (emojo.alt.indexOf(':') == -1) continue;
					var originalNode = emojo.cloneNode();
					originalNode.src = originalNode.src.replace('static', 'original');
					var staticNode = emojo.cloneNode();
					staticNode.src = staticNode.src.replace('original', 'static');
					
					var wrapper = document.createElement('span');
					originalNode.classList.add('st_moving');
					wrapper.appendChild(originalNode);
					wrapper.appendChild(staticNode);
					wrapper.classList.add('st_custom_emoji_wrapper');
					wrapper.classList.add('emojione');
					if (emojo.parentNode) emojo.parentNode.replaceChild(wrapper, emojo);
				}
			function recurse(node) {
				if (node.classList && node.classList.contains('mention')) return true;
				if (node.classList && node.classList.contains('emojione')) return true;
				if (node.childNodes.length == 0) {
					if (node.textContent.trim().replace(/\u200B/g, '').length != 0) {
						return false;
					}
				}
				for (var i = 0; i < node.childNodes.length; i++) {
					if (!recurse(node.childNodes[i])) return false;
				}
				return true;
			}
			var everythingIsEmojos = recurse(dummy);
			if (everythingIsEmojos) {
				for (var i = 0; i < dummy.children.length; i++) {
					dummy.children[i].classList.add('st_all_emojis');
				}
			}
			return dummy.innerHTML;
		} catch (e) {
			// rather than making the app die horrifically, just return the input unchanged
			console.error(e);
			console.error("An internal error occurred while attempting to process a status.");
			if (!window.sleeping.hasNagged) {
				window.sleeping.hasNagged = true;
				alert("An internal error occurred in the Sleeping theme while processing a status.\nThe page will continue to work, and any further errors will be ignored.\n\nPlease report this issue to Una (@unascribed@sleeping.town). Include a screenshot of your JavaScript console (press F12 to show it)");
			}
			return html;
		}
	},
	settingsHook: function(idx) {
		if (idx == 5) {
			requestAnimationFrame(function() {
				document.querySelector('.local-settings__page.sleeping').innerHTML = `
<h1>Sleeping</h1>
<section>
	<h2>Colors</h2>
	<table style="table-layout: fixed; width: 100%">
		<tr>
			<th>Primary</th>
			<th>Accent</th>
			<th>Link</th>
			<th>Background</th>
		</tr>
		<tr>
			<td><input type="color" id="sleeping-primary"></td>
			<td><input type="color" id="sleeping-accent"></td>
			<td><input type="color" id="sleeping-link"></td>
			<td><input type="color" id="sleeping-background"></td>
		</tr>
		<tr>
			<td><button id="sleeping-reset-primary">Reset</button></td>
			<td><button id="sleeping-reset-accent">Reset</button></td>
			<td><button id="sleeping-reset-link">Reset</button></td>
			<td><button id="sleeping-reset-background">Reset</button></td>
		</tr>
	</table>
	<label for="sleeping-text-contrast">Text contrast</label>
	<input type="range" id="sleeping-text-contrast" min="0.3333" max="1" step="0.005" value="1"> <button id="sleeping-reset-text-contrast">Reset</button>
	<label for="sleeping-contrast">Contrast</label>
	<input type="range" id="sleeping-contrast" min="0" max="4" step="0.005" value="1"> <button id="sleeping-reset-contrast">Reset</button>
	<label for="sleeping-compose-color">Compose box color</label>
	<select id="sleeping-compose-color">
		<option value="default">Automatic</option>
		<option value="invert">Automatic Stark</option>
		<option value="black">Black</option>
		<option value="white">White</option>
	</select>
	<label for="sleeping-algorithm">Shade algorithm</label>
	<select id="sleeping-algorithm">
		<option value="auto">Automatic</option>
		<option value="simple">Simple Lighten</option>
		<option value="simple-invert">Simple Darken</option>
		<option value="advanced">Advanced Lighten</option>
		<option value="advanced-invert">Advanced Darken</option>
	</select><br/>
	<small>Automatic chooses a Simple algorithm based on the brightness of the background color. Advanced uses a more complex algorithm based around how the eye perceives color, but can produce unexpected results.</small>
</section>
<section>
	<h2>Misc</h2>
	<div class="glitch local-settings__page__item boolean">
		<label for="sleeping-verbose-handles">
			<input type="checkbox" id="sleeping-verbose-handles"/> Verbose handles (experimental) (reload to apply changes)
		</label>
	</div>
</section>`;
					// TODO this is a gigantic mess
					var primary = document.getElementById("sleeping-primary");
					var accent = document.getElementById("sleeping-accent");
					var link = document.getElementById("sleeping-link");
					var background = document.getElementById("sleeping-background");
					var textContrast = document.getElementById("sleeping-text-contrast");
					var contrast = document.getElementById("sleeping-contrast");
					var verbose = document.getElementById("sleeping-verbose-handles");
					var composeColor = document.getElementById("sleeping-compose-color");
					var algorithm = document.getElementById("sleeping-algorithm");
					primary.value = getComputedStyle(document.body).getPropertyValue("--sleeping-primary").trim();
					accent.value = getComputedStyle(document.body).getPropertyValue("--sleeping-accent").trim();
					link.value = getComputedStyle(document.body).getPropertyValue("--sleeping-link").trim();
					background.value = localStorage["sleeping-background-color"] || sleeping.getLegacyBackgroundColor(Number(localStorage["sleeping-brightness"] || "-0.5"));
					textContrast.value = Number(localStorage["sleeping-text-contrast"] || "1");
					contrast.value = Number(localStorage["sleeping-contrast"] || "1");
					verbose.checked = localStorage["sleeping-verbose-handles"] === "true";
					composeColor.value = localStorage["sleeping-compose-color"] || (localStorage["sleeping-invert-compose"] === "true" ? "invert" : "default");
					algorithm.value = localStorage["sleeping-algorithm"] || "auto";
					primary.addEventListener('input', function() {
						sleeping.setColors("primary", primary.value);
						localStorage["sleeping-primary-color"] = primary.value;
					});
					accent.addEventListener('input', function() {
						sleeping.setColors("accent", accent.value);
						localStorage["sleeping-accent-color"] = accent.value;
					});
					link.addEventListener('input', function() {
						sleeping.setColors("link", link.value);
						localStorage["sleeping-link-color"] = link.value;
					});
					background.addEventListener('input', function() {
						sleeping.setColors("background", background.value);
						localStorage["sleeping-background-color"] = background.value;
					});
					textContrast.addEventListener('input', function() {
						localStorage["sleeping-text-contrast"] = textContrast.value;
						document.body.style.setProperty("--sleeping-text-contrast", textContrast.value);
						sleeping.setColors("primary", primary.value);
						sleeping.setColors("accent", accent.value);
						sleeping.setColors("link", link.value);
						sleeping.setColors("background", background.value);
					});
					contrast.addEventListener('input', function() {
						localStorage["sleeping-contrast"] = contrast.value;
						sleeping.setColors("primary", primary.value);
						sleeping.setColors("accent", accent.value);
						sleeping.setColors("link", link.value);
						sleeping.setColors("background", background.value);
					});
					verbose.addEventListener('change', function() {
						localStorage["sleeping-verbose-handles"] = verbose.checked;
					});
					composeColor.addEventListener('change', function() {
						document.body.classList.remove("sleeping-invert-compose");
						document.body.classList.remove("sleeping-black-compose");
						document.body.classList.remove("sleeping-white-compose");
						document.body.classList.add("sleeping-"+composeColor.value+"-compose");
						localStorage["sleeping-compose-color"] = composeColor.value;
					});
					algorithm.addEventListener('input', function() {
						localStorage["sleeping-algorithm"] = algorithm.value;
						sleeping.setColors("primary", primary.value);
						sleeping.setColors("accent", accent.value);
						sleeping.setColors("link", link.value);
						sleeping.setColors("background", background.value);
					});
					
					document.getElementById("sleeping-reset-primary").addEventListener('click', function() {
						sleeping.setColors("primary", defaultPrimary);
						primary.value = defaultPrimary;
						localStorage["sleeping-primary-color"] = defaultPrimary;
					});
					document.getElementById("sleeping-reset-accent").addEventListener('click', function() {
						sleeping.setColors("accent", defaultAccent);
						accent.value = defaultAccent;
						localStorage["sleeping-accent-color"] = defaultAccent;
					});
					document.getElementById("sleeping-reset-link").addEventListener('click', function() {
						sleeping.setColors("link", defaultLink);
						link.value = defaultLink;
						localStorage["sleeping-link-color"] = defaultLink;
					});
					document.getElementById("sleeping-reset-background").addEventListener('click', function() {
						var def = sleeping.getLegacyBackgroundColor(-0.5);
						sleeping.setColors("background", def);
						background.value = def;
						localStorage["sleeping-background-color"] = def;
					});
					document.getElementById("sleeping-reset-text-contrast").addEventListener('click', function() {
						textContrast.value = 1;
						document.body.style.setProperty("--sleeping-text-contrast", textContrast.value);
						localStorage["sleeping-text-contrast"] = textContrast.value;
						sleeping.setColors("primary", primary.value);
						sleeping.setColors("accent", accent.value);
						sleeping.setColors("link", link.value);
						sleeping.setColors("background", background.value);
					});
					document.getElementById("sleeping-reset-contrast").addEventListener('click', function() {
						contrast.value = 1;
						localStorage["sleeping-contrast"] = contrast.value;
						sleeping.setColors("primary", primary.value);
						sleeping.setColors("accent", accent.value);
						sleeping.setColors("link", link.value);
						sleeping.setColors("background", background.value);
					});
				});
			}
		},
		setColor: function(name, hex) {
			var textContrast = Number(localStorage["sleeping-text-contrast"] || "1");
			var luma = sleeping.getLuma(hex);
			var contrastColor = "rgba("+(luma > 128 ? "0, 0, 0" : "255, 255, 255")+", "+textContrast+")";
			document.body.style.setProperty("--sleeping-"+name, hex);
			document.body.style.setProperty("--sleeping-"+name+"-contrast", contrastColor);
			if (name == "primary-lighter") {
				var hack = document.getElementById("sleeping-css-hack");
				if (hack == null) {
					hack = document.createElement("style");
					hack.id = "sleeping-css-hack";
					document.head.appendChild(hack);
				}
				hack.appendChild(document.createTextNode('.ui { background-image: url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 234.80078 31.757813" width="234.80078" height="31.757812"><path d="M19.599609 0c-1.05 0-2.10039.375-2.90039 1.125L0 16.925781v14.832031h234.80078V17.025391l-16.5-15.900391c-1.6-1.5-4.20078-1.5-5.80078 0l-13.80078 13.099609c-1.6 1.5-4.19883 1.5-5.79883 0L179.09961 1.125c-1.6-1.5-4.19883-1.5-5.79883 0L159.5 14.224609c-1.6 1.5-4.20078 1.5-5.80078 0L139.90039 1.125c-1.6-1.5-4.20078-1.5-5.80078 0l-13.79883 13.099609c-1.6 1.5-4.20078 1.5-5.80078 0L100.69922 1.125c-1.600001-1.5-4.198829-1.5-5.798829 0l-13.59961 13.099609c-1.6 1.5-4.200781 1.5-5.800781 0L61.699219 1.125c-1.6-1.5-4.198828-1.5-5.798828 0L42.099609 14.224609c-1.6 1.5-4.198828 1.5-5.798828 0L22.5 1.125C21.7.375 20.649609 0 19.599609 0z" fill="'+convert(hex).cssrgb+'"/></svg>\') !important; background-repeat: no-repeat; }'));
			}
			if (luma > 128) {
				document.body.classList.add("sleeping-"+name+"-contrast-is-dark");
			} else {
				document.body.classList.remove("sleeping-"+name+"-contrast-is-dark");
			}
		},
		setColors: function(name, hex) {
			var contrast = Number(localStorage["sleeping-contrast"] || "1");
			sleeping.setColor(name+"-minus10", sleeping.lighten(hex, -10*contrast));
			sleeping.setColor(name+"-minus5", sleeping.lighten(hex, -5*contrast));
			sleeping.setColor(name, hex);
			sleeping.setColor(name+"-plus2h", sleeping.lighten(hex, 2.5*contrast));
			sleeping.setColor(name+"-plus5", sleeping.lighten(hex, 5*contrast));
			sleeping.setColor(name+"-plus10", sleeping.lighten(hex, 10*contrast));
			sleeping.setColor(name+"-plus15", sleeping.lighten(hex, 15*contrast));
			sleeping.setColor(name+"-plus20", sleeping.lighten(hex, 15*contrast));
		},
		getLegacyBackgroundColor: function(t, c) {
			var whi = "#FFFFFF";
			var bri = "#ECEFF1";
			var mid = "#607D8B";
			var dar = "#1A2327";
			var bla = "#000000";
			function lerp(base, end, t, signum) {
				return sleeping.lerpColor(base, end, t).hex;
			}
			if (t > 0.9) {
				t = (t-0.9)*10;
				return lerp(bri, whi, t, -c);
			} else if (t > 0) {
				return lerp(mid, bri, t, -c);
			} else {
				t = -t;
				if (t > 0.9) {
					t = (t-0.9)*10;
					return lerp(dar, bla, t, c);
				} else {
					return lerp(mid, dar, t, c);
				}
			}
		},
		lighten: function(col, pct) {
			function inner(col, pct, alg) {
				if (/-invert$/.exec(alg)) pct = -pct;
				if (/^advanced/.exec(alg)) {
					var cielab = convert(col).cielab;
					cielab.L += pct;
					if (cielab.L > 100) cielab.L = 100;
					if (cielab.L < 0) cielab.L = 0;
					return convert(cielab).hex;
				} else {
					var hsl = convert(col).hsl;
					hsl.l += pct;
					if (hsl.l > 100) hsl.l = 100;
					if (hsl.l < 0) hsl.l = 0;
					return convert(hsl).hex;
				}
			}
			var alg = localStorage["sleeping-algorithm"];
			if ("auto" === alg) {
				var luma = sleeping.getLuma(localStorage["sleeping-background-color"] || sleeping.getLegacyBackgroundColor(Number(localStorage["sleeping-brightness"] || "-0.5")));
				if (luma > 128) {
					return inner(col, -pct, "simple");
				} else {
					return inner(col, pct, "simple");
				}
			} else {
				return inner(col, pct, alg);
			}
		},
		getLuma: function(col) {
			var rgb = convert(col).rgb;
			return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
		},
		lerp: function(a, b, t) {
			if (t < 0) t = 0;
			if (t > 1) t = 1;
			return a + t * (b - a);
		},
		lerpColor: function(acol, bcol, t) {
			var argb = convert(acol).rgb;
			var brgb = convert(bcol).rgb;
			return convert({
				r: sleeping.lerp(argb.r, brgb.r, t),
				g: sleeping.lerp(argb.g, brgb.g, t),
				b: sleeping.lerp(argb.b, brgb.b, t),
			});
		}
	}
	var primary = localStorage["sleeping-primary-color"] || defaultPrimary;
	var accent = localStorage["sleeping-accent-color"] || defaultAccent;
	var link = localStorage["sleeping-link-color"] || defaultLink;
	var background = localStorage["sleeping-background-color"] || sleeping.getLegacyBackgroundColor(Number(localStorage["sleeping-brightness"] || "-0.5"));
	var textContrast = Number(localStorage["sleeping-text-contrast"] || "1");
	var contrast = Number(localStorage["sleeping-contrast"] || "1");
	var composeColor = localStorage["sleeping-compose-color"] || (localStorage["sleeping-invert-compose"] === "true" ? "invert" : "default");
	sleeping.setColors("primary", primary);
	sleeping.setColors("accent", accent);
	sleeping.setColors("link", link);
	sleeping.setColors("background", background);
	document.body.style.setProperty("--sleeping-text-contrast", textContrast);
	document.body.classList.add("sleeping-"+composeColor+"-compose");
	
	var vanillaFlavor = document.querySelector("#flavours #vanilla .fa");
	var glitchFlavor = document.querySelector("#flavours #glitch .fa");
	var sleepingFlavor = document.querySelector("#flavours #sleeping .fa");
	if (vanillaFlavor) vanillaFlavor.className = "fa fa-fw fa-circle";
	if (glitchFlavor) glitchFlavor.className = "fa fa-fw fa-align-center";
	if (sleepingFlavor) sleepingFlavor.className = "fa fa-fw fa-bed";
}
