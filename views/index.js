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

var moment = require('moment');

exports.init = function (req, res, next)
{
    var workflow = req.app.utility.workflow(req, res);
    var sort = '';

    sort = req.query.sort ? req.query.sort : '-date';

    workflow.on('listPosts', function() {
        req.app.db.models.Post.pagedFind({
            keys: 'subject content filename date userCreated',
            limit: req.query.limit,
            sort: sort
        }, function(err, posts) {
            if (err) return workflow.emit('exception', err);

            for(var key in posts) {
                workflow.outcome[key] = posts[key];
            }

            return workflow.emit('render');
        });
    });

    workflow.on('render', function() {
        // formating 'date'
        var posts = [];

        workflow.outcome.data.forEach(function(post) {
            posts.push({
                _id: post._id,
                userCreated: post.userCreated,
                subject: post.subject,
                date: moment(post.date).fromNow()
            });
        });

        res.render('index', {
            posts: posts
        });
    });

    return workflow.emit('listPosts');
};
