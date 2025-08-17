import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  // Participants in the conversation
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // Conversation type: 'direct' (1-on-1) or 'group'
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  
  // Group-specific fields
  groupName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  groupDescription: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  groupAvatar: {
    type: String, // URL to group avatar image
  },
  
  // Admin users for group conversations
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Last message reference for quick access
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Message that started the conversation
  firstMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Conversation metadata
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  // Settings
  settings: {
    // Group settings
    isPrivate: {
      type: Boolean,
      default: false
    },
    allowNewMembers: {
      type: Boolean,
      default: true
    },
    
    // Individual user settings (stored per user)
    userSettings: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      isMuted: {
        type: Boolean,
        default: false
      },
      muteUntil: Date,
      customName: String,
      customAvatar: String,
      isPinned: {
        type: Boolean,
        default: false
      },
      isArchived: {
        type: Boolean,
        default: false
      }
    }]
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
conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ type: 1, groupName: 1 });
conversationSchema.index({ 'metadata.lastActivity': -1 });

// Update updatedAt on save
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
export default Conversation;
