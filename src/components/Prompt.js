'use strict';


//////
// Imports
import React from 'react';


export default class Prompt extends React.Component {
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div id="prompt">
        <input type="text" id="input" placeholder="say something..." />
        <input type="submit" id="send" value="Send" />
        <span id="status-indicator" className={this.props.connection ? "active" : "inactive"}>
          <span id="status-indicator-tooltip">
            {this.props.connection ? "connected" : "disconnected"}
          </span>
        </span>
      </div>
    );
  }
}
