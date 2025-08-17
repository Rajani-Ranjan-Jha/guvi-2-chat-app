import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  // Reference to the conversation this message belongs to
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  
  // Message sender
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Message content
  content: {
    type: String,
    trim: true,
    maxlength: 10000
  },
  
  // Message type
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file', 'location', 'contact', 'sticker', 'gif'],
    default: 'text'
  },
  
  // Media attachments
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'file', 'location', 'contact']
    },
    url: String,
    filename: String,
    size: Number,
    mimeType: String,
    duration: Number, // For audio/video files
    thumbnail: String, // For video/image files
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    contact: {
      name: String,
      phone: String,
      email: String
    }
  }],
  
  // Read by users (array of user IDs)
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Message metadata
  metadata: {
    // Delivery status
    isDelivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: Date,
    
    // Read receipts
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    
    // Forwarded message
    isForwarded: {
      type: Boolean,
      default: false
    },
    originalMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    
    // Reply to message
    isReply: {
      type: Boolean,
      default: false
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    
    // Edited message
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    editHistory: [{
      content: String,
      editedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Deleted message
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Reactions
    reactions: [{
      emoji: String,
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      count: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed', 'deleted'],
    default: 'sent'
  },
  
  // Encryption
  encryption: {
    isEncrypted: {
      type: Boolean,
      default: false
    },
    encryptionKey: String,
    algorithm: String
  },
  
  // Soft delete support
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ readBy: 1 });
messageSchema.index({ status: 1 });

// Virtual for message age
messageSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Update updatedAt on save
messageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;
