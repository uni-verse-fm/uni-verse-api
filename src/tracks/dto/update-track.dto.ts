/* Copyright (c) 2022 uni-verse corp */

import { PartialType } from '@nestjs/swagger';
import { CreateTrackDto } from './create-track.dto';

export class UpdateTrackDto extends PartialType(CreateTrackDto) {}
