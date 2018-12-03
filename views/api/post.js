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
 * CRUD implementation of REST API '/1/post'
 */

exports.create = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);
    var id = req.body.id; // post ID
    var post = {};        // original post

    workflow.on('validate', function() {
        if (typeof(req.user) === "undefined") {
            workflow.outcome.errors.push('Please login.');
            return workflow.emit('response');
        }

        workflow.outcome.errfor = {};
        workflow.outcome.errors = [];

        // user is creating a new post ?
        if (typeof(id) === "undefined") {
            if (!req.body.subject) workflow.outcome.errfor.subject = '必填欄位';
            if (!req.body.content) workflow.outcome.errfor.content = '必填欄位';

            //return if we have errors already
            if (workflow.hasErrors()) {
                workflow.outcome.errors.push('必填欄位');
                return workflow.emit('response');
            }

            return workflow.emit('saveNewPost');
        }

        return workflow.emit('listOnePost');
    });

    workflow.on('listOnePost', function() {
        req.app.db.models.Post.find({ _id: id})
        .sort('date')
        .exec(function(err, posts) {
            if (err) return workflow.emit('exception', err);
            if (!posts) return workflow.emit('exception', 'missing data');

            // return the newest (we keep all histories)
            post = posts.pop();

            return workflow.emit('savePost');
        });
    });

    workflow.on('saveNewPost', function() {
        var fieldsToSet = {
            subject: req.body.subject.trim(),
            content: req.body.content,
            filename: req.body.filename,
            wchars: req.app.db.models.Post.wcharCount(req.body.content),
            userCreated: {
                id: req.user._id,
                name: req.user.username,
                time: new Date().toISOString()
            }
        };

        new req.app.db.models.Post(fieldsToSet).save(function(err) {
            if (err) return workflow.emit('exception', err);
            return workflow.emit('response');
        });
    });

    workflow.on('savePost', function() {
        var fieldsToSet = {
            subject: post.subject.trim(),              // 標題不能改 & trim
            content: req.body.content,
            wchars: req.app.db.models.Post.wcharCount(req.body.content),
            isActive: post.isActive,
            userCreated: {
                id: post.userCreated.id,        // 不改原作者
                name: post.userCreated.name,
                time: post.userCreated.time     // 原時間也不改
            }
        };

        // Permission check: user is editing their own post.
        // Are we hacked ?
        if (post.userCreated.id != req.user.id)
            return workflow.emit('exception', 'I am hacked.');

        new req.app.db.models.Post(fieldsToSet).save(function(err) {
            if (err) return workflow.emit('exception', err);
            return workflow.emit('response');
        });
    });

    return workflow.emit('validate');
};

// Default: read all histories
exports.read = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);
    var id = req.params.id;

    // defaults: no limits
    req.query.limit = req.query.limit ? parseInt(req.query.limit) : 999;
    //req.query.page = req.query.page ? parseInt(req.query.page) : 1;
    req.query.sort = req.query.sort ? req.query.sort : 'userCreated.time';

    workflow.on('validate', function() {
        if (typeof(id) === "undefined") 
            return workflow.emit('listPosts');

        workflow.emit('listOne');
    });

    workflow.on('listPosts', function() {
        req.app.db.models.Post.pagedFind({
            keys: 'subject content filename userCreated',
            limit: req.query.limit,
            sort: req.query.sort
        }, function(err, posts) {
            if (err) return workflow.emit('exception', err);

            for(var key in posts) {
                workflow.outcome[key] = posts[key];
            }

            return workflow.emit('response');
        });
    });

    workflow.on('listOne', function() {
        req.app.db.models.Post.findOne({_id: id}, function(err, post) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.data = post;

            return workflow.emit('response');
        });
    });

    return workflow.emit('validate');
};

exports.activate = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);
    var subject = req.params.subject.trim();
    var url = decodeURIComponent(subject);

    workflow.on('updatePost', function() {
        var fieldsToSet = {
            isActive: true
        };

        req.app.db.models.Post.update({ subject: url}, fieldsToSet, { multi: true }, function(err, numAffected) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.numAffected = numAffected;

            return workflow.emit('response');
        });
    });

    workflow.emit('updatePost');
}

exports.inactivate = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);
    var subject = req.params.subject.trim();
    var url = decodeURIComponent(subject);

    workflow.on('updatePost', function() {
        var fieldsToSet = {
            isActive: false
        };

        req.app.db.models.Post.update({ subject: url}, fieldsToSet, { multi: true }, function(err, numAffected) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.numAffected = numAffected;

            return workflow.emit('response');
        });
    });

    workflow.emit('updatePost');
}

exports.delete = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);
    var _id = req.params.id;

    workflow.on('deletePost', function() {
        req.app.db.models.Post.findByIdAndRemove(_id, function(err, post) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.post = post;
            
            return workflow.emit('response');
        });
    });

    workflow.emit('deletePost');
}