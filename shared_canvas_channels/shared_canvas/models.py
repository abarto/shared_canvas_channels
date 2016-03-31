from __future__ import unicode_literals

from django.conf import settings
from django.db import models
from django.utils.text import Truncator

class Message(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, editable=False)
    created = models.DateTimeField(auto_now_add=True, editable=False)
    text = models.CharField(max_length=1024, editable=False)

    def __unicode__(self):
        return 'created: {created}, user: {user}, text: {text}'.format(
            created=self.created,
            user=self.user.username,
            text=Truncator(self.text).chars(50)
        )
