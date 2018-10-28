import 'flavours/glitch/styles/index.scss';
import {convert} from 'chromatism';
import {start} from 'rails-ujs';

start();

document.addEventListener('DOMContentLoaded', function() {
  var script = document.createElement("script");
  script.src = "/sleeping/sleeping.js";
  document.head.appendChild(script);
  script.onerror = function() {
    alert("Failed to inject Sleeping tweaks. Many features will not work properly.");
  };
  script.onload = function() {
    window.sleepingInit(convert);
  };
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/sleeping/sleeping.css";
  document.head.appendChild(link);
});

//  This ensures that webpack compiles our images.
require.context('../images', true);
