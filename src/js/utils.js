'use strict';
import package_info from '../../package.json';

export function formatPostUrl(host, port) {
  return `http://${host}:${port}/connector/websocket`;
}

export function formatSocketUrl(host, port, socket) {
  return `ws://${host}:${port}/connector/websocket/${socket}`;
}

export function checkForUrl(text) {
  let match = text.match(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?"));
  if(match) {
    return match[0];
  } else {
    return false;
  }
}

export function checkForUpdates(callback) {
  const RELEASES_URL = 'https://api.github.com/repos/opsdroid/opsdroid-desktop/releases';
  var myInit = { method: 'GET',
                 headers: new Headers(),
                 mode: 'cors',
                 cache: 'default' };
  var myRequest = new Request(RELEASES_URL, myInit);
  fetch(myRequest).then(function(response) {
    var contentType = response.headers.get("content-type");
    if(contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then(function(json) {
        let latest_version = json[0]["name"];
        let current_version = 'v' + package_info["version"];
        if (latest_version != current_version) {
          console.log("An update is available.");
          callback(latest_version);
        } else {
          console.log("No updates available.");
          callback(false);
        }
      });
    } else {
      console.log("Oops, could not check for latest release!");
    }
  });
}
