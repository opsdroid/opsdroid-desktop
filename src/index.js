'use strict';


//////
// Imports
import React from 'react';
import ReactDOM from 'react-dom';
import request from 'request';
import settings from 'electron-settings';
import WebSocket from 'websocket';

import {formatPostUrl, formatSocketUrl} from './utils';

import Conversation from './components/Conversation';
import Prompt from './components/Prompt';
import ConnectionSettings from './components/ConnectionSettings';


//////
// Functions

class ChatClient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      conversation: [],
      connected: false,
    };

    this.active_connection = undefined;
    this.host = settings.get("host", "localhost");
    this.port = settings.get("port", "8080");
    this.client = new WebSocket.client();
    this.connectionCooldown = 0;
    this.connectionTimeout = undefined;

    //////
    // Event listeners
    this.client.on('connect', (connection) => {
      this.active_connection = connection;
      this.resetCooldown();
      console.log('WebSocket Client Connected');
      this.hideConnectionSettings();
      this.updateStatusIndicator(true);
      this.addMessage('connected', 'info');

      connection.on('error', (error) =>{
        console.log("Connection Error: " + error.toString());
        this.updateStatusIndicator(false);
        this.addMessage('connection error', 'info');
      });

      connection.on('close', () => {
        console.log('echo-protocol Connection Closed');
        this.updateStatusIndicator(false);
        this.reconnectToWebSocket();
        this.addMessage('disconnected', 'info');
      });

      connection.on('message', (message) => {
        if (message.type === 'utf8') {
            this.addMessage(message.utf8Data, "bot");
        }
      });
    });

    this.client.on('connectFailed', (error) => {
      console.log('Connect Error: ' + error.toString());
      this.reconnectToWebSocket();
    });

    this.connectToWebsocket();
  }

  render(){
    return (
      <div>
        <Conversation items={this.state.conversation} />
        <Prompt connection={this.state.connected} />
        <ConnectionSettings host={this.host} port={this.port} />
      </div>
    );
  }

  componentDidMount(){
    document.getElementById("send").addEventListener("click", this.sendUserMessage.bind(this));
    document.getElementById("input").addEventListener("keyup", this.checkForReturnInPrompt.bind(this));
    document.getElementById("status-indicator").addEventListener("click", this.toggleConnectionSettings);
    document.getElementById("host").addEventListener("input", this.updateHost.bind(this));
    document.getElementById("port").addEventListener("input", this.updatePort.bind(this));
    document.getElementById("connect").addEventListener("click", this.reconnectToWebSocketImmediately.bind(this));
  }

  addMessage(message, sender){
    // Add new message to the conversation
    this.setState((prevState, props) => ({
      conversation: prevState.conversation.concat([{
        "text": message,
        "user": sender,
        "time": new Date()
      }])
    }));
  }

  updateStatusIndicator(status){
    this.setState({connected: status});
  }

  sendUserMessage(){
    var user_message = document.getElementById("input").value;
    if (this.active_connection && this.active_connection.connected) {
      if (user_message != ""){
        document.getElementById("input").value = "";
        this.addMessage(user_message, "user");
        this.sendMessageToSocket(this.active_connection, user_message);
      }
    }
  }

  connectToWebsocket() {
    request.post(formatPostUrl(this.host, this.port), (error, response, body) => {
      if (error){
        console.log(error);
        this.reconnectToWebSocket();
      } else {
        var socket = JSON.parse(body)["socket"];
        this.client.connect(formatSocketUrl(this.host, this.port, socket));
      }
    })
  }

  reconnectToWebSocket() {
    if (this.active_connection && this.active_connection.connected) {
      this.active_connection.close();
    }
    if (this.connectionTimeout){
      clearTimeout(this.connectionTimeout);
    }
    console.log(`Reconnecting in ${this.connectionCooldown} seconds.`);
    this.backoffCooldown();
    this.connectionTimeout = setTimeout(this.connectToWebsocket.bind(this), this.connectionCooldown * 1000);
  }

  reconnectToWebSocketImmediately() {
    this.resetCooldown();
    this.reconnectToWebSocket();
  }

  resetCooldown() {
    this.connectionCooldown = 0;
  }

  backoffCooldown(){
      if (this.connectionCooldown <1 ) {
        this.connectionCooldown = 1;
      } else if (this.connectionCooldown < 60){
        this.connectionCooldown = this.connectionCooldown * 2;
      }
  }

  sendMessageToSocket(connection, message) {
    if (connection.connected) {
        connection.sendUTF(message);
    } else {
        console.log("Unable to send message");
    }
  }

  checkForReturnInPrompt(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        this.sendUserMessage();
    }
  }

  toggleConnectionSettings() {
    var connectionSettings = document.getElementById("connection-settings");
    connectionSettings.classList.toggle('active');
  }

  hideConnectionSettings() {
    var connectionSettings = document.getElementById("connection-settings");
    connectionSettings.classList.remove('active');
  }

  updateHost(event) {
    settings.set("host", event.target.value);
    this.host = settings.get("host", "localhost");
    this.reconnectToWebSocketImmediately();
  }

  updatePort(event) {
    settings.set("port", event.target.value);
    this.port = settings.get("port", "localhost");
    this.reconnectToWebSocketImmediately();
  }
}

ReactDOM.render(<ChatClient />,
  document.getElementById("wrapper")
);
