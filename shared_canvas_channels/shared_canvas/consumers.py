import logging

from channels import Group, Channel
from json import loads

from .jwt_decorators import (
    jwt_request_parameter, jwt_message_text_field
)
from .models import Message


logger = logging.getLogger(__name__)


# Connected to websocket.connect
@jwt_request_parameter
def websocket_connect(message):
    logger.debug('websocket_connect. message = %s', message)

    Group('shared_canvas').add(message.reply_channel)

# Connected to websocket.disconnect
def websocket_disconnect(message):
    logger.debug('websocket_disconnect. message = %s', message)

    Group('shared_canvas').discard(message.reply_channel)

# Connected to websocket.receive
@jwt_message_text_field
def websocket_receive(message):
    logger.debug('websocket_receive. message = %s', message)

    Group('shared_canvas').send({
        'text': message.content['text']
    })
    Channel('save_message').send({
        'user_id': message.user.id,
        'text': message.content['text']
    })

# Connected to save_message
def save_message(message):
    logger.debug('save_message. message = %s', message)
    Message.objects.create(**message.content)
