'use strict';

import electron from 'electron';


//////
// Imports
import React from 'react';


export default class UpdateMessage extends React.Component {
  render() {
    return (
      <div className="updates-available">
        Update available. Download {this.props.latestVersion} now.
      </div>
    );
  }
}
