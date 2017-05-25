//////
// Imports
var WebSocketClient = require('websocket').client;
var request = require('request');

//////
// Global variables
var active_connection = undefined;
var url = 'http://localhost:8080/connector/websocket'
var client = new WebSocketClient();
var connectionCooldown = 1;

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
  request.post(url, function(error, response, body){
    if (error){
      console.log(error)
      updateTooltipText('disconnected')
      reconnectToWebSocket()
    } else {
      socket = JSON.parse(body)["socket"]
      client.connect(`ws://localhost:8080/connector/websocket/${socket}`);
    }
  })
}

var reconnectToWebSocket = function() {
  console.log(`Reconnecting in ${connectionCooldown} seconds.`)
  backoffCooldown()
  setTimeout(connectToWebsocket, connectionCooldown * 1000);
}

var resetCooldown = function() {
  connectionCooldown = 1;
}

var backoffCooldown = function(){
    if (connectionCooldown < 60){
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
  active_connection = connection
  resetCooldown()
  console.log('WebSocket Client Connected');
  updateStatusIndicator('active')
  updateTooltipText('connected')
  displayMessage('connected', 'info')

  connection.on('error', handleSocketError);
  connection.on('close', handleSocketClose);
  connection.on('message', handleSocketMessage);
}

var handleSocketFailedConnection = function(error) {
  console.log('Connect Error: ' + error.toString());
  reconnectToWebSocket()
}

var handleSocketMessage = function(message) {
  if (message.type === 'utf8') {
      displayMessage(message.utf8Data, "bot")
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

//////
// Event listeners
client.on('connect', handleSocketConnection);
client.on('connectFailed', handleSocketFailedConnection);
document.getElementById("send").addEventListener("click", sendUserMessage);
document.getElementById("input").addEventListener("keyup", checkForReturnInPrompt);

//////
// Start
connectToWebsocket();
document.getElementById("input").focus();
