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
// Constants
const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = "8080";


//////
// Main Class
class ChatClient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      conversation: [],
      connected: false,
      showConnectionSettings: false,
      host: settings.get("host", DEFAULT_HOST),
      port: settings.get("port", DEFAULT_PORT),
    };

    this.active_connection = undefined;
    this.client = new WebSocket.client();
    this.connectionCooldown = 0;
    this.connectionTimeout = undefined;

    //////
    // Event listeners
    this.toggleConnectionSettings = this.toggleConnectionSettings.bind(this);
    this.sendUserMessage = this.sendUserMessage.bind(this);
    this.updateHost = this.updateHost.bind(this);
    this.updatePort = this.updatePort.bind(this);
    this.connectToWebsocket = this.connectToWebsocket.bind(this);
    this.reconnectToWebSocketImmediately = this.reconnectToWebSocketImmediately.bind(this);

    this.client.on('connect', (connection) => {
      this.active_connection = connection;
      this.resetCooldown();
      console.log('WebSocket Client Connected');
      this.hideConnectionSettings();
      this.updateStatusIndicator(true);
      this.addMessage('connected', 'info');

      connection.on('error', (error) => {
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
  }

  render(){
    return (
      <div>
        <Conversation
          items={this.state.conversation} />
        <Prompt
          connected={this.state.connected}
          toggleConnectionSettings={this.toggleConnectionSettings}
          sendUserMessage={this.sendUserMessage} />
        <ConnectionSettings
          host={this.state.host}
          port={this.state.port}
          defaultHost={DEFAULT_HOST}
          defaultPort={DEFAULT_PORT}
          visible={this.state.showConnectionSettings}
          updateHost={this.updateHost}
          updatePort={this.updatePort}
          reconnectToWebSocketImmediately={this.reconnectToWebSocketImmediately} />
      </div>
    );
  }

  componentDidMount(){
    this.connectToWebsocket();
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

  sendUserMessage(user_message){
    if (this.active_connection && this.active_connection.connected) {
      if (user_message != ""){
        this.addMessage(user_message, "user");
        this.sendMessageToSocket(this.active_connection, user_message);
      }
    }
  }

  connectToWebsocket() {
    request.post(formatPostUrl(this.state.host, this.state.port), (error, response, body) => {
      if (error){
        console.log(error);
        this.reconnectToWebSocket();
      } else {
        var socket = JSON.parse(body)["socket"];
        this.client.connect(formatSocketUrl(this.state.host, this.state.port, socket));
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
    this.connectionTimeout = setTimeout(this.connectToWebsocket, this.connectionCooldown * 1000);
    this.backoffCooldown();
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
      } else if (this.connectionCooldown < 5){
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

  toggleConnectionSettings() {
    this.setState((prevState, props) => ({
      showConnectionSettings: ! prevState.showConnectionSettings
    }));
  }

  hideConnectionSettings() {
    this.setState({
      showConnectionSettings: false
    });
  }

  updateHost(event) {
    settings.set("host", event.target.value);
    this.setState({host: settings.get("host", "localhost")});
    this.reconnectToWebSocketImmediately();
  }

  updatePort(event) {
    settings.set("port", event.target.value);
    this.setState({port: settings.get("port", "localhost")});
    this.reconnectToWebSocketImmediately();
  }
}

//////
// Start
ReactDOM.render(<ChatClient />,
  document.getElementById("wrapper")
);
