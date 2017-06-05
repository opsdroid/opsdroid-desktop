'use strict';


//////
// Imports
import React from 'react';


export default class Prompt extends React.Component {
  constructor(props) {
    super(props);

    this.checkForReturnInPrompt = this.checkForReturnInPrompt.bind(this);
  }

  render(){
    return (
      <div id="prompt">
        <input type="text" id="input" placeholder="say something..." onKeyUp={this.checkForReturnInPrompt} />
        <input type="submit" id="send" value="Send" onClick={this.props.sendUserMessage} />
        <span id="status-indicator" onClick={this.props.toggleConnectionSettings} className={this.props.connection ? "active" : "inactive"}>
          <span id="status-indicator-tooltip">
            {this.props.connection ? "connected" : "disconnected"}
          </span>
        </span>
      </div>
    );
  }

  checkForReturnInPrompt(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        this.props.sendUserMessage();
    }
  }
}
