'use strict';


//////
// Imports
import React from 'react';


export default class ConnectionSettings extends React.Component {
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div id="connection-settings" className={this.props.visible ? "active" : "inactive"}>
        <input type="text" id="host" placeholder="localhost" defaultValue={this.props.host} onChange={this.props.updateHost} />
        <input type="text" id="port" placeholder="8080" defaultValue={this.props.port} onChange={this.props.updatePort} />
        <input type="submit" id="connect" value="Connect" onClick={this.props.reconnectToWebSocketImmediately} />
      </div>
    );
  }
}
