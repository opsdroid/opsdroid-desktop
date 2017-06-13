'use strict';


//////
// Imports
import React from 'react';


export default class ConnectionSettings extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="connection-settings" className={this.props.visible ? "active" : "inactive"}>
        <span
          id="ssl-enabled"
          onClick={this.props.toggleSSL}>
          {this.props.sslEnabled ? ('https://') : ('http://')}
        </span>
        <input type="text"
          id="host"
          placeholder={this.props.defaultHost}
          defaultValue={this.props.host == this.props.defaultHost ? '' : this.props.host}
          onChange={this.props.updateHost} />
        <input type="text"
          id="port"
          placeholder={this.props.defaultPort}
          defaultValue={this.props.port == this.props.defaultPort ? '' : this.props.port}
          onChange={this.props.updatePort} />
        <input type="submit"
          id="connect"
          value="Connect"
          onClick={this.props.reconnectToWebSocketImmediately} />
      </div>
    );
  }
}
