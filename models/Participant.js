const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Unique participant identifier
  gender: String,
  age: Number,
  education: { type: String, enum: ['podstawowe', 'średnie', 'wyższe'] },
  yearsOfEducation: Number,
  images: [{
    imageName: String,
    response: { type: Number, min: 0, max: 100 }, // Response as a percentage (0-100)
    gridSelection: [String],
    confidenceRating: String,
    timeSpent: {
      type: Map,
      of: Number,
    },
  }],
  nfcAnswers: [Number], // Add this line for NFC answers
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});


module.exports = mongoose.model('Participant', participantSchema);
