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
var fs = require('fs');
var path = require('path');

/**
 * This should be replaced with a Hadoop Task.
 *   - Use MapReduce to increase performance
 */
exports.following = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var following = [];
    var outcome = {};

    workflow.on('validate', function(callback) {
        if(req.query.username === undefined) return workflow.emit('exception', 'missing parameters');
        require('async').parallel([listFollowing], asyncFinally);
    });

    var listFollowing = function(callback) {
        // Check if user follow this lesson
        req.app.db.models.Lesson.find({}).populate('followers category').exec(function(err, lessons) {
            if (err) return callback(err, null);

            if (!lessons) return callback('missing lessons', null);

            /***** Start Mapping: lesson(*)->lesson(name,title,auhtor,followers) *****/
            var lessonsMap = [];

            for (i = 0; i < lessons.length; i++) {

                /***** Start Mapping: user(*)->user(name) *****/
                var usersMap = [];
                var followers = lessons[i].followers;
                var categoryName = '';
                var category = lessons[i].category;

                if (category == null) {
                    categoryName = 'default';
                } else {
                    categoryName = category.name;
                }

                for (j = 0; j < followers.length; j++) {
                    usersMap.push({username: followers[j].username});
                }

                lessonsMap.push({
                    name: lessons[i].name,
                    title: lessons[i].title,
                    author: lessons[i].author,
                    category: categoryName,
                    followers: usersMap
                });
            }
            /***** End of Mapping *****/

            outcome.lessons = lessonsMap; // all lessons with its followers

            return callback(null, "done");
        });
    };

    var listUsers = function() {
        // Check if user follow this lesson
        req.app.db.models.User.find({}).exec(function(err, users) {
            if (err) return callback(err, null);

            if (!users) return callback('missing users', null);

            /***** Start Mapping: lesson(*)->lesson(name,title,auhtor,followers) *****/
            /***** End of Mapping *****/

            outcome.users = users; // all users

            return callback(null, 'done');
        });
    };

    var asyncFinally = function(err, results) {
        if (err) return workflow.emit('exception', err);

        var lessons = outcome.lessons;
        var following = [];
        var pathname = '';


        // Map lesson(list(followers), title, author) --> user(following(title, name, category, author))
        for (i = 0; i < lessons.length; i++) {
            var followers = lessons[i].followers;

            for (j = 0; j < followers.length; j++) {
                if (followers[j].username === req.query.username) {
                    pathname = '/course/'
                                + lessons[i].category
                                + '/'
                                + lessons[i].name;

                    following.push({
                        title: lessons[i].title,
                        name: lessons[i].name,
                        category: lessons[i].category,
                        author: lessons[i].author,
                        path: pathname
                    });
                }
            }
        }

        workflow.outcome.following = following;

        return workflow.emit('response');
    };

    workflow.emit('validate');
};
