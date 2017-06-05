'use strict';


//////
// Imports
import React from 'react';


export default class Prompt extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: '',
    }

    this.checkForEnter = this.checkForEnter.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleSend = this.handleSend.bind(this);
  }

  render(){
    return (
      <div id="prompt">
        <input type="text" ref="input" id="input" placeholder="say something..." onChange={this.handleInput} onKeyUp={this.checkForEnter} value={this.state.input} />
        <input type="submit" id="send" value="Send" onClick={this.handleSend} />
        <span id="status-indicator" onClick={this.props.toggleConnectionSettings} className={this.props.connected ? "active" : "inactive"}>
          <span id="status-indicator-tooltip">
            {this.props.connected ? "connected" : "disconnected"}
          </span>
        </span>
      </div>
    );
  }

  handleInput(event) {
    this.setState({input: event.target.value});
  }

  handleSend(){
    this.props.sendUserMessage(this.state.input);
    this.setState({input: ''})
  }

  checkForEnter(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        this.handleSend();
    }
  }
}
