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
// Global variables
var active_connection = undefined;
var is_connected = false;
var host = settings.get("host", "localhost");
var port = settings.get("port", "8080");
var client = new WebSocket.client();
var connectionCooldown = 0;
var connectionTimeout = undefined;
var conversation = [];


//////
// Functions

class ChatClient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      conversation: [],
    };
  }

  render(){
    return (
      <div>
        <Conversation items={conversation} />
        <Prompt connection={is_connected} />
        <ConnectionSettings host={host} port={port} />
      </div>
    );
  }
}

var render = function(){
  // Render the conversation
  ReactDOM.render(<ChatClient />,
    document.getElementById("wrapper")
  );
}

var addMessage = function(message, sender){
  // Add new message to the conversation
  conversation.push({
    "text": message,
    "user": sender,
    "time": new Date()
  });
  render();
}

var updateStatusIndicator = function(status){
  is_connected = status;
  render();
}

var sendUserMessage = function(){
  var user_message = document.getElementById("input").value;
  if (active_connection && active_connection.connected) {
    if (user_message != ""){
      document.getElementById("input").value = "";
      addMessage(user_message, "user");
      sendMessageToSocket(active_connection, user_message);
    }
  }
}

var connectToWebsocket = function() {
  request.post(formatPostUrl(host, port), function(error, response, body){
    if (error){
      console.log(error);
      reconnectToWebSocket();
    } else {
      var socket = JSON.parse(body)["socket"];
      client.connect(formatSocketUrl(host, port, socket));
    }
  })
}

var reconnectToWebSocket = function() {
  if (active_connection && active_connection.connected) {
    active_connection.close();
  }
  if (connectionTimeout){
    clearTimeout(connectionTimeout);
  }
  console.log(`Reconnecting in ${connectionCooldown} seconds.`);
  backoffCooldown();
  connectionTimeout = setTimeout(connectToWebsocket, connectionCooldown * 1000);
}

var reconnectToWebSocketImmediately = function() {
  resetCooldown();
  reconnectToWebSocket();
}

var resetCooldown = function() {
  connectionCooldown = 0;
}

var backoffCooldown = function(){
    if (connectionCooldown <1 ) {
      connectionCooldown = 1;
    } else if (connectionCooldown < 60){
      connectionCooldown = connectionCooldown * 2;
    }
}

var sendMessageToSocket = function(connection, message) {
  if (connection.connected) {
      connection.sendUTF(message);
  } else {
      console.log("Unable to send message");
  }
}

var handleSocketConnection = function(connection) {
  active_connection = connection;
  resetCooldown();
  console.log('WebSocket Client Connected');
  hideConnectionSettings();
  updateStatusIndicator(true);
  addMessage('connected', 'info');

  connection.on('error', handleSocketError);
  connection.on('close', handleSocketClose);
  connection.on('message', handleSocketMessage);
}

var handleSocketFailedConnection = function(error) {
  console.log('Connect Error: ' + error.toString());
  reconnectToWebSocket();
}

var handleSocketMessage = function(message) {
  if (message.type === 'utf8') {
      addMessage(message.utf8Data, "bot");
  }
}

var handleSocketClose = function() {
  console.log('echo-protocol Connection Closed');
  updateStatusIndicator(false);
  reconnectToWebSocket();
  addMessage('disconnected', 'info');
}

var handleSocketError = function(error) {
  console.log("Connection Error: " + error.toString());
  updateStatusIndicator(false);
  addMessage('connection error', 'info');
}

var checkForReturnInPrompt = function(event) {
  event.preventDefault();
  if (event.keyCode == 13) {
      sendUserMessage();
  }
}

var toggleConnectionSettings = function() {
  var connectionSettings = document.getElementById("connection-settings");
  connectionSettings.classList.toggle('active');
}

var hideConnectionSettings = function() {
  var connectionSettings = document.getElementById("connection-settings");
  connectionSettings.classList.remove('active');
}

var updateHost = function(event) {
  settings.set("host", event.target.value);
  host = settings.get("host", "localhost");
  reconnectToWebSocketImmediately();
}

var updatePort = function(event) {
  settings.set("port", event.target.value);
  host = settings.get("port", "localhost");
  reconnectToWebSocketImmediately();
}

//////
// First render of React components
render();

//////
// Event listeners
client.on('connect', handleSocketConnection);
client.on('connectFailed', handleSocketFailedConnection);
document.getElementById("send").addEventListener("click", sendUserMessage);
document.getElementById("input").addEventListener("keyup", checkForReturnInPrompt);
document.getElementById("status-indicator").addEventListener("click", toggleConnectionSettings);
document.getElementById("host").addEventListener("input", updateHost);
document.getElementById("port").addEventListener("input", updatePort);
document.getElementById("connect").addEventListener("click", reconnectToWebSocketImmediately);


//////
// Start
connectToWebsocket();
