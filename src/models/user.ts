import { Model, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

// 1. Create an interface representing a document in MongoDB.
interface IUser {
  _id?: string;
  email: string;
  password: string;
  tokens?: [];
}

interface IUserMethods {
  generateAuthToken(): Promise<string>;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByCredentials(email: string, password: string): Promise<any>;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// statics methods are accessible on models. aka model methods.
userSchema.static(
  "findByCredentials",
  async function findByCredentials(email, password) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Unable to login");
    }

    return user;
  }
);

// methods: are accessible on instances. aka instance methods.
userSchema.method("generateAuthToken", async function generateAuthToken() {
  const user: any = this;
  const token = jwt.sign({ _id: user._id!.toString() }, "__secret-key__");
  user.tokens = user?.tokens?.concat({ token });

  await user.save();

  return token;
});

// Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  // this : the document is being saved.
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = model<IUser, UserModel>("User", userSchema); // "User" is the collection name.

export { User };
