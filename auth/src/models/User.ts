import mongoose from 'mongoose';
import { Password } from '../services/password';

// An interface that describes the properties
// that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describe the proprties
// that a User model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describe the properties
// that a User document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  //   createdAt: string; // more properties can be added so types get defines as per data retreival needs
  //   updatedAt: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre('save', async function (done) {
  // save a user if it is either a new user or an old user is updating the password
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);

    done();
  }
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

const user = User.build({
  email: 'test@test.com',
  password: 'password',
});

// user.email
// user.password

export { User };
