/**
 * Message model
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    threadId: {
      type: String,
      required: [true, 'threadId is required'],
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['user', 'assistant'],
        message: 'Role must be user or assistant',
      },
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    replyTo: {
      type: String,
      default: null,
    },
    isContext: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.timestamp = ret.createdAt?.toISOString?.() ?? ret.createdAt;
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

messageSchema.index({ threadId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
