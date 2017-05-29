//////
// Imports
var request = require('request');
var settings = require('electron-settings');
var WebSocketClient = require('websocket').client;

//////
// Global variables
var active_connection = undefined;
var host = settings.get("host", "localhost")
var port = settings.get("port", "8080")
var client = new WebSocketClient();
var connectionCooldown = 0;
var connectionTimeout = undefined;

//////
// Functions
var displayMessage = function(message, sender){
  // Get conversation list
  var conversation = document.getElementById("conversation");

  // Append message to conversation
  var li = document.createElement("li");
  li.appendChild(document.createTextNode(message));
  li.setAttribute("class", sender);
  conversation.appendChild(li);

  // Add a clearfix
  var clearfix = document.createElement("li");
  clearfix.setAttribute("class", "clearfix");
  conversation.appendChild(clearfix);

  // Add time
  if (sender != 'info'){
    var time = document.createElement("li");
    time.appendChild(document.createTextNode(
      new Date().toTimeString().replace(/.*(\d{2}:\d{2}):\d{2}.*/, "$1")
    ));
    time.setAttribute("class", sender + " time");
    conversation.appendChild(time);
  }

  // Add a clearfix
  var clearfix = document.createElement("li");
  clearfix.setAttribute("class", "clearfix");
  conversation.appendChild(clearfix);

  // Scroll down to show new messages
  window.scrollTo(0, document.body.scrollHeight);
}

var getUrl = function(host, port) {
  return `http://${host}:${port}/connector/websocket`
}

var updateStatusIndicator = function(status){
  status_indicator = document.getElementById("status-indicator")
  status_indicator.setAttribute('class', status)
}

var updateTooltipText = function(text){
  tooltip = document.getElementById("status-indicator-tooltip")
  tooltip.innerHTML = text
}

var flashTooltip = function(){
  document.getElementById("status-indicator-tooltip")
    .setAttribute('class', 'active')
  setTimeout(function(){
    document.getElementById("status-indicator-tooltip")
      .setAttribute('class', '')
  }, 1000);
}

var sendUserMessage = function(){
  document.getElementById("input").focus();
  user_message = document.getElementById("input").value
  if (active_connection && active_connection.connected) {
    if (user_message != ""){
      document.getElementById("input").value = ""
      displayMessage(user_message, "user")
      sendMessageToSocket(active_connection, user_message);
    }
  } else {
    flashTooltip()
  }
}

var connectToWebsocket = function() {
  updateTooltipText('connecting')
  request.post(getUrl(host, port), function(error, response, body){
    if (error){
      console.log(error)
      updateTooltipText('disconnected')
      reconnectToWebSocket()
    } else {
      socket = JSON.parse(body)["socket"]
      client.connect(`ws://${host}:${port}/connector/websocket/${socket}`);
    }
  })
}

var reconnectToWebSocket = function() {
  if (active_connection && active_connection.connected) {
    active_connection.close()
  }
  if (connectionTimeout){
    clearTimeout(connectionTimeout);
  }
  console.log(`Reconnecting in ${connectionCooldown} seconds.`)
  backoffCooldown()
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
      connectionCooldown = connectionCooldown * 2
    }
}

var sendMessageToSocket = function(connection, message) {
  if (connection.connected) {
      connection.sendUTF(message);
  } else {
      console.log("Unable to send message")
  }
}

var handleSocketConnection = function(connection) {
  active_connection = connection;
  resetCooldown();
  console.log('WebSocket Client Connected');
  hideConnectionSettings();
  updateStatusIndicator('active');
  updateTooltipText('connected');
  displayMessage('connected', 'info');

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
      displayMessage(message.utf8Data, "bot");
  }
}

var handleSocketClose = function() {
  console.log('echo-protocol Connection Closed');
  updateStatusIndicator('inactive')
  updateTooltipText('disconnected')
  reconnectToWebSocket()
  displayMessage('disconnected', 'info')
}

var handleSocketError = function(error) {
  console.log("Connection Error: " + error.toString());
  updateStatusIndicator('inactive')
  updateTooltipText('disconnected')
  displayMessage('connection error', 'info')
}

var checkForReturnInPrompt = function(event) {
  event.preventDefault();
  if (event.keyCode == 13) {
      sendUserMessage();
  }
}

var toggleConnectionSettings = function() {
  var connectionSettings = document.getElementById("connection-settings")
  connectionSettings.classList.toggle('active');
}

var hideConnectionSettings = function() {
  var connectionSettings = document.getElementById("connection-settings")
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

var populateHostPort = function() {
  if (settings.get("host", false)){
    document.getElementById("host").value = settings.get("host");
  }
  if (settings.get("port", false)){
    document.getElementById("port").value = settings.get("port");
  }
}

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
populateHostPort();
connectToWebsocket();
document.getElementById("input").focus();
