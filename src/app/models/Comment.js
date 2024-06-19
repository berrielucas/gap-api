const mongoose = require('../../database');

const CommentSchema = new mongoose.Schema({
    content:{
        type:String,
        required: true
    },
    task_id:{
        type:String,
        required: true
    },
    createdBy:{
        type:Object,
        required: true
    },
    createAt:{
        type:Date,
        default: Date.now,
    }
});

const Comment = mongoose.model('Comment' ,CommentSchema);

module.exports = Comment;