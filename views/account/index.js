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

exports.init = function(req, res, next) {
    //defaults
    req.query.name = req.query.name ? req.query.name : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit) : 5;
    req.query.page = req.query.page ? parseInt(req.query.page) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '-date';

    //filters
    var outcome = [];

    readAllSubjects(req, res, next, function(outcome) {
		var moment = require('moment');
		var ccc = require('cccount');

		var posts = [];

        // formating 'date'
		posts = outcome.posts;

        posts.forEach(function(post) {
            post.date = moment(post.date).fromNow();
            // calculate read time
            // 平均閱讀速度約 240 字/分
            post.readtime = Math.round(post.wchars / 240);
            if (post.readtime === 0)
            	post.readtime = 1;
        });

        // Reduce (取3篇)
        posts = posts.slice(0, 3);

        res.render('account/index', {
            posts: posts,
	    	username: req.user.username,
        });
	});
};

exports.widgets = function(req, res){
    var lessons = [];

    var getCategory = function() {
    	req.app.db.models.Category.find({}).populate('lessons').exec(function(err, categories) {
	        if (err) return next(err);
	        if (!categories) return next(); // not found

	        // Make the orders
	        var counts = 0;
	        for (var i = 0; i < categories.length; i++) {
	        	for (var j = 0; j < categories[i].lessons.length; j++) {
	        		categories[i].lessons[j].order = counts;
	        		counts++;
	        	}
	        }

	        res.render('widgets', {
	            categories: categories
	        });
	    });
    };

    getCategory();
};

exports.calendar = function(req, res, next) {
    res.render('calendar');
};

// Default: read the newest one for every subjects
var readAllSubjects = function(req, res, next, cb) {
    var workflow = req.app.utility.workflow(req, res);
    
    workflow.on('mapReduce', function() {
        // MongoDB MapReduce
        //
        // see: http://docs.mongodb.org/manual/tutorial/aggregation-with-user-preference-data/
        //      http://www.mikitamanko.com/blog/2013/08/25/mongoose-aggregate-with-group-by-nested-field/
        req.app.db.models.Post.aggregate([
            { $group : {
                _id :  { subject: '$subject'},
                date : { $last : '$date' },
                subject : {$last: '$subject'},
                isActive: {$last: '$isActive'},
                wchars: {$last: '$wchars'},
                id: {$last: '$_id'},
                userCreated: {$last: '$userCreated'}
               }
            },
            { $sort : {
               	date: -1
              }
            }]
            , function(err, posts) {
                    if (err) return workflow.emit('exception', err);

                    //Reduce
                    workflow.outcome.posts = [];

                    for (i = 0; i < posts.length; i++) {
                        if (posts[i].isActive === true)
                            workflow.outcome.posts.push(posts[i]);
                    }

                    return workflow.emit('render');
        });
    });

    workflow.on('render', function() {
        return cb(workflow.outcome);
    });

    return workflow.emit('mapReduce');
};
