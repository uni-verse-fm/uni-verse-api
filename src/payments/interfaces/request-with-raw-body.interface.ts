/* Copyright (c) 2022 uni-verse corp */

import { Request } from 'express';

interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

export default RequestWithRawBody;
