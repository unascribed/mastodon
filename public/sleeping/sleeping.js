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
				dummy.childNodes[0].classList.add('st_all_emojis');
			}
			return dummy.innerHTML;
		} catch (e) {
			// rather than making the app die horrifically, just return the input unchanged
			console.error(e);
			console.error("An internal error occurred while attempting to process custom emojis.");
			return html;
		}
	},
	settingsHook: function(idx) {
		if (idx == 5) {
			requestAnimationFrame(function() {
				document.querySelector('.local-settings__page.sleeping').innerHTML = `
<h1>Sleeping</h1>
<section>
<h2>Appearance</h2>
	<label for="sleeping-primary">Primary color</label>
	<input type="color" id="sleeping-primary"> <button id="sleeping-reset-primary">Reset</button>
	<label for="sleeping-accent">Accent color</label>
	<input type="color" id="sleeping-accent"> <button id="sleeping-reset-accent">Reset</button>
	<label for="sleeping-link">Link color</label><input type="color" id="sleeping-link"> <button id="sleeping-reset-link">Reset</button>
	<label for="sleeping-brightness">Brightness</label>
	<input type="range" id="sleeping-brightness" min="-1" max="1" step="0.005" value="-0.5">
	<label for="sleeping-text-contrast">Text contrast</label>
	<input type="range" id="sleeping-text-contrast" min="0" max="1" step="0.005" value="1"> <button id="sleeping-reset-text-contrast">Reset</button>
	<label for="sleeping-contrast">Contrast</label>
	<input type="range" id="sleeping-contrast" min="0" max="4" step="0.005" value="1"> <button id="sleeping-reset-contrast">Reset</button>
	<label for="sleeping-invert-compose">
		<input type="checkbox" id="sleeping-invert-compose"/> Stark compose box
	</label>
</section>
<section>
	<h2>Misc</h2>
	<label for="sleeping-verbose-handles">
		<input type="checkbox" id="sleeping-verbose-handles"/> Verbose handles (experimental) (reload to apply changes)
	</label>
</section>`;
					// TODO this is a mess
					var primary = document.getElementById("sleeping-primary");
					var accent = document.getElementById("sleeping-accent");
					var link = document.getElementById("sleeping-link");
					var brightness = document.getElementById("sleeping-brightness");
					var textContrast = document.getElementById("sleeping-text-contrast");
					var contrast = document.getElementById("sleeping-contrast");
					var verbose = document.getElementById("sleeping-verbose-handles");
					var invertCompose = document.getElementById("sleeping-invert-compose");
					primary.value = getComputedStyle(document.body).getPropertyValue("--sleeping-primary").trim();
					accent.value = getComputedStyle(document.body).getPropertyValue("--sleeping-accent").trim();
					link.value = getComputedStyle(document.body).getPropertyValue("--sleeping-link").trim();
					brightness.value = Number(localStorage["sleeping-brightness"] || "-0.5");
					textContrast.value = Number(localStorage["sleeping-text-contrast"] || "1");
					contrast.value = Number(localStorage["sleeping-contrast"] || "1");
					verbose.checked = localStorage["sleeping-verbose-handles"] === "true";
					invertCompose.checked = localStorage["sleeping-invert-compose"] === "true";
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
					brightness.addEventListener('input', function() {
						sleeping.setBrightness(brightness.valueAsNumber, contrast.value);
						localStorage["sleeping-brightness"] = brightness.value;
					});
					textContrast.addEventListener('input', function() {
						sleeping.setColors("primary", primary.value);
						sleeping.setColors("accent", accent.value);
						sleeping.setColors("link", link.value);
						sleeping.setBrightness(brightness.valueAsNumber, contrast.value);
						document.body.style.setProperty("--sleeping-text-contrast", textContrast.value);
						localStorage["sleeping-text-contrast"] = textContrast.value;
					});
					contrast.addEventListener('input', function() {
						sleeping.setBrightness(brightness.valueAsNumber, contrast.value);
						localStorage["sleeping-contrast"] = contrast.value;
					});
					verbose.addEventListener('change', function() {
						localStorage["sleeping-verbose-handles"] = verbose.checked;
					});
					invertCompose.addEventListener('change', function() {
						if (invertCompose.checked) {
							document.body.classList.add("sleeping-invert-compose");
						} else {
							document.body.classList.remove("sleeping-invert-compose");
						}
						localStorage["sleeping-invert-compose"] = invertCompose.checked;
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
					document.getElementById("sleeping-reset-text-contrast").addEventListener('click', function() {
						textContrast.value = 1;
						sleeping.setColors("primary", primary.value);
						sleeping.setColors("accent", accent.value);
						sleeping.setColors("link", link.value);
						sleeping.setBrightness(brightness.valueAsNumber, contrast.value);
						document.body.style.setProperty("--sleeping-text-contrast", textContrast.value);
						localStorage["sleeping-text-contrast"] = textContrast.value;
					});
					document.getElementById("sleeping-reset-contrast").addEventListener('click', function() {
						contrast.value = 1;
						sleeping.setBrightness(brightness.valueAsNumber, contrast.value);
						localStorage["sleeping-contrast"] = contrast.value;
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
				hack.appendChild(document.createTextNode('.ui { background-image: url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 234.80078 31.757813" width="234.80078" height="31.757812"><path d="M19.599609 0c-1.05 0-2.10039.375-2.90039 1.125L0 16.925781v14.832031h234.80078V17.025391l-16.5-15.900391c-1.6-1.5-4.20078-1.5-5.80078 0l-13.80078 13.099609c-1.6 1.5-4.19883 1.5-5.79883 0L179.09961 1.125c-1.6-1.5-4.19883-1.5-5.79883 0L159.5 14.224609c-1.6 1.5-4.20078 1.5-5.80078 0L139.90039 1.125c-1.6-1.5-4.20078-1.5-5.80078 0l-13.79883 13.099609c-1.6 1.5-4.20078 1.5-5.80078 0L100.69922 1.125c-1.600001-1.5-4.198829-1.5-5.798829 0l-13.59961 13.099609c-1.6 1.5-4.200781 1.5-5.800781 0L61.699219 1.125c-1.6-1.5-4.198828-1.5-5.798828 0L42.099609 14.224609c-1.6 1.5-4.198828 1.5-5.798828 0L22.5 1.125C21.7.375 20.649609 0 19.599609 0z" fill="'+convert(hex).cssrgb+'"/></svg>\') !important; }'));
			}
			if (luma > 128) {
				document.body.classList.add("sleeping-"+name+"-contrast-is-dark");
			} else {
				document.body.classList.remove("sleeping-"+name+"-contrast-is-dark");
			}
		},
		setColors: function(name, hex) {
			sleeping.setColor(name, hex);
			sleeping.setColor(name+"-light", sleeping.lighten(hex, 10));
			sleeping.setColor(name+"-lighter", sleeping.lighten(hex, 20));
			sleeping.setColor(name+"-lightest", sleeping.lighten(hex, 30));
		},
		setBrightness: function(t, c) {
			var whi = "#FFFFFF";
			var bri = "#ECEFF1";
			var mid = "#607D8B";
			var dar = "#1A2327";
			var bla = "#000000";
			function setLerp(base, end, t, signum) {
				var col = sleeping.lerpColor(base, end, t);
				var c = col.rgb;
				var hex = col.hex;
				sleeping.setColor("background-dark", sleeping.lighten(c, -5*signum));
				sleeping.setColor("background", hex);
				sleeping.setColor("background-light", sleeping.lighten(c, 5*signum));
				sleeping.setColor("background-lighter", sleeping.lighten(c, 15*signum));
				sleeping.setColor("background-lightest", sleeping.lighten(c, 20*signum));
			}
			if (t > 0.9) {
				t = (t-0.9)*10;
				setLerp(bri, whi, t, -c);
			} else if (t > 0) {
				setLerp(mid, bri, t, -c);
			} else {
				t = -t;
				if (t > 0.9) {
					t = (t-0.9)*10;
					setLerp(dar, bla, t, c);
				} else {
					setLerp(mid, dar, t, c);
				}
			}
		},
		lighten: function(col, pct) {
			var hsl = convert(col).hsl;
			hsl.l += pct;
			if (hsl.l > 100) hsl.l = 100;
			if (hsl.l < 0) hsl.l = 0;
			return convert(hsl).hex;
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
	var brightness = Number(localStorage["sleeping-brightness"] || "-0.5");
	var textContrast = Number(localStorage["sleeping-text-contrast"] || "1");
	var contrast = Number(localStorage["sleeping-contrast"] || "1");
	var invertCompose = localStorage["sleeping-invert-compose"] === "true";
	sleeping.setColors("primary", primary);
	sleeping.setColors("accent", accent);
	sleeping.setColors("link", link);
	sleeping.setBrightness(brightness, contrast);
	document.body.style.setProperty("--sleeping-text-contrast", textContrast);
	if (invertCompose) {
		document.body.classList.add("sleeping-invert-compose");
	} else {
		document.body.classList.remove("sleeping-invert-compose");
	}
}
