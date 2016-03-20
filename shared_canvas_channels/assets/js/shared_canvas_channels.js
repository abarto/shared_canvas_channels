$(function() {
    var token = null;

    var logEntryTemplate = Handlebars.compile($("[data-js-log-entry-template]").html());
    var $logEntries = $("[data-js-log-entries]");

    function writeLogEntry(message) {
        var $logEntry = logEntryTemplate({
            "timestamp": new Date().toUTCString(),
            "message": message
        });
        $logEntries.append($logEntry);
        $logEntries.scrollTop($logEntries.prop('scrollHeight'));
    }

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

    function handleLoginFail(jqXHR, textStatus, errorThrown) {
        console.log('fail', jqXHR, textStatus, errorThrown);
        $("[data-js-login-alert]").fadeIn(100).delay(2000).fadeOut(100);
    }

    function handleLoginDone(data, textStatus, jqXHR) {
        console.log('done', data, textStatus, jqXHR);

        token = data["token"];

        $('[data-js-login-form]').hide(
            100,
            function() {
                $('[data-js-canvas-container]').show(
                    100,
                    function() {
                        writeLogEntry("logged in successfully. token = " + JSON.stringify(data));
                    }
                );
            }
        );
    }

    var $sketchElement = $("[data-js-sketch]");
    $sketchElement.sketch();
    var sketch = $sketchElement.data("sketch");

    $.sketch.tools.marker.__original_draw = $.sketch.tools.marker.draw
    $.sketch.tools.marker.draw = function(action) {
        $.sketch.tools.marker.__original_draw.call(sketch, action);
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
