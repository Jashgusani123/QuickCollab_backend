import mongoose, { Document, ObjectId } from "mongoose";

export interface IMessage extends Document {
  body: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  memberId: ObjectId;
  channelId?: ObjectId | null;
  conversationId?: ObjectId | null;
  parentMessageId?: ObjectId | null;
  workspaceId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    body: {
      type: String,
      default: null,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },
    parentMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
  },
  { timestamps: true }
);


// Converstation Schema 

export interface IConversation extends Document {
  memberOneId: ObjectId;
  memberTwoId:ObjectId;
  workspaceId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new mongoose.Schema<IConversation>(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    memberOneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    memberTwoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
  },
  { timestamps: true }
);


// Reactions Schema 

export interface IReaction extends Document {
  memberId: ObjectId;
  workspaceId: ObjectId;
  messageId: ObjectId;
  value: string;
}

const reactionSchema = new mongoose.Schema<IReaction>(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    value:{
      type: String,
      required:true
    }
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model<IMessage>("Message", messageSchema);
export const ConversationModel = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);
export const ReactionModel = mongoose.model<IReaction>("Reaction", reactionSchema);
