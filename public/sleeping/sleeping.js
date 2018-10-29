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
					var allMentions = dummy.querySelectorAll('.mention');
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
					document.querySelector('.local-settings__page.sleeping').innerHTML = '<h1>Sleeping</h1><section><h2>Appearance</h2><label for="sleeping-primary">Primary color</label><input type="color" id="sleeping-primary"> <button id="sleeping-reset-primary">Reset</button><label for="sleeping-accent">Accent color</label><input type="color" id="sleeping-accent"> <button id="sleeping-reset-accent">Reset</button><label for="sleeping-link">Link color</label><input type="color" id="sleeping-link"> <button id="sleeping-reset-link">Reset</button><label for="sleeping-brightness">Brightness</label><input type="range" id="sleeping-brightness" min="-1" max="1" step="0.005" value="-0.5"></section><section><h2>Misc</h2><label for="sleeping-verbose-handles"><input type="checkbox" id="sleeping-verbose-handles"/> Verbose handles (experimental) (reload to apply changes)</label></section>';
					var primary = document.getElementById("sleeping-primary");
					var accent = document.getElementById("sleeping-accent");
					var link = document.getElementById("sleeping-link");
					var brightness = document.getElementById("sleeping-brightness");
					var verbose = document.getElementById("sleeping-verbose-handles");
					brightness.step = 0.005;
					primary.value = getComputedStyle(document.body).getPropertyValue("--sleeping-primary").trim();
					accent.value = getComputedStyle(document.body).getPropertyValue("--sleeping-accent").trim();
					link.value = getComputedStyle(document.body).getPropertyValue("--sleeping-link").trim();
					brightness.value = Number(localStorage["sleeping-brightness"] || "-0.5");
					verbose.checked = localStorage["sleeping-verbose-handles"] === "true";
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
						sleeping.setBrightness(brightness.valueAsNumber);
						localStorage["sleeping-brightness"] = brightness.value;
					});
					verbose.addEventListener('change', function() {
						localStorage["sleeping-verbose-handles"] = verbose.checked;
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
				});
			}
		},
		setColor: function(name, hex) {
			var contrast = sleeping.getLuma(hex) > 128 ? "#000" : "#FFF";
			document.body.style.setProperty("--sleeping-"+name, hex);
			document.body.style.setProperty("--sleeping-"+name+"-contrast", contrast);
			if (name == "primary-lighter") {
				var hack = document.getElementById("sleeping-css-hack");
				if (hack == null) {
					hack = document.createElement("style");
					hack.id = "sleeping-css-hack";
					document.head.appendChild(hack);
				}
				hack.appendChild(document.createTextNode('.ui { background-image: url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 234.80078 31.757813" width="234.80078" height="31.757812"><path d="M19.599609 0c-1.05 0-2.10039.375-2.90039 1.125L0 16.925781v14.832031h234.80078V17.025391l-16.5-15.900391c-1.6-1.5-4.20078-1.5-5.80078 0l-13.80078 13.099609c-1.6 1.5-4.19883 1.5-5.79883 0L179.09961 1.125c-1.6-1.5-4.19883-1.5-5.79883 0L159.5 14.224609c-1.6 1.5-4.20078 1.5-5.80078 0L139.90039 1.125c-1.6-1.5-4.20078-1.5-5.80078 0l-13.79883 13.099609c-1.6 1.5-4.20078 1.5-5.80078 0L100.69922 1.125c-1.600001-1.5-4.198829-1.5-5.798829 0l-13.59961 13.099609c-1.6 1.5-4.200781 1.5-5.800781 0L61.699219 1.125c-1.6-1.5-4.198828-1.5-5.798828 0L42.099609 14.224609c-1.6 1.5-4.198828 1.5-5.798828 0L22.5 1.125C21.7.375 20.649609 0 19.599609 0z" fill="'+convert(hex).cssrgb+'"/></svg>\') !important; }'));
			}
			if (contrast == "#000") {
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
		setBrightness: function(t) {
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
				setLerp(bri, whi, t, -1);
			} else if (t > 0) {
				setLerp(mid, bri, t, -1);
			} else {
				t = -t;
				if (t > 0.9) {
					t = (t-0.9)*10;
					setLerp(dar, bla, t, 1);
				} else {
					setLerp(mid, dar, t, 1);
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
	sleeping.setColors("primary", primary);
	sleeping.setColors("accent", accent);
	sleeping.setColors("link", link);
	sleeping.setBrightness(brightness);
}
