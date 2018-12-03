/**
 * Copyright (C) 2013 Google Inc. All Rights Reserved. 
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at 
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and 
 * limitations under the License.
 */

/**
 * @constructor
 * @param {angular.Scope} $scope The scope.
 */
function DemoAppCtrl($scope) {
  /**
   * @type {{info: function(string)}}
   * @private
   */
  this.logger_ = {'info':
    /**
     * @param {string} message The message to log.
     */
    function(message) {
      console.info('[DemoAppCtrl] ' + message);
    }
  };

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  // Use model to work around Angular's auto created scope problem.
  this.scope_.model = {};

  /**
   * @type {?cast.Api}
   * @private
   */
  this.castApi_ = null;

  /**
   * @type {Array.<cast.Receiver>}
   * @private
   */
  this.receiverList_ = [];

  /**
   * @type {?string}
   * @private
   */
  this.activityId_ = null;

  /**
   * @type {?string}
   * @private
   */
  this.activityStatus_ = null;

  /**
   * @type {number}
   * @private
   */
  this.mediaVolume_ = 0.5;

  /**
   * @type {cast.MediaPlayerStatus}
   * @private
   */
  this.mediaStatus_ = null;

  /**
   * @type {?string}
   * @private
   */
  this.errorMessage_ = null;

  this.scope_.activityTypes = ['YouTube', 'Receiver SDK Demo',
                               'HTML5 Video Playback', 'Tab Mirroring'];
  this.init_();
}

/**
 * @private
 */
DemoAppCtrl.prototype.init_ = function() {
  this.scope_.setVideoSrc = function() {
    document.getElementById('video').src = this.scope_.model.videoUrl;
  }.bind(this);
  this.scope_.launchActivityAt = this.launchActivityAt_.bind(this);
  this.scope_.stopActivity = this.stopActivity_.bind(this);
  this.scope_.playMedia = this.playMedia_.bind(this);
  this.scope_.pauseMedia = this.pauseMedia_.bind(this);
  this.scope_.muteMedia = this.muteMedia_.bind(this);
  this.scope_.unmuteMedia = this.unmuteMedia_.bind(this);
  this.scope_.getActivityStatus = this.getActivityStatus_.bind(this);
  this.scope_.getMediaStatus = this.getMediaStatus_.bind(this);
  this.scope_.$watch('model.mediaVolume', function() {
    this.mediaVolume_ = this.scope_.model.mediaVolume;
    this.setMediaVolume_(this.mediaVolume_);
  }.bind(this));

  this.updateScopeVariable_();

  window.addEventListener('message', this.onWindowMessage_.bind(this), false);

  this.scope_.$watch('model.activitySelection', function(newValue, oldValue) {
    if (JSON.stringify(oldValue) != JSON.stringify(newValue)) {
      this.addReceiverListener_();
      this.updateScopeVariable_();
    }
  }.bind(this));
};

/**
 * @private
 */
DemoAppCtrl.prototype.updateScopeVariable_ = function() {
  var doUpdate = function() {
    this.scope_.model.activitySelection =
        this.scope_.model.activitySelection || 'YouTube';
    this.scope_.model.videoUrl = this.scope_.model.videoUrl ||
        'http://media.w3.org/2010/05/sintel/trailer.mp4';
    this.scope_.castApiDetected = this.castApi_ != null;
    this.scope_.model.ytVideoId =
        this.scope_.model.ytVideoId || 'MJyJKwzxFpY';
    this.scope_.model.mediaVolume = this.mediaVolume_;
    this.scope_.receiverList = this.receiverList_;
    this.scope_.showActivityControls = this.activityId_ != null;
    this.scope_.errorMessage = this.errorMessage_;
    this.scope_.activityStatus = this.activityStatus_;
    this.scope_.mediaStatus = this.mediaStatus_;

    if (this.mediaStatus_ && this.mediaStatus_.hasPause != undefined) {
      this.scope_.hasPause = this.mediaStatus_.hasPause;
    } else {
      // Default to true.
      this.scope_.hasPause = true;
    }
  }.bind(this);

  if (this.scope_.$$phase) {
    doUpdate();
  } else {
    this.scope_.$apply(doUpdate);
  }
};

/**
 * Handles message from window.
 * <p>
 * When cast API hello message is detected, create cast API instance.
 * @param {Event} event The event.
 * @private
 */
DemoAppCtrl.prototype.onWindowMessage_ = function(event) {
  if (event.source != window) {
    return;
  }

  if (!event.data || !event.data.source || !event.data.event ||
      event.data.source != cast.NAME || event.data.event != 'Hello') {
    return;
  }

  // Get cast API hello message.
  // TODO: check api_version
  this.castApi_ = new cast.Api();
  this.castApi_.logMessage('Get cast API hello message.');
  this.addReceiverListener_();
  this.updateScopeVariable_();
};

/**
 * @private
 */
DemoAppCtrl.prototype.addReceiverListener_ = function() {
  var appName = null;
  switch (this.scope_.model.activitySelection) {
    case 'YouTube':
      appName = 'YouTube';
      break;
    case 'Tab Mirroring':
    case 'HTML5 Video Playback':
      appName = 'ChromeCast';
      break;
    case 'Receiver SDK Demo':
      appName = 'Fling';
      break;
  }
  if (appName) {
    this.castApi_.addReceiverListener(appName,
        this.onReceiverUpdate_.bind(this));
  }
};

/**
 * Handles receiver update from cast api.
 * @param {Array.<cast.Receiver>} receivers The receiver list.
 * @private
 */
DemoAppCtrl.prototype.onReceiverUpdate_ = function(receivers) {
  this.castApi_.logMessage('Get receiver list.');
  this.receiverList_ = receivers;
  this.updateScopeVariable_();
};

/**
 * @param {string} originalAction The original action that will cause callback.
 * @return {function(cast.ActivityStatus)} A result callback.
 * @private
 */
DemoAppCtrl.prototype.getResultCallback_ = function(originalAction) {
  return function(status) {
    if (status.status == 'error') {
      this.errorMessage_ = status.errorString;
    } else {
      switch (originalAction) {
        case 'stopActivity':
          this.activityId_ = null;
          break;
        case 'getActivityStatus':
          this.activityStatus_ = status.status;
          break;
        case 'launchActivity':
          this.activityId_ = status.activityId;
          // After launch succeeds, get media status immediately, which has
          // 'hasPause' field.
          this.getMediaStatus_();
          break;
      }
    }
    this.updateScopeVariable_();
  }.bind(this);
};

/**
 * @param {string} originalAction The original action that will cause callback.
 * @return {function(cast.MediaResult)} A result callback.
 * @private
 */
DemoAppCtrl.prototype.getMediaResultCallback_ = function(originalAction) {
  return function(result) {
    if (!result.success) {
      this.errorMessage_ = result.errorString;
    } else {
      switch (originalAction) {
        case 'playMedia':
        case 'pauseMedia':
        case 'muteMedia':
        case 'loadMedia':
        case 'unmuteMedia':
        case 'setMediaVolume':
        case 'getMediaStatus':
          this.mediaStatus_ = result.status;
          break;
      }
    }
    this.updateScopeVariable_();
  }.bind(this);
};

/**
 * Handles stop-activity user requests.
 * @private
 */
DemoAppCtrl.prototype.stopActivity_ = function() {
  if (!this.activityId_) {
    return;
  }

  this.castApi_.stopActivity(this.activityId_,
      this.getResultCallback_('stopActivity'));
};

/**
 * Handles play user requests.
 * @private
 */
DemoAppCtrl.prototype.playMedia_ = function() {
  if (!this.activityId_) {
    return;
  }
  this.castApi_.playMedia(
      this.activityId_,
      new cast.MediaPlayRequest(),
      this.getMediaResultCallback_('playMedia'));
};

/**
 * Handles pause user requests.
 * @private
 */
DemoAppCtrl.prototype.pauseMedia_ = function() {
  if (!this.activityId_) {
    return;
  }
  this.castApi_.pauseMedia(this.activityId_,
      this.getMediaResultCallback_('pauseMedia'));
};

/**
 * Handles mute user requests.
 * @private
 */
DemoAppCtrl.prototype.muteMedia_ = function() {
  if (!this.activityId_) {
    return;
  }
  this.castApi_.setMediaVolume(
      this.activityId_,
      new cast.MediaVolumeRequest(this.mediaVolume_, true),
      this.getMediaResultCallback_('muteMedia'));
};

/**
 * Handles unmute user requests.
 * @private
 */
DemoAppCtrl.prototype.unmuteMedia_ = function() {
  if (!this.activityId_) {
    return;
  }
  this.castApi_.setMediaVolume(
      this.activityId_,
      new cast.MediaVolumeRequest(this.mediaVolume_, false),
      this.getMediaResultCallback_('unmuteMedia'));
};

/**
 * Handles set volume user requests.
 * @private
 */
DemoAppCtrl.prototype.setMediaVolume_ = function() {
  if (!this.activityId_) {
    return;
  }
  this.castApi_.setMediaVolume(
      this.activityId_,
      new cast.MediaVolumeRequest(this.mediaVolume_, false),
      this.getMediaResultCallback_('setMediaVolume'));
};

/**
 * Handles get-media-status user requests.
 * @private
 */
DemoAppCtrl.prototype.getMediaStatus_ = function() {
  if (!this.activityId_) {
    return;
  }

  this.castApi_.getMediaStatus(this.activityId_,
      this.getMediaResultCallback_('getMediaStatus'));
};

/**
 * Handles get-activity-status user requests.
 * @private
 */
DemoAppCtrl.prototype.getActivityStatus_ = function() {
  if (!this.activityId_) {
    return;
  }

  this.castApi_.getActivityStatus(this.activityId_,
      this.getResultCallback_('getActivityStatus'));
};

/**
 * Play video at selected receiver.
 * @param {cast.Receiver} receiver The receiver.
 * @private
 */
DemoAppCtrl.prototype.launchActivityAt_ = function(receiver) {
  this.errorMessage_ = '';
  this.activityStatus_ = '';
  this.mediaStatus_ = null;
  if (this.activityId_) {
    this.stopActivity_();
  }

  if (!this.scope_.model.ytVideoId ||
      this.scope_.model.ytVideoId.length == 0) {
    return;
  }

  var resultCallback = this.getResultCallback_('launchActivity');

  switch (this.scope_.model.activitySelection) {
    case 'YouTube':
      this.launchYoutube_(receiver, resultCallback);
      break;
    case 'Tab Mirroring':
      this.launchTabMirror_(receiver, resultCallback);
      break;
    case 'Receiver SDK Demo':
      this.launchReceiverSdkDemo_(receiver,
                                  this.getMediaResultCallback_('loadMedia'));
      break;
    case 'HTML5 Video Playback':
      this.launchVideoPlayback_(receiver, resultCallback);
      break;
    default:
      this.castApi_.logMessage('Unknown activity type');
  }
};

/**
 * @param {cast.Receiver} receiver The receiver.
 * @param {!function(cast.ActivityStatus)} resultCallback The result callback.
 * @private
 */
DemoAppCtrl.prototype.launchYoutube_ = function(receiver, resultCallback) {
  var request = new cast.LaunchRequest('YouTube', receiver);
  request.parameters = 'v=' + this.scope_.model.ytVideoId;

  this.castApi_.launch(request, resultCallback);
};

/**
 * @param {cast.Receiver} receiver The receiver.
 * @param {!function(cast.ActivityStatus)} resultCallback The result callback.
 * @private
 */
DemoAppCtrl.prototype.launchTabMirror_ = function(receiver, resultCallback) {
  var request = new cast.LaunchRequest('mirror_tab', receiver);
  this.castApi_.launch(request, resultCallback);
};

/**
 * @param {cast.Receiver} receiver The receiver.
 * @param {!function(cast.ActivityStatus)} resultCallback The result callback.
 * @private
 */
DemoAppCtrl.prototype.launchVideoPlayback_ = function(receiver,
    resultCallback) {
  var videoElement = document.getElementById('video');
  if (!videoElement.currentSrc || videoElement.currentSrc.length == 0) {
    this.castApi_.logMessage('No video source');
    return;
  }

  videoElement.pause();
  var request = new cast.LaunchRequest('video_playback', receiver);
  request.parameters = {
    videoUrl: videoElement.currentSrc,
    currentTime: videoElement.currentTime,
    duration: 0,
    paused: false, //request play
    muted: videoElement.muted,
    volume: 0.8
  };

  this.castApi_.launch(request, resultCallback);
};

/**
 * @param {cast.Receiver} receiver The receiver.
 * @param {!function(cast.MediaResult)} resultCallback The result callback.
 * @private
 */
DemoAppCtrl.prototype.launchReceiverSdkDemo_ = function(receiver,
    resultCallback) {
  var videoElement = document.getElementById('video');
  if (!videoElement.currentSrc || videoElement.currentSrc.length == 0) {
    this.castApi_.logMessage('No video source');
    return;
  }

  videoElement.pause();
  var launchRequest = new cast.LaunchRequest('Fling', receiver);
  launchRequest.parameters =
      'http://www.gstatic.com/eureka/html/chromekey_player.html';

  var loadRequest = new cast.MediaLoadRequest(videoElement.currentSrc);
  loadRequest.title = videoElement.currentSrc;
  loadRequest.src = videoElement.currentSrc;
  loadRequest.position = videoElement.currentTime;
  loadRequest.autoplay = true;

  this.castApi_.launch(launchRequest, function(status) {
    if (status.status == 'running') {
      this.activityId_ = status.activityId;
      this.castApi_.loadMedia(status.activityId,
                              loadRequest,
                              resultCallback);
    } else {
      this.castApi_.logMessage('Launch failed: ' + status.errorString);
    }
  }.bind(this));
};
