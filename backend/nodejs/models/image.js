const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    url: String,
    user: String,
    title: String,
    dateUploaded: {type: Date, default: Date.now}
});

module.exports = mongoose.model("image", imageSchema);