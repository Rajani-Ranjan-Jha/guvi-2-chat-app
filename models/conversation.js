import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({

  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  

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
    type: String, 
  },
  

  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  

  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  

  firstMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  

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
  

  settings: {

    isPrivate: {
      type: Boolean,
      default: false
    },
    allowNewMembers: {
      type: Boolean,
      default: true
    },
    

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
  

  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: Date,
  

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


conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ type: 1, groupName: 1 });
conversationSchema.index({ 'metadata.lastActivity': -1 });


conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
export default Conversation;
