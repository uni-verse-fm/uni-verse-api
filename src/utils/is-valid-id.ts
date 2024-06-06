/* Copyright (c) 2022 uni-verse corp */

import { BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

export const isValidId = (id: string): void => {
  if (!isValidObjectId(id)) throw new NonValidIdException();
};

export class NonValidIdException extends BadRequestException {
  constructor() {
    super('Not valid id');
  }
}
