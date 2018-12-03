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

// application
$(document).ready(function() {
    // binding IPTV internal function
    $('.video-control-buttons').videoControl(_vv);

    $('.video-control-buttons').videoSource(_src);

    // for player debug & test
    vjs('iptv_player').ready(function() {
        console.log('video ready!');
        this.play();
    });

    vjs('iptv_player').on('ended', function() {
        console.log('Finished Playing.');
        // cancel FullScreen and click stop button when finished playing.
        vjs('iptv_player').cancelFullScreen();
        $('.iptv-button[data-color="red"]').click();
    });

    vjs('iptv_player').on('timeupdate', function() {
        // console.log( this.currentTime() );
        // console.log( this.duration() );
    });

    var firstPlay = true;
    vjs('iptv_player').on('play', function() {
        console.log('playing');

        // auto full screen
        // if (firstPlay) {
        //     firstPlay = false;
        //     if (!this.isFullScreen) {
        //         console.log('first play, request fullscreen after 3 secs.');
        //         setTimeout(function() { $('.iptv-button[data-color="green"]').click(); } , 3000 /* 3s */);
        //     }
        // }
    });
    vjs('iptv_player').on('pause', function() {
        console.log('pausing');
    });
    vjs('iptv_player').on('fullscreenchange', function() {
        console.log('fullscreenchange= ' + this.isFullScreen);
        $('.video-control-buttons').toggleClass('fullscreen', this.isFullScreen);
    });

    vjs('iptv_player').on('subtitlestrackchange', function() {
        console.log('subtitle change');
    });
});
