$(function() {
    var token = null;
    var socket = null;
    var sketch = null;

    function getCredentials() {
        return {
            "username": $("[data-js-username]").val(),
            "password": $("[data-js-password]").val()
        }
    }

    function obtainJwtToken(url, credentials, fail, done) {
        $.ajax({
            url: url,
            data: JSON.stringify(credentials),
            contentType: "application/json",
            method: "POST"
        })
        .fail(fail)
        .done(done);
    }

    function openWebSocket() {
        console.log('openWebSocket');

        socket = new WebSocket(
            webSocketUrl + "?" + $.param({"token": token, "reason": "auth"})
        );

        socket.onopen = function(event) {
            console.log("opopen", event);
        }
        socket.onmessage = function(event) {
            console.log("onmessage", event);
            touch = $.parseJSON(event.data);

            sketch.beginPath();
            sketch.moveTo( touch.ox, touch.oy );
            sketch.lineTo( touch.x, touch.y );
            sketch.stroke();
        }
        socket.onclose = function(event) {
            console.log("onclose", event);
        }
        socket.onerror = function(event) {
            console.log("onerror", event);
        }
    }

    function setUpSketch() {
        sketch = Sketch.create({
            container: $("[data-js-sketch]")[0],
            autoclear: false,

            setup: function() {
                this.fillStyle = this.strokeStyle = '#000000';
                this.lineCap = 'round';
                this.lineJoin = 'round';
                this.lineWidth = 5;
            },

            update: function() {
            },

            keydown: function() {
                if (this.keys.C) this.clear();
            },

            touchmove: function() {
                if (this.dragging) {
                    touch = this.touches[0];
                    if (socket !== null) {
                        touch["token"] = token;
                        socket.send(JSON.stringify(touch));
                    } else {
                        sketch.beginPath();
                        sketch.moveTo( touch.ox, touch.oy );
                        sketch.lineTo( touch.x, touch.y );
                        sketch.stroke();
                    }
                }
            }
        });
    }

    function handleLoginFail(jqXHR, textStatus, errorThrown) {
        console.log('fail', jqXHR, textStatus, errorThrown);
        $("[data-js-login-alert]").fadeIn(100).delay(2000).fadeOut(100);
    }

    function handleLoginDone(data, textStatus, jqXHR) {
        console.log('done', data, textStatus, jqXHR);

        token = data["token"];

        $('[data-js-center-container]').hide(
            100,
            function() {
                $('[data-js-sketch]').show(
                    100,
                    function() {
                        openWebSocket();
                        setUpSketch();
                    }
                );
            }
        );
    }

    $('[data-js-login-button]').click(function(event) {
        console.log('[data-js-login-button] click', event);
        event.preventDefault();

        obtainJwtToken(
            obtainJwtTokenUrl,
            getCredentials(),
            handleLoginFail,
            handleLoginDone
        );
    });
});
