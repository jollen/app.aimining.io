
// Post
exports = module.exports = function(app, mongoose) {
    var postSchema = new mongoose.Schema({

        subject: { type: String, default: ''},  // also used as URL
        content: { type: String, default: ''},  // markdown codes
        filename: { type: String, default: ''},

        html: { type: String, default: ''},     // parsed HTML codes (reserved)

        tags: [{ type: String, default: ''}],
        isActive: { type: Boolean, default: true },

        // update date
        date: { type: Date, default: Date.now },

        wchars: { type: Number, default: 0},

        userCreated: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: { type: String, default: '' },
            time: { type: Date, default: Date.now } // create date
        }       
    });
    postSchema.statics.wcharCount = function(content) {
        var ccc = require('cccount');

        return ccc.wcharCount(content);
    };
    postSchema.plugin(require('./plugins/pagedFind'));
    postSchema.index({ subject: 1 });
    postSchema.index({ tags: 1 });
    postSchema.set('autoIndex', (app.get('env') == 'development'));
    app.db.model('Post', postSchema);
}
