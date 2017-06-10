'use strict';

import electron from 'electron';
import package_info from '../../../package.json';


//////
// Imports
import React from 'react';


export default class UpdateMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latestVersion: false,
    };

    this.handleUpdateCheck = this.handleUpdateCheck.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  render() {
    if (this.state.latestVersion) {
      return (
        <div className="updates-available" onClick={this.handleClick}>
          Update available. Download {this.state.latestVersion["name"]} now.
        </div>
      );
    }
    return false;
  }

  componentDidMount() {
    this.checkForUpdates(this.handleUpdateCheck);
  }

  handleUpdateCheck(updatesAvailable) {
    this.setState({latestVersion: updatesAvailable})
  }

  handleClick(event) {
    event.preventDefault();
    electron.shell.openExternal(this.state.latestVersion["html_url"]);
  }

  checkForUpdates(callback) {
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
          let latest_version = json[0];
          if (latest_version["name"] != 'v' + package_info["version"]) {
            console.log("An update is available.");
            callback(latest_version);
          } else {
            console.log("No updates available.");
            callback(false);
          }
        });
      } else {
        console.log("Got a non json response from GitHub.");
      }
    }).catch(function(){
      console.log("Oops, could not check for latest release! No internet.");
    });
  }
}
