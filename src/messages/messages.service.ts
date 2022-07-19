import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import * as mongoose from 'mongoose';

import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async createMessage(
    createMessageDto: CreateMessageDto,
    userId: string,
  ): Promise<string> {
    this.logger.log(
      `Sending message from ${userId} to ${createMessageDto.dest}`,
    );

    const message = new this.messageModel({
      ...createMessageDto,
      user: userId,
    });

    return await message
      .save()
      .then((response) => response._id?.toString())
      .catch(() => {
        throw new BadRequestException('Can not send message');
      });
  }
  async findUserContacts(userId: string) {
    this.logger.log(`Finding user ${userId} friends`);
    const contacts = await this.messageModel.aggregate([
      {
        $match: {
          $or: [
            { user: new mongoose.Types.ObjectId(userId) },
            { dest: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      { $group: { _id: '$dest' } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                id: '$_id',
                username: '$username',
                email: '$email',
                stripeAccountId: '$stripeAccountId',
                donationProductId: '$donationProductId',
                profilePicture: '$profilePicture',
              },
            },
          ],
          as: 'dest',
        },
      },
      {
        $project: {
          dest: { $arrayElemAt: ['$dest', 0] },
        },
      },
    ]);
    return contacts
      .filter((response) => response._id?.toString() !== userId)
      .filter((response) => response._id !== null);
  }

  async findContactMessages(userId: string, friendId: string) {
    this.logger.log(`Finding user ${userId} messages`);

    return await this.messageModel
      .find({
        $or: [
          { user: userId, dest: friendId },
          { user: friendId, dest: userId },
        ],
      })
      .populate('user')
      .populate('dest')
      .sort({ createdAt: -1 })
      .catch(() => {
        this.logger.error(`Can not find  "${userId}"`);
        throw new NotFoundException(`Can not find  "${userId}"`);
      });
  }
}
