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
 * File upload
 */
exports.init = function(req, res) {
    var type = req.params.type;   // 'photo' or 'voice'
    var ext;

    // use MD5 as filename
    var crypto = require('crypto');
    var name = req.files.file.path;
    var hash = crypto.createHash('md5').update(name).digest('hex');

    // get extension filename
    var ext = path.extname(req.files.file.path);

    var filename = hash + ext;
    var newPath = path.join(__dirname, '../../public/uploads', filename);

    fs.readFile(req.files.file.path, function (err, data) {
        fs.writeFile(newPath, data, function (err) {
            if (err) {
                res.json({status: 'error', message: err});
            } else {
                res.json({
                    status: 'ok',
                    filename: filename
                });
            }
        });
    });
};