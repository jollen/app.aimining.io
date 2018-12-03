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

// File: h762plus.prototype.js
function IPTVControllerLink() {
    this.imageTag = "";

    this.createTag = function(text, cellSize, typeNumber, errorCorrectLevel) {
        var qr = qrcode(typeNumber || 4, errorCorrectLevel || 'M');
        qr.addData(text);
        qr.make();
        this.imageTag = qr.createImgTag(cellSize || 4);
    };

    this.getImageTag = function() {
        return this.imageTag;
    };
}

function IPTVWebSocket(uri) {
    var o = new WebSocket(uri, "iptv-control");
    return o;
}

function IPTVControls(jsonData) {
    this.buttonStateJson = jsonData;
    this.currentButtonPressed = "red";
    this.currentState = "play";

    this.notify = function(btn) {
        this.currentButtonPressed = btn;
    };

    this.getCallback = function() {
        console.log('pressed= ' + this.currentButtonPressed);
        console.log('currentState= ' + this.currentState);
        console.log('callback= ' + this.buttonStateJson[this.currentState].buttons[this.currentButtonPressed].callback);

        // Get current callback
        var cb = this.buttonStateJson[this.currentState].buttons[this.currentButtonPressed].callback;

        // State transittion
        var state = this.buttonStateJson[this.currentState].buttons[this.currentButtonPressed].state;

        if (state !== null) {
            this.currentState = state;
            console.log('newState= ' + this.currentState);
        }

        return cb;
    };

    this.getTitle = function() {
        return this.buttonStateJson[this.currentState].buttons[this.currentButtonPressed].title;
    };

    this.getTitle = function(color) {
        return this.buttonStateJson[this.currentState].buttons[color].title;
    };
}

function IPTVVideo() {
    var instance = new Object();
    var videoPlayer;

    // constructor
    IPTVVideo = function IPTVVideo () {
        // init HTML5 video player
        videoPlayer = vjs("iptv_player");

        return instance;
    };

    IPTVVideo.prototype = this;
    instance = new IPTVVideo();

    instance.constructor = IPTVVideo;

    // Start to build
    // Nothing to build now.

    // public method
    instance.src = function(videoSrc) {
        // load video source
        videoPlayer.src(videoSrc);
    };

    instance.play = function() {
        videoPlayer.play();
    };

    instance.pause = function() {
        videoPlayer.pause();
    };

    instance.stop = function() {
        videoPlayer.pause();
        videoPlayer.currentTime(0);
    };

    instance.requestFullScreen = function() {
        videoPlayer.requestFullScreen();
    };

    instance.cancelFullScreen = function() {
        videoPlayer.cancelFullScreen();
    };

    instance.currentTime = function() {
        return videoPlayer.currentTime();
    };

    instance.share = function() {
        // share
    };

    instance.textTracks = function(url) {
        $('#iptv_player track').attr('src', 'url');
    };

    return instance;
}

// End of file: h762plus.prototype.js
