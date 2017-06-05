'use strict';


//////
// Imports
import React from 'react';
import ReactDOM from 'react-dom';


export default class Prompt extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: '',
      showTooltip: false,
    }

    this.checkForEnter = this.checkForEnter.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleSend = this.handleSend.bind(this);
  }

  render() {
    return (
      <div id="prompt">
        <input type="text" ref={(input) => { this.textInput = input; }} id="input" placeholder="say something..." onChange={this.handleInput} onKeyUp={this.checkForEnter} value={this.state.input} />
        <input type="submit" id="send" value="Send" onClick={this.handleSend} />
        <span id="status-indicator" onClick={this.props.toggleConnectionSettings} className={this.props.connected ? "active" : "inactive"}>
          <span id="status-indicator-tooltip" className={this.state.showTooltip ? "active" : "inactive"}>
            {this.props.connected ? "connected" : "disconnected"}
          </span>
        </span>
      </div>
    );
  }

  componentDidMount() {
    this.focus();
  }

  focus() {
    this.textInput.focus();
  }

  handleInput(event) {
    this.setState({input: event.target.value});
  }

  handleSend() {
    if (this.props.connected){
      this.props.sendUserMessage(this.state.input);
      this.setState({input: ''});
    } else {
      this.flashTooltip();
    }
    this.focus();
  }

  flashTooltip(){
    this.setState({showTooltip: true});
    setTimeout(() => {
      this.setState({showTooltip: false})
    }, 1000);
  }

  checkForEnter(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        this.handleSend();
    }
  }
}
