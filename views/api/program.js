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

exports.list = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);

    //defaults
    req.query.name = req.query.name ? req.query.name : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit) : 10;
    req.query.page = req.query.page ? parseInt(req.query.page) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '';

    //filters
    var filters = {};
    if (typeof req.user !== 'undefined' && req.query.type) {
        switch (req.query.type) {
            case 'new':
                filters.date = {$gte: req.user.roles.account.lastLoggedin};
                break;
            case 'recommend':
                break;
        }
    }

    workflow.on('listProgram', function() {
        req.app.db.models.Program.pagedFind({
            filters: filters,
            keys: 'title lecture date views userCreated.time lesson',
            populates: {
                path: 'lesson',
                select: 'name'
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

    return workflow.emit('listProgram');
};

exports.isviewed = function(req, res, next) {
    var workflow = new req.app.utility.Workflow(req, res);

    // reset cache
    cache.clear();

    workflow.outcome.isviewed = true;

    workflow.on('getIsViewed', function() {
        req.app.db.models.ViewHistory.findOne({
                path: {
                    $regex: '^\/course\/.+\/.+\/' + req.query.lecture
                },
                "userCreated.id": req.user._id
        }).exec(function(err, lecture) {
            if (err) return workflow.emit('exception', err);

            if (!lecture) workflow.outcome.isviewed = false;

            return workflow.emit('response');
        });
    });

    return workflow.emit('getIsViewed');
};

function parseGithubMarkDown(data, callback) {
    // Set default options except highlight which has no default
    var options = {
        gfm: true,
        tables: true,
        breaks: false,
    };

    require("marked")(data, options, function (err, html) {
        if (err) return callback('Markdown error', null);

        // Outputs parsed html
        callback(null, html);
    });
}

exports.wiki = function(req, res, next) {

    var util = require('util');
    var workflow = new req.app.utility.Workflow(req, res);
    var markdownFile = req.app.get('wiki') + '/%s/%s.md';

    if (!req.query.lecture) {
        markdownFile = util.format(markdownFile, 'mokoversity-wiki', req.query.lesson);
    } else {
        markdownFile = util.format(markdownFile, req.query.lesson, req.query.lecture);
    }

    // Read file async
    require('fs').readFile(markdownFile, 'utf8', function (err, data) {
        if (err) return workflow.emit('exception', 'missing wiki');

        parseGithubMarkDown(data, function (err, html) {
            if (err) return workflow.emit('exception', 'parse error');

            workflow.outcome.html = html;
            workflow.emit('response');
        });
    });
};
