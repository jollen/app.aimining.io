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
 * CRUD implementation of REST API '/1/lean'
 */

/* Input:

{
    ideaId: '',
    code: '',
    objective: ''
}
*/
exports.createOneForIdea = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var ideaId = req.body.ideaId;
    var lessonCode = req.body.code;
    var taskObjective = req.body.objective;
    var taskDescription = req.body.description;

    workflow.on('validate', function() {
        // no need to validate fields now
        console.log('createOneForIdea: ' + ideaId);

        // should not happen, unless someone is trying to hack me
        if (ideaId !== req.params.idea) {
            workflow.outcome.errors.push("Ouch...I'm hacked.");
            return workflow.emit('response');
        }

        workflow.emit('saveTask');
    });

    workflow.on('saveTask', function() {
        if (typeof(req.user) === "undefined") {
            workflow.outcome.errors.push('Please login.');
            return workflow.emit('response');
        }

        var fieldsToSet = {
            code: lessonCode,
            objective: taskObjective,
            idea: ideaId,
            description: taskDescription,

            userCreated: {
                id: req.user._id,
                name: req.user.username,
                time: new Date().toISOString()
            }
        };

        new req.app.db.models.LeanTask(fieldsToSet).save(function(err) {
            if (err) return workflow.emit('exception', err);
            return workflow.emit('response');
        });
    });

    return workflow.emit('validate');
};

exports.readByIdea = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var ideaId = req.params.idea;

    workflow.on('validate', function() {
        workflow.emit('listTasks');
    });

    workflow.on('listTasks', function() {
        req.app.db.models.LeanTask.find({idea: ideaId}).exec(function(err, tasks) {
            if (err) return workflow.emit('exception', err);
            if (!tasks) return workflow.emit('exception', 'missing data');

            workflow.outcome.tasks = tasks;

            return workflow.emit('response');
        });
    });

    return workflow.emit('validate');
};

exports.readByIdeaAndCode = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);    
    var ideaId = req.params.idea;
    var code = req.params.code;

    workflow.on('validate', function() {
        workflow.emit('listTask');
    });

    workflow.on('listTask', function() {
        req.app.db.models.LeanTask.find({idea: ideaId, code: code}).exec(function(err, tasks) {
            if (err) return workflow.emit('exception', err);
            if (!tasks) return workflow.emit('exception', 'missing data');

            workflow.outcome.tasks = tasks;

            return workflow.emit('response');
        });
    });

    return workflow.emit('validate');        
};

exports.readOneByIdeaCodeAndObjective = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);
    var ideaId = req.params.idea;
    var code = req.params.code;
    var objective = req.params.objective;

    workflow.on('validate', function() {
        workflow.emit('listTask');
    });

    workflow.on('listTask', function() {
        req.app.db.models.LeanTask.find({
            idea: ideaId, 
            code: code,
            objective:objective
        })
        .exec(function(err, tasks) {
            if (err) return workflow.emit('exception', err);
            if (!tasks) return workflow.emit('exception', 'missing data');

            // return the history
            //workflow.outcome.tasks = tasks;

            // return the newest
            var revision = tasks.length;
            workflow.outcome.task = {};

            workflow.outcome.task = tasks.pop();
            workflow.outcome.debug = {
                revision: revision
            };

            return workflow.emit('response');
        });
    });

    return workflow.emit('validate');  
}