import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  profilepic:{
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
  },
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true,
  //   unique: true,
  // },
  bio: {
    type: String,
  },
  contacts:{
    type: Array,
  },
  requests:{
    type: Array,
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

const Profile = mongoose.models.profile || mongoose.model('profile', ProfileSchema)

export default Profile
