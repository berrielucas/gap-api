const mongoose = require("../../database");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: null
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  followup_id: {
    type: String,
    required: true,
  },
  subTasks: {
    type: Array,
    required: false,
    default: [],
  },
  comments: {
    type: Array,
    required: false,
    default: [],
  },
  properties: {
    type: Array,
    required: true,
    default: [],
  },
  phase_id: {
    type: String,
    required: true,
    default: null,
  },
  createdBy: {
    type: Object,
    required: false,
    default: null,
  },
}, { timestamps: true });

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
