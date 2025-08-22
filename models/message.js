import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    
    content: {
      type: String,
      trim: true,
      maxlength: 10000,
    },

    
    messageType: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "file",
        "location",
        "contact",
        "sticker",
        "gif",
      ],
      default: "text",
    },

    
    attachments: [
      {
        type: {
          type: String,
          enum: ["image", "video", "audio", "file", "location", "contact"],
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
          address: String,
        },
        contact: {
          name: String,
          phone: String,
          email: String,
        },
      },
    ],

    
    metadata: {
      
      isDelivered: {
        type: Boolean,
        default: true,
      },
      deliveredAt: Date,

      
      isRead: {
        type: Boolean,
        default: false,
      },
      
      readBy: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      readAt: Date,

      
      isForwarded: {
        type: Boolean,
        default: false,
      },
      originalMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },

      
      isReply: {
        type: Boolean,
        default: false,
      },
      replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },

      
      isEdited: {
        type: Boolean,
        default: false,
      },
      editedAt: Date,
      editHistory: [
        {
          content: String,
          editedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      isDeleted: {
        type: Boolean,
        default: false,
      },
      deletedAt: Date,
      deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      
      reactions: [
        {
          emoji: String,
          users: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
          ],
          count: {
            type: Number,
            default: 0,
          },
        },
      ],
    },

    
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed", "deleted"],
      default: "sent",
    },

    
    encryption: {
      isEncrypted: {
        type: Boolean,
        default: false,
      },
      encryptionKey: String,
      algorithm: String,
    },

    
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: Date,

    
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ readBy: 1 });
messageSchema.index({ status: 1 });


messageSchema.virtual("age").get(function () {
  return Date.now() - this.createdAt.getTime();
});


messageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;
