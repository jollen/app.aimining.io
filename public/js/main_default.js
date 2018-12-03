/**
Copyright (C) 2013 Moko365 Inc. All Rights Reserved. 

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at 

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software 
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and 
limitations under the License.
*/

// IPTV main application
(function($) {

    // follow button handler
    $('.follow-btn').on('click', function(e) {
        e.preventDefault();
        var me = $(this);
        var isFollowed = me.data('followed');
        $.ajax({
            type: "PUT",
            url: '/api/lesson/' + (isFollowed ? 'unfollow' : 'follow'),
            data: 'lid=' + me.data('lid'),
            success: function( response ) {
                if (response.success) {
                    me.data('followed', !isFollowed);
                    me.html('&nbsp;' + (!isFollowed ? 'Unfollow' : 'Follow'));
                } else {
                    alert('你必須登入來使用 Follow課程的功能');
                }
            }
        });
    });

    if ($('.video-control-buttons')[0]) {
        // binding IPTV internal function
        $('.video-control-buttons').videoControl(_vv);
        $('.video-control-buttons').videoSource(_src);

        $('.video-note').on('click', function() {
            vjs('iptv_player').pause();
        });

        // binding switch buttons (Note|Interactive|Camera)
        $(document).toggleSwitches();

        // for player debug & test
        vjs('iptv_player').ready(function() {
            console.log('video ready!');
            // this.play();

            // Show caption
            this.showTextTrack(lecture, 'subtitles');
        });

        vjs('iptv_player').on('ended', function() {
            console.log('Finished Playing.');
            $('#switchArea').fadeIn('slow');                       
            
            // cancel FullScreen and click stop button when finished playing.
            vjs('iptv_player').cancelFullScreen();
            $('.iptv-button[data-color="red"]').click();
        });

        vjs('iptv_player').on('timeupdate', function() {
            // console.log( this.currentTime() );
            // console.log( this.duration() );
        });

        vjs('iptv_player').on('play', function() {
            console.log('playing');
            $('#switchArea').fadeOut('slow');
        });
        vjs('iptv_player').on('pause', function() {
            console.log('pausing');
            $('#switchArea').fadeIn('slow');                       
        });
        vjs('iptv_player').on('fullscreenchange', function() {
            console.log('fullscreenchange= ' + this.isFullScreen);
            $('.video-control-buttons').toggleClass('fullscreen', this.isFullScreen);
        });

        vjs('iptv_player').on('subtitlestrackchange', function() {
            console.log('subtitle change');
        });
    }
}) (jQuery);
