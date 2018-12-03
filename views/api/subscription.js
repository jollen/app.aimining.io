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
 * CRUD implementation of REST API '/1/subscription'
 */

exports.create = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.subject) workflow.outcome.errfor.subject = '必填欄位';
        if (!req.body.description) workflow.outcome.errfor.description = '必填欄位';

        //return if we have errors already
        if (workflow.hasErrors()) {
            workflow.outcome.errors.push('必填欄位');
            return workflow.emit('response');
        }

        workflow.emit('saveSubscription');
    });

    workflow.on('saveSubscription', function() {
        if (typeof(req.user) === "undefined") {
            workflow.outcome.errors.push('Please login.');
            return workflow.emit('response');
        }

        var fieldsToSet = {
            subject: req.body.subject,
            description: req.body.description,
            userCreated: {
                id: req.user._id,
                name: req.user.username,
                time: new Date().toISOString()
            }
        };

        new req.app.db.models.Subscription(fieldsToSet).save(function(err) {
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

    workflow.on('listSubscription', function() {
        req.app.db.models.Subscription.pagedFind({
            keys: 'subject description subscribers userCreated',
            limit: req.query.limit,
            sort: req.query.sort
        }, function(err, subscriptions) {
            if (err) return workflow.emit('exception', err);

            for(var key in subscriptions) {
                workflow.outcome[key] = subscriptions[key];
                //workflow.outcome[key].numSubscribers = subscriptions[key].subscribers.length;
            }

            return workflow.emit('response');
        });
    });

    return workflow.emit('listSubscription');
};

exports.readOne = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var _id = req.params.id;

    workflow.on('validate', function() {
        workflow.emit('listOneSubscription');
    });

    workflow.on('listOneSubscription', function() {
        req.app.db.models.Subscription.findOne({ _id: _id })
        .exec(function(err, subscription) {
            if (err) return workflow.emit('exception', err);
            if (!subscription) return workflow.emit('exception', 'missing data');

            workflow.outcome.data = subscription;

            return workflow.emit('response');
        });
    });

    return workflow.emit('validate');
};

// List all subscribers of the subscription
// Default: if the user is a subscriber of the subscription
exports.subscribers = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var _id = req.params.id;
    var _uid = req.user._id;

    workflow.outcome.isSubscriber = true;

    workflow.on('validate', function() {
        workflow.emit('findOneUser');
    });

    workflow.on('findOneUser', function() {
        req.app.db.models.Subscription.findOne({
            _id: _id,
            subscribers: _uid
        }).exec(function(err, subscription) {
            if (err) return workflow.emit('exception', err);

            if (!subscription) workflow.outcome.isSubscriber = false;
            workflow.outcome.subscription = subscription;
            return workflow.emit('response');
        });
    });

    return workflow.emit('validate');
};

exports.update = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);

    workflow.on('updateSubscription', function() {
        var fieldsToSet = {
            subject: req.body.subject,
            description: req.body.description,
        };

        req.app.db.models.Subscription.findByIdAndUpdate(req.body.id, fieldsToSet, function(err, subscription) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.data = subscription;

            return workflow.emit('response');
        });
    });

    workflow.emit('updateSubscription');
}

// don't implement this API
exports.delete = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var _id = req.params.id;

    workflow.on('deleteSubscription', function() {
        req.app.db.models.Subscription.findByIdAndRemove(_id, function(err, subscription) {
            if (err) return workflow.emit('exception', err);

            return workflow.emit('response');
        });
    });

    workflow.emit('deleteSubscription');
}

exports.subscribe = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var _id = req.params.id;

    workflow.on('followSubscription', function() {
        var fieldsToSet = {
            $addToSet: { subscribers: req.user._id }
        };

        req.app.db.models.Subscription.findByIdAndUpdate(_id, fieldsToSet, { select: 'subject description' }).exec(function(err, subscription) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.subscription = subscription;

            //subscription.subscribers.push(req.user._id);
            //subscription.save();

            return workflow.emit('response');
        });
    });

    workflow.emit('followSubscription');
};

exports.unsubscribe = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var _id = req.params.id;

    workflow.on('unfollowSubscription', function() {
        var fieldsToSet = {
            $pull: { subscribers: req.user._id }
        };

        req.app.db.models.Subscription.findByIdAndUpdate(_id, fieldsToSet, { select: 'subject description' }).exec(function(err, subscription) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.subscription = subscription;
            return workflow.emit('response');
        });
    });

    workflow.emit('unfollowSubscription');
};

/* News letter API of Subscription system
/*
 *  Subscription: login is needed, and record user IDs
 *  Newsletter: login is not needed, and just put emails
 */
exports.newsletter = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var _id = req.params.id;
    var email = req.query.email;

    workflow.on('newsletter', function() {
        var fieldsToSet = {
            $addToSet: { newsletters: email }
        };

        req.app.db.models.Subscription.findByIdAndUpdate(_id, fieldsToSet, { select: 'subject description' }).exec(function(err, subscription) {
            if (err) return workflow.emit('exception', err);

            workflow.outcome.subscription = subscription;

            return workflow.emit('response');
        });
    });

    workflow.emit('newsletter');
};

/* ================================================================
 *   THE FOLLOWINGS ARE MAP-REDUCE FUNCTIONS.
 * ================================================================
 */

 /* Output example:

{
  "success": true,
  "errors": [],
  "errfor": {},
  "subscribers": [
    {
      "username": "ellaine",
      "email": "ellaine@moko365.com"
    }
  ],
  "subject": "創業課程與活動",
  "lists": [
    "username,email\n",
    "ellaine,ellaine@moko365.com\n"
  ]
}

*/
exports.mapReduceLists = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var dbox = new req.app.utility.dbox(req, res);
    var _id = req.params.id;
    var option = req.query.option ? req.query.option : 'dbox';
    var os = require('os');

    workflow.on('sendEmail', function() {

        // 清除敏感資訊
        workflow.outcome.subscribers = [];
        workflow.outcome.lists = [];

        // don't send message on development env
        if ('development' === req.app.get('env')) return workflow.emit('response');

        req.app.utility.email(req, res, {
            from: req.app.get('smtp-from-name') +' <'+ req.app.get('smtp-from-address') +'>',
            to: req.app.get('system-email'),
            replyTo: req.body.name + ' <'+ req.body.email +'>',
            subject: req.app.get('project-name') +' contact form',
            textPath: 'alert/export-lists',
            locals: {
                user: req.user,
                lists: '請查看 DBox'
            },
            success: function(message) {
                workflow.emit('response');
            },
            error: function(err) {
                workflow.outcome.errors.push('Error Sending: '+ err);
                workflow.emit('response');
            }
        });
    });

    workflow.on('validate', function() {
        workflow.emit('listNewsletters');   // newsletter first, subscriptions lists second
    });

    workflow.on('dbox', function() {
            var subscribers = workflow.outcome.subscribers;
            var list;
            var moment = require('moment');
            var filename = workflow.outcome.subject
                        + "."
                        + moment().format('YYYY-MM-DD_HH:mm:ss')
                        + ".txt";

            workflow.outcome.lists = [];
            workflow.outcome.lists.push('username,email' + os.EOL);

            // Map
            subscribers.forEach(function(user) {
                workflow.outcome.lists.push(
                    user.username
                    + ','
                    + user.email
                    + os.EOL
                );
            });

            dbox.put('subscription/' + 'subscribers-' + filename, workflow.outcome.lists, function(status, reply) {
                console.log('DBOX Status: ' + status);
            });

            dbox.put('subscription/' + 'newsletters-' + filename, workflow.outcome.newsletters, function(status, reply) {
                console.log('DBOX Status: ' + status);
            });

            return;
    });

    workflow.on('listOneSubscription', function() {
        req.app.db.models.Subscription.findOne({
            _id: _id,
        })
        .populate('subscribers')
        .exec(function(err, subscription) {
            if (err) return workflow.emit('exception', err);

            // Map
            var subscribers = subscription.subscribers;
            workflow.outcome.subscribers = [];
            workflow.outcome.subject = subscription.subject;

            subscribers.forEach(function(user) {
                workflow.outcome.subscribers.push({
                    "username": user.username,
                    "email": user.email
                });
            });

            // DBox is always default.
            //if (option === 'dbox')
            workflow.emit('dbox');

            return workflow.emit('sendEmail'); // final step
        });
    });

    workflow.on('listNewsletters', function() {
        req.app.db.models.Subscription.findOne({
            _id: _id,
        })
        .exec(function(err, subscription) {
            if (err) return workflow.emit('exception', err);

            // Add EOL
            var newsletters = subscription.newsletters;
            workflow.outcome.newsletters = [];

            newsletters.forEach(function(email) {
                workflow.outcome.newsletters.push(
                    email
                    + os.EOL
                );
            });

            workflow.emit('listOneSubscription');
        });
    });

    return workflow.emit('validate');
}







