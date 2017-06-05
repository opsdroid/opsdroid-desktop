'use strict';

export function formatPostUrl (host, port) {
  return `http://${host}:${port}/connector/websocket`;
}

export function formatSocketUrl (host, port, socket) {
  return `ws://${host}:${port}/connector/websocket/${socket}`;
}
