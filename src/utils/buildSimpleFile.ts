/* Copyright (c) 2022 uni-verse corp */

import { SimpleCreateFileDto } from '../files/dto/simple-create-file.dto';

export const buildSimpleFile = (
  data: Map<string, SimpleCreateFileDto>,
  trackName: string,
): SimpleCreateFileDto => ({
  originalFileName: trackName,
  buffer: data.get(trackName).buffer,
  size: data.get(trackName).size,
  mimetype: data.get(trackName).mimetype,
});
