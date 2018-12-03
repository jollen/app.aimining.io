(function( $ ) {
    // use H.762+: IPTVVideo
    var videoObj;
    var videoCtl;
    var videoWs;
    var controllerLink;

    // remote controller token
    var controllerToken;
    var controllerTokenContent = $('.iptv-controller-token');

    $.fn.videoSource = function (videoSrc) {
        videoObj.src(videoSrc);
        requestInvalidate();
    };

    $.fn.videoPlay = function () {
        videoObj.play();
    };

    $.fn.videoPause = function() {
        videoObj.pause();
    };

    $.fn.videoStop = function() {
        videoObj.stop();
    };

    $.fn.requestFullScreen = function() {
        videoObj.requestFullScreen();
    };

    $.fn.cancelFullScreen = function() {
        videoObj.cancelFullScreen();
    };

    $.fn.toggleFullScreen = function() {
        if ($('.vjs-fullscreen').length) videoObj.cancelFullScreen();
        else videoObj.requestFullScreen();
    };

   /**
     * There are 3 types of switches:
     *  - Note
     *  - Interactive
     *  - Camera
     */
    $.fn.toggleSwitches = function() {
        $("input[data-toggle='switch']").each(function() {
            var me = $(this);
            console.log('binding switch buttons: ' + me.data('switch'));
            me.on('change', function() {
                var switchType = me.data('switch');

                if (switchType === 'Note') {
                    console.log('switchType is Note, checked = ' + this.checked);
                    vjs('iptv_player').showTextTrack(this.checked ? lecture : null, 'subtitles');
                } else if (switchType === 'Interactive') {
                    console.log('switchType is Interactive, checked = ' + this.checked);
                } else if (switchType === 'Camera') {
                    console.log('switchType is Camera, checked = ' + this.checked);
                } else {
                    console.log('unknow switch type');
                }
            });
        });
    };

    $.fn.videoNote = function() {
        var me = $(this);
        var note = me.prop('value');
        if (note.length > 0) {
            $.ajax({
                type: "POST",
                url: '/api/caption/create',
                data: 'lecture=' + lecture +
                    '&caption=' + note +
                    '&timeline=' +  Math.ceil(videoObj.currentTime()),
                success: function( response ) {
                    me.prop('value', '');
                    vjs('iptv_player').play();
                    vjs('iptv_player').reloadTextTrack(lecture);
                    // show hint
                    $('#doneNoteHint .alert').fadeIn('fast');
                    setTimeout(function() { $('#doneNoteHint .alert').fadeOut('slow'); } , 5000);
                }
            });
        }
    };

    // private method
    requestInvalidate = function() {
        $('.iptv-button').each(function() {
            var me = $(this);

            var color = me.data('color');
            var title = videoCtl.getTitle(color);

            me.find('.iptv-button-title').html(title);
        });
    };

    // private method
    function createControllerLink() {
        controllerLink = new IPTVControllerLink();

        // create a CR code image for this link
        controllerLink.createTag("http://go8panel.com/c/?token=" + controllerToken, 8);

        // get <img> html code
        var html_code = controllerLink.getImageTag();

        // show qr code image
        controllerTokenContent.html(html_code);
    }

    $.fn.videoControl = function(btnData) {
        videoObj = new IPTVVideo();
        videoCtl = new IPTVControls(btnData);

        var isLocal = /\.local$/.test(window.location.hostname) || /^localhost$/.test(window.location.hostname);
        var WsUrl = (isLocal) ? "ws://localhost:8080/" : "ws://go8panel.com:8080/";
        videoWs  = IPTVWebSocket(WsUrl);

        var buttons = this;
        var timer;

        // handle websocket
        videoWs.onopen = function() {
            console.log('WebSocket Open');
        };
        videoWs.onclose = function() {
            console.log('WebSocket Closed');
        };
        videoWs.onerror = function() {
            console.log('WebSocket Error');
        };
        videoWs.onmessage = function(message) {
           var json = JSON.parse(message.data);

           if (json.type === 'buttons') {
                clearTimeout(timer);

                if (!buttons.hasClass('fullscreen') || (buttons.hasClass('fullscreen') && buttons.hasClass('animated')) ) {
                   var color = json.data.color;

                   videoCtl.notify(color);
                   var callback = videoCtl.getCallback();

                   if (typeof(callback) === 'function') {
                       callback();
                   }

                   if (buttons.hasClass('fullscreen')) {
                       var clickedButton = $('.iptv-button[data-color="'+color+'"] .btn');
                       clickedButton.addClass('animated hinge');
                       setTimeout(function() {
                            // clickedButton.removeClass('animated hinge');
                            $('.video-control-buttons').addClass('animated fadeOut');

                            setTimeout(function() {
                                clickedButton.removeClass('animated hinge');
                                $('.video-control-buttons').removeClass('animated fadeOut');

                                requestInvalidate(); // invalidate views
                            }, 800);
                       }, 800);
                   } else {
                      requestInvalidate();
                   }
                } else {
                   buttons.addClass('animated fadeIn');
                   timer = setTimeout(function() {
                       buttons.removeClass('animated fadeIn');
                       buttons.addClass('animated fadeOut');
                       setTimeout(function() {
                           buttons.removeClass('animated fadeOut');
                       }, 500);
                   }, 5000);
                }
           } else if (json.type === 'token') {
               controllerToken = json.token;
               createControllerLink();
           }
        };

        // for test
        $('.iptv-button').each(function() {
            var me = $(this);
            me.on('click', function() {
                var color = me.data('color');

                // model
                videoCtl.notify(color); // transit to next state

                // data
                var callback = videoCtl.getCallback(); // get my callback

                if (typeof(callback) === 'function') {
                    callback();
                }

                // view
                requestInvalidate(); // invalidate views
            });
        });
    };

})( jQuery );
