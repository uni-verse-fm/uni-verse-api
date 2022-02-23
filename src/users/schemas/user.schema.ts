import * as mongoose from 'mongoose';
import validator from 'validator';
import * as bcrypt from 'bcrypt';

export const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minlength: 6,
      maxlength: 255,
      required: [true, 'USERNAME_IS_BLANK'],
    },
    email: {
      type: String,
      lowercase: true,
      validate: validator.isEmail,
      maxlength: 255,
      minlength: 6,
      required: [true, 'EMAIL_IS_BLANK'],
    },
    password: {
      type: String,
      minlength: 5,
      maxlength: 1024,
      required: [true, 'PASSWORD_IS_BLANK'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

UserSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    console.log(bcrypt.genSalt());

    const hashed = await bcrypt.hash(this['password'], 10);

    this['password'] = hashed;

    return next();
  } catch (err) {
    return next(err);
  }
});
