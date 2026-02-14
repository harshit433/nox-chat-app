/**
 * Thread model
 */

import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'userId is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      default: 'New chat',
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    parentMessageId: {
      type: String,
      default: null,
    },
    parentThreadId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        ret.createdAt = ret.createdAt?.toISOString?.() ?? ret.createdAt;
        ret.updatedAt = ret.updatedAt?.toISOString?.() ?? ret.updatedAt;
        return ret;
      },
    },
  }
);

threadSchema.index({ userId: 1, updatedAt: -1 });

export const Thread = mongoose.model('Thread', threadSchema);
