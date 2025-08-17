import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  profilePic:{
    type:String
  },
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    // required: true,
  },
  bio: {
    type: String,
  },
  contacts:{
    type: Array,
  },
  requests:{
    type: Array,
  },
  // User status and presence
  status: {
    type: String,
    enum: ['online', 'away', 'busy', 'offline'],
    default: 'offline'
  },
  customStatus: {
    type: String,
    maxlength: 100
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  // Typing indicators for different conversations
  typingStatus: {
    type: Map,
    of: {
      isTyping: Boolean,
      timestamp: Date
    },
    default: {}
  },
  // Online status tracking
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  // followers:{
  //   type: Array,
  // },
  // following:{
  //   type: Array,
  // },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance (removed duplicates)
userSchema.index({ status: 1 });
userSchema.index({ lastSeen: -1 });
userSchema.index({ lastActivity: -1 });

// Update timestamps on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.lastActivity = Date.now();
  next();
});

// Virtual for online status
userSchema.virtual('isCurrentlyOnline').get(function() {
  if (this.status === 'offline') return false;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.lastActivity > fiveMinutesAgo;
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
