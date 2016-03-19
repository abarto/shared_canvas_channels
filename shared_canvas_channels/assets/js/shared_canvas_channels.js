$(function() {
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

    $('[data-js-login-button]').click(function(event) {
        console.log('[data-js-login-button] click', event);
        event.preventDefault();

        $('[data-js-login-form]').hide(
            100,
            function() {
                $('[data-js-canvas-container]').show(
                    100,
                    function() {
                        $('[data-js-sketch]').sketch();
                    }
                );
            }
        );
    });
});
