/* Copyright (c) 2022 uni-verse corp */

import { SetMetadata } from '@nestjs/common';
export const Public = () => SetMetadata('isPublic', true);
