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

/**
 * Caption
 */

var formatTime = function(timeline) {
    var minutes = (timeline / 60) >> 0;     // Math.floor()
    var seconds = (timeline % 60) >> 0;

    if (minutes < 10)
     minutes = '0' + minutes;

    if (seconds < 10)
     seconds = '0' + seconds;

    return minutes + ":" + seconds + ".000";
};

var Script = function(evt) {
    var vtt;

    vtt =
          '00:05.000 --> 00:10.000\n' +
          '<div class="alert alert-success">' +
          '    <button type="button" class="close fui-cross" data-dismiss="alert"></button>' +
          '    <h3>互動學習正在測試中</h3>' +
          '    <p>未來將會課程裡加入考題、程式作業等學習功能，敬請期待。</p>' +
          '</div>' +
          '\n\n';

    return vtt;
};
/**
 * translate JSON to WebVTT
  {
    "program_id": "12345",
    "caption": "ok",
    "fb_user_id": 612718132,
    "timeline": 6,
    "_id": "51a61abb8a76f78ea1000006",
    "date": "2013-05-29T15:11:55.761Z"
  },
  =======================================
  WEBVTT

  00:00.000 --> 00:10.000
  歡迎參加由 Moko365 所提供的線上課程



          <div class="alert alert-info">
            <button type="button" class="close fui-cross" data-dismiss="alert"></button>
            Your computer restarted <a href="#fakelink">because of a problem</a>. Sorry for any inconvenience and appreciate your patient.
          </div>

*/
exports.find = function(req, res, next) {
    var vtt = "";

    req.app.db.models.Program.findOne({lecture: req.query.lecture, isActive: true}, function(err, program) {
        if (err) return next(err);

        if (program === null) {
            return next({stack: 'missing program'});
        } else if(req.user) {
            req.app.db.models.Caption.find({
                program_id : program._id,
                isActive: true,
                'userCreated.id': req.user._id
            })
            .sort({timeline: 1})
            .exec(function(err, captions) {
                if (!err && captions.length > 0) {
                    var vtt = 'WEBVTT\n\n';

                    // 加入事先定義好的劇本
                    vtt = vtt +
                          Script({ program_id : req.query.program_id });

                    for (var i = 0; i < captions.length - 1; i++) {
                        vtt = vtt +
                              formatTime(captions[i].timeline) + ' --> ' + formatTime(captions[i+1].timeline) + '\n' +
                              '<div class="alert span4">' +
                              '<button type="button" class="close fui-cross" data-dismiss="alert"></button>' +
                              captions[i].caption +
                              '</div>' +
                              '\n\n';
                    }
                    i = captions.length - 1;  // the last
                    vtt = vtt +
                          formatTime(captions[i].timeline) + ' --> ' + formatTime(captions[i].timeline + 15) + '\n' +
                          '<div class="alert span4">' +
                          '<button type="button" class="close fui-cross" data-dismiss="alert"></button>' +
                          captions[i].caption +
                          '</div>' +
                          '\n\n';

                    res.send(vtt);
                } else {
                    res.send("");
                }
            });
        } else {
            res.send("");
        }
    });
};

exports.create = function(req, res, next) {
    req.app.db.models.Program.findOne({lecture: req.body.lecture, isActive: true}, function(err, program) {
        if (err) return next(err);

        if (program === null) {
            return next({stack: 'missing program'});
        } else {

        if (typeof(req.user) === "undefined") {
          return next({stack: 'not login'});
        }

            var fieldsToSet = {
                program_id: program._id,
                caption: req.body['caption'],
                timeline: req.body['timeline'],
                userCreated: {
                    id: req.user._id,
                    name: req.user.username,
                    time: new Date().toISOString()
                }
            };

            new req.app.db.models.Caption(fieldsToSet).save(function(err) {
                if (err) {
                    res.json(500, {error: 'create caption error: ' + fieldsToSet});
                } else {
                    res.json({ status: 'ok'});
                }
            });
        }
    });
};

// set active to false, do not really delete records.
exports.delete = function(req, res, next) {
    req.app.db.models.Caption.update({
        _id : req.body.id,
        'userCreated.id': req.user._id
    }, {
        isActive: false
    }, function(err, numAffected) {
        if (err) {
            res.json(500, {error: 'update note error: ' + req.body});
        } else {
            res.json({ status: 'ok'});
        }
    });
};
