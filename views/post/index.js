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

exports.one = function(req, res, next) {
    res.render('post/one', {
    	id: req.params.id
    });
};

exports.create = function(req, res, next) {
	var id = req.params.id; // post ID

	if (id === undefined)
		 id = '';

    res.render('post/create', {
    	id: id
    });
};
