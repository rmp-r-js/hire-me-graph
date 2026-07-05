const mongoose = require('mongoose');

const commitJobSchema = new mongoose.Schema({
  // Commit ki exact date aur time (ISO format string jaise: "2026-01-01T12:01:00Z")
  date: { 
    type: String, 
    required: true,
    index: true // Indexing taaki PENDING jobs fast search hon
  },
  
  // GitHub par jo commit message dikhega
  message: { 
    type: String, 
    required: true 
  },
  
  // Job ka current status
  status: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'FAILED'], 
    default: 'PENDING' 
  },
  
  // Agar network ya API error aaye toh kitni baar try kiya
  retryCount: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true // Creates createdAt & updatedAt automatically
});

module.exports = mongoose.model('CommitJob', commitJobSchema);
