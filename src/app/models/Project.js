const mongoose = require("../../database");

const ProjectSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: false,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  environment_id: {
    type: String,
    required: true,
    default: null,
  },
  createdBy: {
    type: Object,
    required: false,
    default: null,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
