======================
shared_canvas_channels
======================

This project was coded to test how to use `JSON WebTokens <https://jwt.io/>`_ (JWT) authentication with a `Django channels <https://github.com/andrewgodwin/channels>`_ (with the `Redis <http://redis.io/>`_ layer) site. The motivation came from the fact that sometimes we're not allowed to use cookies or sessions on our projects. Luckily, there are several ways we can overcome this restriction, like token based authentication. JWT in particular is one possible solution that is pretty simple to deploy and maintain.

I'm using a `forked version <https://github.com/abarto/django-jwt-auth>`_ of `django-jwt-auth <https://github.com/jpadilla/django-jwt-auth>`_ that provides JWT authentication and allows for token refresh.

The application
===============

The sample application is a web based shared whiteboard using WebSockets for communication. The user provides her credentials that are used to request a JWT token which in turn used to open the WebSocket and to authenticate each individual message sent through it.

The decorators
==============

The authentication is provided by two decorators: @jwt_request_parameter and @jwt_message_text_field.

@jwt_request_parameter
----------------------

This decorator is used on HTTP channels that need to be authenticated using a request parameter. On the sample application we use it to control the access to the ``websocket.connect`` channel. When the user opens up the WebSocket, we verify that the "token" request parameter is present and it is still valid. If all the checks pass, the original consumer is invoked. Otherwise, the reply channel is closed:

::

    def jwt_request_parameter(func):
        """
        Checks the presence of a "token" request parameter and tries to
        authenticate the user based on its content.
        """
        @wraps(func)
        def inner(message, *args, **kwargs):
            # Taken from channels.session.http_session
            try:
                if "method" not in message.content:
                    message.content['method'] = "FAKE"
                request = AsgiRequest(message)
            except Exception as e:
                raise ValueError("Cannot parse HTTP message - are you sure this is a HTTP consumer? %s" % e)

            token = request.GET.get("token", None)
            if token is None:
                _close_reply_channel(message)
                raise ValueError("Missing token request parameter. Closing channel.")

            user = authenticate(token)

            message.token = token
            message.user = user

            return func(message, *args, **kwargs)
        return inner

@jwt_message_text_field
-----------------------

This decorator is used to authenticate each message received through the ``websocket.receive`` channel. We check that the ``text`` field in the message payload contains a ``token`` field and that its contents are a valid JWT token. If the token is valid, we invoke the wrapped consumer, otherwise we close the reply channel.

::

    def jwt_message_text_field(func):
        """
        Checks the presence of a "token" field on the message's text field and
        tries to authenticate the user based on its content.
        """
        @wraps(func)
        def inner(message, *args, **kwargs):
            message_text = message.get('text', None)
            if message_text is None:
                _close_reply_channel(message)
                raise ValueError("Missing text field. Closing channel.")

            try:
                message_text_json = loads(message_text)
            except ValueError:
                _close_reply_channel(message)
                raise

            token = message_text_json.pop('token', None)
            if token is None:
                _close_reply_channel(message)
                raise ValueError("Missing token field. Closing channel.")

            user = authenticate(token)

            message.token = token
            message.user = user
            message.text = dumps(message_text_json)

            return func(message, *args, **kwargs)
        return inner

Conclusion
==========

Although the authentication methods demonstrated in this project are specific to JWT, the same basic principles can be applied to other forms of authentication.

Vagrant
=======

A `Vagrant <https://www.vagrantup.com/>`_ configuration file is included if you want to test the project.

Feedback
========

Comments, issues and pull requests are welcome. Don't hesitate to contact me if you something a could have done better.
