exports = module.exports = function(app, mongoose) {
    var viewHistorySchema = new mongoose.Schema({
        path: { type: String, default: '' },
        useragent: { type: String, default: ''},
        referer: { type: String, default: ''},
        ip: { type: String, default: ''},
        date: { type: Date, default: Date.now },
        userCreated: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: { type: String, default: '' },
            time: { type: Date, default: Date.now }
        }
    });
    app.db.model('ViewHistory', viewHistorySchema);
};
