import 'flavours/sleeping/styles/medium.scss';
import {convert} from 'chromatism';

window.sleeping = {
  customEmojiHook: function(html) {
    var dummy = document.createElement('div');
    dummy.innerHTML = html;
    if (dummy.childNodes.length == 0) return html;
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
  },
  settingsHook: function(idx) {
    if (idx == 3) {
      requestAnimationFrame(function() {
        var primary = document.getElementById("sleeping-primary");
        var accent = document.getElementById("sleeping-accent");
        var link = document.getElementById("sleeping-link");
        primary.value = getComputedStyle(document.body).getPropertyValue("--sleeping-primary").trim();
        accent.value = getComputedStyle(document.body).getPropertyValue("--sleeping-accent").trim();
        link.value = getComputedStyle(document.body).getPropertyValue("--sleeping-link").trim();
        primary.addEventListener('change', function() {
          sleeping.setColors("primary", primary.value);
          localStorage["sleeping-primary-color"] = primary.value;
        });
        accent.addEventListener('change', function() {
          sleeping.setColors("accent", accent.value);
          localStorage["sleeping-accent-color"] = accent.value;
        });
        link.addEventListener('change', function() {
          sleeping.setColors("link", link.value);
          localStorage["sleeping-link-color"] = link.value;
        });

        document.getElementById("sleeping-reset-primary").addEventListener('click', function() {
          var hex = getComputedStyle(document.body).getPropertyValue("--sleeping-primary-default").trim();
          sleeping.setColors("primary", hex);
          primary.value = hex;
          localStorage["sleeping-primary-color"] = hex;
        });
        document.getElementById("sleeping-reset-accent").addEventListener('click', function() {
          var hex = getComputedStyle(document.body).getPropertyValue("--sleeping-accent-default").trim();
          sleeping.setColors("accent", hex);
          accent.value = hex;
          localStorage["sleeping-accent-color"] = hex;
        });
        document.getElementById("sleeping-reset-link").addEventListener('click', function() {
          var hex = getComputedStyle(document.body).getPropertyValue("--sleeping-link-default").trim();
          sleeping.setColors("link", hex);
          link.value = hex;
          localStorage["sleeping-link-color"] = hex;
        });
      });
    }
  },
  setColor: function(name, hex) {
    var contrast = sleeping.getLuma(hex) > 128 ? "#000" : "#FFF";
    document.body.style.setProperty("--sleeping-"+name, hex);
    document.body.style.setProperty("--sleeping-"+name+"-contrast", contrast);
    if (name == "primary") {
      var hack = document.getElementById("sleeping-css-hack");
      if (hack == null) {
        hack = document.createElement("style");
        hack.id = "sleeping-css-hack";
        document.head.appendChild(hack);
      }
      hack.appendChild(document.createTextNode('.ui { background-image: url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 234.80078 31.757813" width="234.80078" height="31.757812"><path d="M19.599609 0c-1.05 0-2.10039.375-2.90039 1.125L0 16.925781v14.832031h234.80078V17.025391l-16.5-15.900391c-1.6-1.5-4.20078-1.5-5.80078 0l-13.80078 13.099609c-1.6 1.5-4.19883 1.5-5.79883 0L179.09961 1.125c-1.6-1.5-4.19883-1.5-5.79883 0L159.5 14.224609c-1.6 1.5-4.20078 1.5-5.80078 0L139.90039 1.125c-1.6-1.5-4.20078-1.5-5.80078 0l-13.79883 13.099609c-1.6 1.5-4.20078 1.5-5.80078 0L100.69922 1.125c-1.600001-1.5-4.198829-1.5-5.798829 0l-13.59961 13.099609c-1.6 1.5-4.200781 1.5-5.800781 0L61.699219 1.125c-1.6-1.5-4.198828-1.5-5.798828 0L42.099609 14.224609c-1.6 1.5-4.198828 1.5-5.798828 0L22.5 1.125C21.7.375 20.649609 0 19.599609 0z" fill="'+convert(hex).cssrgb+'"/></svg>\') !important; }'));
    }
  },
  setColors: function(name, hex) {
    sleeping.setColor(name, hex);
    sleeping.setColor(name+"-light", sleeping.lightenLAB(hex, 4));
    sleeping.setColor(name+"-lighter", sleeping.lightenLAB(hex, 6));
    sleeping.setColor(name+"-lightest", sleeping.lightenLAB(hex, 12));
  },
  lightenLAB: function(hex, pct) {
    var lab = convert(hex).cielab;
    lab.L += pct;
    if (lab.L > 100) lab.L = 100;
    return convert(lab).hex;
  },
  getLuma: function(hex) {
    var rgb = convert(hex).rgb;
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  },
  init: function() {
    document.addEventListener('DOMContentLoaded', function() {
      var primary = localStorage["sleeping-primary-color"] || getComputedStyle(document.body).getPropertyValue("--sleeping-primary-default").trim();
      var accent = localStorage["sleeping-accent-color"] || getComputedStyle(document.body).getPropertyValue("--sleeping-accent-default").trim();
      var link = localStorage["sleeping-link-color"] || getComputedStyle(document.body).getPropertyValue("--sleeping-link-default").trim();
      sleeping.setColors("primary", primary);
      sleeping.setColors("accent", accent);
      sleeping.setColors("link", link);
    });
  }
}

//  This ensures that webpack compiles our images.
require.context('../images', true);
