const mongoose = require('../../database');

const TaskSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
    },
    description:{
        type:String,
        required: false,
    },
    followup_id:{
        type:String,
        required: true,
    },
    comments:{
        type:Array,
        required: false,
        default: []
    },
    properties:{
        type:Array,
        required: true,
        default: []
    },
    phase_id:{
        type:String,
        required: true,
        default: null
    },
    createdBy:{
        type:Object,
        required: false,
        default: null
    },
    createAt:{
        type:Date,
        default: Date.now,
    }
});

const Task = mongoose.model('Task' ,TaskSchema);

module.exports = Task;