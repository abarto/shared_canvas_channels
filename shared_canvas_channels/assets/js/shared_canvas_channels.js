var token = null;
var socket = null;
var sketch = null;

$(function() {
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

    function refreshJwtToken(url, old_token, fail, done) {
        $.ajax({
            url: url,
            data: JSON.stringify({"token": old_token}),
            contentType: "application/json",
            method: "POST",
            beforeSend: function(jqXHR) {
                jqXHR.setRequestHeader("Authorization", "Bearer " + old_token);
            }
        })
        .fail(fail)
        .done(done);
    }

    function showDisconnectModal() {
        $("[data-js-disconnect-modal]").modal({"keyboard": false});
    }

    function hideDisconnectModal() {
        $("[data-js-disconnect-modal]").modal('hide');
    }

    function openWebSocket() {
        console.log('openWebSocket');

        socket = new WebSocket(
            webSocketUrl + "?" + $.param({"token": token})
        );

        socket.onopen = function(event) {
            console.log("opopen", event);
        }
        socket.onmessage = function(event) {
            console.log("onmessage", event);
            touch = $.parseJSON(event.data);

            sketch.beginPath();
            sketch.moveTo(touch.ox, touch.oy);
            sketch.lineTo(touch.x, touch.y);
            sketch.stroke();
        }
        socket.onclose = function(event) {
            console.log("onclose", event);
            showDisconnectModal();
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
        console.log('handleLoginFail', jqXHR, textStatus, errorThrown);
        $("[data-js-login-alert]").fadeIn(100).delay(2000).fadeOut(100);
    }

    function handleLoginDone(data, textStatus, jqXHR) {
        console.log('handleLoginDone', data, textStatus, jqXHR);

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

    function handleReconnectFail(jqXHR, textStatus, errorThrown) {
        console.log('handleReconnectFail', jqXHR, textStatus, errorThrown);
        $("[data-js-disconnect-message]").html('Unable to reconnect. Please check console logs.');
    }

    function handleReconnectDone(data, textStatus, jqXHR) {
        console.log('handleReconnectDone', data, textStatus, jqXHR);

        token = data["token"];
        hideDisconnectModal();
        openWebSocket();
    }

    $('[data-js-reconnect-button]').click(function(event) {
        console.log('[data-js-reconnect-button] click', event);
        event.preventDefault();

        refreshJwtToken(
            refreshJwtTokenUrl,
            token,
            handleReconnectFail,
            handleReconnectDone
        );
    });

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
