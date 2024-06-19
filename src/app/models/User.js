const mongoose = require('../../database');
// const md5 = require('md5');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        unique: true,
        required: true,
        lowercase: true,
    },
    password:{
        type:String,
        required: true,
        select: false,
    },
    avatar:{
        type:String,
        required: false,
        default: null
    },
    environment:{
        type:Array,
        required: true,
        default: []
    },
    process:{
        type:Array,
        required: true,
        default: []
    },
    assignProcesses:{
        type:Boolean,
        required: true,
        default: false
    },
    fullUser:{
        type:Boolean,
        required: true,
        default: false,
        select: false
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


UserSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


const User = mongoose.model('User' ,UserSchema);

module.exports = User;