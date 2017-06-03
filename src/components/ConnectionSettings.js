'use strict';


//////
// Imports
import React from 'react';


export default class ConnectionSettings extends React.Component {
  render(){
    return (
      <div id="connection-settings">
        <input type="text" id="host" placeholder="localhost" defaultValue={this.props.host} />
        <input type="text" id="port" placeholder="8080" defaultValue={this.props.port} />
        <input type="submit" id="connect" value="Connect" />
      </div>
    );
  }
}
