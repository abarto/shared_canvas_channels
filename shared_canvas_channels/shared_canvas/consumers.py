import logging

from channels import Group

from .jwt_decorators import (
    jwt_request_parameter, jwt_message_text_field
)


logger = logging.getLogger(__name__)


# Connected to websocket.connect
@jwt_request_parameter
def websocket_connect(message):
    Group('shared_canvas').add(message.reply_channel)

# Connected to websocket.disconnect
def websocket_disconnect(message):
    Group('shared_canvas').discard(message.reply_channel)

# Connected to websocket.receive
@jwt_message_text_field
def websocket_receive(message):
    Group('shared_canvas').send({
        'text': message.content['text']
    })
