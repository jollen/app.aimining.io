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

var cache = require('restful-cache');

exports.info = function(req, res, next) {

    var workflow = new req.app.utility.Workflow(req, res);

    workflow.on('validate', function() {
        if(!req.query.name) return workflow.emit('exception', 'missing parameters');

        workflow.emit('listOneLesson');
    });

    workflow.on('listOneLesson', function() {
        req.app.db.models.Lesson.findOne({ name: req.query.name }).exec(function(err, lesson) {
            if (err) return workflow.emit('exception', err);
            if (!lesson) return workflow.emit('exception', 'missing lesson');

            workflow.outcome.lesson = {
                sessions: lesson.programs.length,    // how many sessions
                followers: lesson.followers.length,  // how many followers
            };

            return workflow.emit('response');
        });
    });

    workflow.emit('validate');
};

exports.progress = function(req, res, next) {

    var workflow = new req.app.utility.Workflow(req, res);

    workflow.on('validate', function() {
        if (!req.query.name) return workflow.emit('exception', 'missing parameters');

        workflow.emit('getLesson');
    });

    workflow.on('getLesson', function() {
        req.app.db.models.Lesson.findOne({ name: req.query.name}, 'name category programs').exec(function(err, lesson) {
            if (err) return workflow.emit('exception', err);
            if (!lesson) return workflow.emit('missing lesson', err);

            lesson.populate('category programs', 'name lecture', function(err, category) {
                workflow.lesson = lesson
                workflow.emit('fetchViewHistory');
            });
        });
    });

    workflow.on('fetchViewHistory', function() {
        var lectures = workflow.lesson.programs.map(function(program) {
            return program.lecture;
        });

        var regexp = require('util').format('^\/course\/%s\/%s\/(%s)',
            workflow.lesson.category.name,
            req.query.name,
            lectures.join('|')
        );

        req.app.db.models.ViewHistory.distinct('path', {
            path: {
                $regex: regexp
            },
            'userCreated.id': req.user._id
        }).exec(function(err, history) {
            workflow.outcome.views = history.length; // how many has already viewed
            workflow.outcome.sessions = lectures.length;  // how many sessions (program videos)

            workflow.emit('response');
        });
    });

    return workflow.emit('validate');
};

exports.isfollowed = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);

    // Check if user follow this lesson
    req.app.db.models.Lesson.findOne({ name: req.query.lesson }).exec(function(err, lesson) {
        if (err) return workflow.emit('exception', err);

        if (!lesson) return workflow.emit('exception', 'missing lesson');

        workflow.outcome.isfollowed = (lesson.followers.indexOf(req.user.id) !== -1);
        return workflow.emit('response');
    });

    return workflow.emit('validate');
};

exports.follow = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);

    workflow.on('followLesson', function() {
        var fieldsToSet = {
            $addToSet: { followers: req.user.id }
        };

        req.app.db.models.Lesson.findByIdAndUpdate(req.body.lid, fieldsToSet).exec(function(err, lesson) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.lesson = lesson;
            return workflow.emit('response');
        });
    });

    workflow.emit('followLesson');
};

exports.unfollow = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);

    workflow.on('unfollowLesson', function() {
        var fieldsToSet = {
            $pull: { followers: req.user.id }
        };

        req.app.db.models.Lesson.findByIdAndUpdate(req.body.lid, fieldsToSet).exec(function(err, lesson) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.lesson = lesson;
            return workflow.emit('response');
        });
    });

    workflow.emit('unfollowLesson');
};

/**
 * This should be replaced with a Hadoop Task.
 *   - Use MapReduce to increase performance
 */
exports.followers = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);

    workflow.on('validate', function() {
        if(req.query.name === undefined) return workflow.emit('exception', 'missing parameters');
        workflow.emit('listFollowers');
    });

    workflow.on('listFollowers', function() {
        // Check if user follow this lesson
        req.app.db.models.Lesson.findOne({ name: req.query.name }).populate('followers').exec(function(err, lesson) {
            if (err) return workflow.emit('exception', err);

            if (!lesson) return workflow.emit('exception', 'missing lesson');

            /***** Start Mapping *****/

            var users = lesson.followers;
            var usersMap = {};

            // Map this document to response document (should use MapReduce)
            for (i = 0; i < users.length; i++) {
                usersMap.push({username: users[i].username});
            }

            /***** End of Mapping *****/

            workflow.outcome.followers = usersMap;

            return workflow.emit('response');
        });
    });

    workflow.emit('validate');
};
