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
  }
}

import 'flavours/sleeping/styles/medium.scss';

//  This ensures that webpack compiles our images.
require.context('../images', true);
