from shared_canvas.consumers import (
    websocket_connect, websocket_disconnect, websocket_receive
)

channel_routing = {
    'websocket.connect': websocket_connect,
    'websocket.disconnect': websocket_disconnect,
    'websocket.receive': websocket_receive
}
