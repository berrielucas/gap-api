const mongoose = require("../../database");

const EnvironmentSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: false,
    default: null,
  },
  url: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
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

const Environment = mongoose.model("Environment", EnvironmentSchema);

module.exports = Environment;
