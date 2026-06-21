const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    default: 'Remote'
  },
  link: {
    type: String,
    default: '#'
  },
  postedDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', JobSchema);
