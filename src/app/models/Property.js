const mongoose = require("../../database");

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  locale: {
    type: String,
    required: false,
  },
  options: {
    type: Array,
    required: false,
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

const Property = mongoose.model("Property", PropertySchema);

module.exports = Property;
