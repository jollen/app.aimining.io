$(document).ready(function() {

    var iframe = $('#pPlayer')[0];
    var player = $f(iframe);
    player.addEvent('ready', function() {});

    function addEvent(element, eventName, callback) {
        if (element.addEventListener) {
            element.addEventListener(eventName, callback, false);
        } else {
            element.attachEvent(eventName, callback, false);
        }
    }


    $('#play').click(function(evt) {
        evt.preventDefault();
        $('.mask').fadeIn('slow');
        $('.popup-video').fadeIn('slow');
        player.api('play')
        $('.mask').click(function() {
            player.api('pause');
            $('.popup-video').fadeOut('slow');
            $('.mask').fadeOut('slow');

        });
    });

    $('.content-23').each(function() {
        $(this).parallax('50%', 0.3, true);
    });
});
