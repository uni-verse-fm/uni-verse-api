import { BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

export const isValidId = (id: string): void => {
  if (!ObjectId.isValid(id)) throw new NonValidIdException();
};

export class NonValidIdException extends BadRequestException {
  constructor() {
    super('Not valid id');
  }
}
