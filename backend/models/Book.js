const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'Please add an ISBN'],
    unique: true,
    trim: true
  },
  edition: {
    type: String,
    default: '1st Edition'
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a total quantity'],
    min: 0
  },
  availableQuantity: {
    type: Number,
    required: [true, 'Please add available quantity'],
    min: 0
  },
  shelfLocation: {
    type: String,
    required: [true, 'Please specify shelf location'],
    trim: true
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', BookSchema);
