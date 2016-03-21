from channels import Group

# Connected to websocket.receive
def websocket_receive(message):
    Group('shared_canvas').send({
        'text': message.content['text']
    })

# Connected to websocket.connect
def websocket_connect(message):
    Group('shared_canvas').add(message.reply_channel)

# Connected to websocket.disconnect
def websocket_disconnect(message):
    Group('shared_canvas').discard(message.reply_channel)
