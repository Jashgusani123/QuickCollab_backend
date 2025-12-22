import { Request } from "express";
import { ObjectId } from "mongoose";
import { User } from "../models/user.model";
import Members from "../models/member.model";
import { MessageModel, ReactionModel } from "../models/message.model";
import { timeStamp } from "console";

export const generateCode = () => {
  const code = Array.from(
    { length: 6 },
    () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
  ).join("");
  return code;
};

export const populateUser = (id: ObjectId) => {
  return User.findById(id);
};

export const getMember = (workspaceId: ObjectId, userId: ObjectId) => {
  return Members.findOne({ workspaceId, userId });
};

export const populateMember = (userId: ObjectId) => {
  return Members.findById(userId);
};

export const populateReactions = (messageId: ObjectId) => {
  return ReactionModel.find({ messageId });
};

export const populateThread = async (messageId: ObjectId) => {
  const messages = await MessageModel.find({ parentMessageId: messageId });

  if(messages.length  === 0){
    return {
      count : 0,
      image: undefined,
      timestamp:0
    }
  }

  const lastMessage = messages[messages.length -1];
  const lastMessageMember = await populateMember(lastMessage.memberId);

  if(!lastMessageMember){
    return {
      count:0,
      image:undefined,
      timestamp:0
    }
  }

await populateUser(lastMessageMember.userId);
  return {
    count:messages.length,
    image:lastMessage.imageUrl, 
    timestamp:lastMessage.createdAt
  }

};
