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

// add all users to the subscription
exports.init = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var _id = req.params.id;    // subscription ID
    var usersId = [];

    var addUsersToSubscription = function(callback) {
        var fieldsToSet = {
            $addToSet: { subscribers: usersId }
        };

        req.app.db.models.Subscription.findById(_id).exec(function(err, subscription) {
            if (err) return callback(err, null);

            subscription.subscribers = [];
            
            for (i = 0; i < usersId.length; i++) {
                subscription.subscribers.addToSet(usersId[i]);
                //subscription.subscribers.push(usersId[i]);
            }

            workflow.outcome.data = subscription;

            subscription.save(callback);
        });
    };

    var listUsers = function(callback) {
        req.app.db.models.User.find({}).exec(function(err, users) {
            if (err) return callback(err, null);

            if (!users) return callback('missing users', null);

            users.forEach(function(entry) {
                usersId.push(entry._id);
            });

            return callback(null, 'done');
        });
    };

     var asyncFinally = function(err, results) {
        if (err) return next(err);
        
        addUsersToSubscription(function() {
            workflow.emit('response');
        });
    };

    require('async').parallel([listUsers], asyncFinally);
};

