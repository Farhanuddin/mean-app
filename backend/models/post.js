const mongoose = require('mongoose');

// Post Schema
const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true, default: 'value' },
  imagePath: { type: String, require: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

//Post Model
module.exports = mongoose.model('Post', postSchema);
