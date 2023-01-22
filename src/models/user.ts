import { Model, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
export interface IUser {
  _id?: string;
  email: string;
  password: string;
  tokens?: {
    accessToken: string;
    refreshTokens: [];
  };
}

interface IUserMethods {
  generateAuthToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
  toJSON(): any;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByCredentials(email: string, password: string): Promise<any>;
}

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
    tokens: {
      accessToken: {
        type: String,
      },
      refreshTokens: [
        {
          type: String,
        },
      ],
    },
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
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Unable to login");
    }

    return user;
  }
);

userSchema.method("generateAuthToken", async function generateAuthToken() {
  const user: any = this;
  const accessToken = jwt.sign(
    {
      _id: user._id!.toString(),
      email: user.email.toString(),
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "5s" }
  );

  // user.tokens = user?.tokens?.concat({ accessToken });
  user.tokens.accessToken = accessToken;

  await user.save();

  return accessToken;
});

userSchema.method(
  "generateRefreshToken",
  async function generateRefreshToken() {
    const user: any = this;
    const refreshToken = jwt.sign(
      {
        _id: user._id!.toString(),
        email: user.email.toString(),
      },
      process.env.REFRESH_TOKEN_SECRET as string
    );

    user.tokens.refreshTokens.push(refreshToken);
    await user.save();

    return refreshToken;
  }
);

// Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// do not send these fields in response.
// when we pass object into res.send, it implicitly call JSON.stringify.
// JSON.stringify calls toJSON function of the object.
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject["__v"];
  delete userObject["_id"];

  return userObject;
};

const User = model<IUser, UserModel>("User", userSchema);

export { User };
