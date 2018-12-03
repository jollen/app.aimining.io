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
 * CRUD implementation of REST API '/1/idea'
 */

exports.create = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.idea) workflow.outcome.errfor.idea = '必填欄位';        
        if (!req.body.founder) workflow.outcome.errfor.founder = '必填欄位';
        if (!req.body.description) workflow.outcome.errfor.description = '必填欄位';

        //return if we have errors already
        if (workflow.hasErrors()) {
            workflow.outcome.errors.push('必填欄位');
            return workflow.emit('response');
        }

        workflow.emit('saveIdea');
    });

    workflow.on('saveIdea', function() {
        if (typeof(req.user) === "undefined") {
            workflow.outcome.errors.push('Please login.');
            return workflow.emit('response');
        }

        var fieldsToSet = {
            idea: req.body.idea,
            founder: req.body.founder,
            description: req.body.description,
            facebook: req.body.facebook,
            github: req.body.github,
            twitter: req.body.twitter,
            email: req.body.email,
            author: req.user._id,
            userCreated: {
                id: req.user._id,
                name: req.user.username,
                time: new Date().toISOString()
            }
        };

        new req.app.db.models.Idea(fieldsToSet).save(function(err) {
            if (err) return workflow.emit('exception', err);
            return workflow.emit('response');
        });
    });

    return workflow.emit('validate');
};

exports.read = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);

    // defaults: no limits
    req.query.limit = req.query.limit ? parseInt(req.query.limit) : 999;
    //req.query.page = req.query.page ? parseInt(req.query.page) : 1;
    req.query.sort = req.query.sort ? req.query.sort : 'userCreated.time';

    // filters
    var filters = {};
    if (req.query.type) {
        switch (req.query.type) {
            case 'new':
                filters.date = {$gte: req.user.roles.account.lastLoggedin};
                break;
            case 'recommend':
                break;

        }
    }

    // filters by userId
    if (typeof req.user !== 'undefined' && req.query.type !== 'all') {
        filters = {'userCreated.id': req.user._id};
    }

    // list all ideas, default is all activates and login is not necessary
    if (req.query.type === 'all') {
        filters = {'isActive': true};
    }

    workflow.on('listIdea', function() {
        req.app.db.models.Idea.pagedFind({
            filters: filters,
            keys: 'isActive idea founder description facebook github twitter email userCreated',
            populates: {
                path: 'userCreated.id',
                select: 'username'
            },
            limit: req.query.limit,
            page: req.query.page,
            sort: req.query.sort
        }, function(err, results) {
            if (err) return workflow.emit('exception', err);

            for(var key in results) workflow.outcome[key] = results[key];

            return workflow.emit('response');
        });
    });

    return workflow.emit('listIdea');
};

exports.readOne = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var _id = req.params.id;

    workflow.on('validate', function() {
        workflow.emit('listOneIdea');
    });

    workflow.on('listOneIdea', function() {
        req.app.db.models.Idea.findOne({ _id: _id }).exec(function(err, idea) {
            if (err) return workflow.emit('exception', err);
            if (!idea) return workflow.emit('exception', 'missing data');

            workflow.outcome.data = idea;

            return workflow.emit('response');
        });
    });

    return workflow.emit('validate');
};

exports.update = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);

    workflow.on('updateIdea', function() {
        var fieldsToSet = {
            idea: req.body.idea,
            founder: req.body.founder,
            description: req.body.description,
            facebook: req.body.facebook,
            github: req.body.github,
            twitter: req.body.twitter,
            email: req.body.email,
        };

        req.app.db.models.Idea.findByIdAndUpdate(req.body.id, fieldsToSet, function(err, idea) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.data = idea;

            return workflow.emit('response');
        });
    });

    workflow.emit('updateIdea');
}

exports.delete = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var _id = req.params.id;

    workflow.on('deleteIdea', function() {
        req.app.db.models.Idea.findByIdAndRemove(_id, function(err, idea) {
            if (err) return workflow.emit('exception', err);

            return workflow.emit('response');
        });
    });

    workflow.emit('deleteIdea');
}

exports.activate = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var _id = req.params.id;

    workflow.on('updateIdea', function() {
        var fieldsToSet = {
            isActive: true
        };

        req.app.db.models.Idea.findByIdAndUpdate(_id, fieldsToSet, function(err, idea) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.data = idea;

            return workflow.emit('response');
        });
    });

    workflow.emit('updateIdea');
}

exports.inactivate = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var _id = req.params.id;

    workflow.on('updateIdea', function() {
        var fieldsToSet = {
            isActive: false
        };

        req.app.db.models.Idea.findByIdAndUpdate(_id, fieldsToSet, function(err, idea) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.data = idea;

            return workflow.emit('response');
        });
    });

    workflow.emit('updateIdea');
}