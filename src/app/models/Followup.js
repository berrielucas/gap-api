const mongoose = require('../../database');

const FollowupSchema = new mongoose.Schema({
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

const Followup = mongoose.model('Followup' ,FollowupSchema);

module.exports = Followup;