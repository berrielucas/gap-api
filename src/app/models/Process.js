const mongoose = require('../../database');

const ProcessSchema = new mongoose.Schema({
    codigo:{
        type:String,
        required: false,
        default: null,
    },
    name:{
        type:String,
        required: true,
    },
    phases:{
        type:Array,
        required: true,
        default: []
    },
    properties:{
        type:Array,
        required: true,
        default: []
    },
    environment_id:{
        type:String,
        required: true,
        // default: null
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

const Process = mongoose.model('Process' ,ProcessSchema);

module.exports = Process;