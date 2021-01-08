import {
  getOpenWebSocket,
  makeRemoveListener,
  closeWebSocket,
} from "../utils.js"

function webSocketListenEffect(dispatch, props) {
  var connection = getOpenWebSocket(props)
  var removeListen = makeRemoveListener(
    connection.socket,
    dispatch,
    props.action,
    "message"
  )
  connection.listeners.push(removeListen)
  var removeError
  if (props.error) {
    removeError = makeRemoveListener(
      connection.socket,
      dispatch,
      props.error,
      "error"
    )
    connection.listeners.push(removeError)
  }
  var removeOpen
  if (props.open) {
    removeOpen = makeRemoveListener(
      connection.socket,
      dispatch,
      props.open,
      "open"
    )
    connection.listeners.push(removeOpen)
  }
  var removeClose
  if (props.close) {
    removeClose = makeRemoveListener(
      connection.socket,
      dispatch,
      props.close,
      "close"
    )
    connection.listeners.push(removeClose)
  }

  return function () {
    removeListen && removeListen()
    removeError && removeError()
    removeOpen && removeOpen()
    removeClose && removeClose()
    connection.listeners = connection.listeners.filter(function (listener) {
      return (
        listener !== removeListen &&
        listener !== removeError &&
        listener !== removeOpen &&
        listener !== removeClose
      )
    })
    if (connection.listeners.length === 0) {
      closeWebSocket(props)
    }
  }
}

/**
 * Describes an effect that will open a [`WebSocket`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket) connection for a given URL and optional protocols. Connections will remain open until the last subscription for that URL are cancelled.
 *
 * @memberof module:subs
 * @param {object} props
 * @param {string} props.url - The URL to which to connect; this should be the URL to which the WebSocket server will respond
 * @param {string | string[]} props.protocols - Either a single protocol string or an array of protocol strings. These strings are used to indicate sub-protocols, so that a single server can implement multiple WebSocket sub-protocols (for example, you might want one server to be able to handle different types of interactions depending on the specified `protocol`). If you don't specify a protocol string, an empty string is assumed.
 * @param {*} props.action - action to call with new incoming messages
 * @param {*} props.error - action to call if an error occurs
 * @param {*} props.ws_constructor - an optional replacement for the WebSocket constructor
 * @param {*} props.open - action to call when the socket is opened
 * @param {*} props.close - action to call when the socket is closed
 * @example
 * import { WebSocketListen } from "hyperapp-fx"
 *
 * const WebSocketSub = WebSocketListen({
 *   url: "wss://example.com",
 *   action: ReceivedMessageAction
 * })
 */
export function WebSocketListen(props) {
  return [webSocketListenEffect, props]
}
