import os
from channels.asgi import get_channel_layer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "shared_canvas_channels.settings")

channel_layer = get_channel_layer()
