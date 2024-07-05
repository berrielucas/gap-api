const mongoose = require("../../database");

const FollowupSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: false,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  phases: {
    type: Array,
    required: true,
    default: [],
  },
  properties: {
    type: Array,
    required: true,
    default: [],
  },
  environment_id: {
    type: String,
    required: true,
  },
  countTasks: {
    type: Number,
    required: true,
    default: 0
  },
  createdBy: {
    type: Object,
    required: false,
    default: null,
  },
}, { timestamps: true });

const Followup = mongoose.model("Followup", FollowupSchema);

module.exports = Followup;
