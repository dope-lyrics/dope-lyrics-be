import { Model, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
export interface IUser {
  _id?: string;
  username: string;
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
  findByCredentials(username: string, password: string): Promise<any>;
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      validate(value: string) {
        if (!validator.isLength(value, { min: 6 })) {
          throw new Error("Username name must contain at least 6 character");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value: string) {
        if (!validator.isLength(value, { min: 3 })) {
          throw new Error("Password must contain at least 3 character");
        }
      },
    },
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

userSchema.virtual("lyrics", {
  ref: "Lyric",
  localField: "_id",
  foreignField: "owner",
});

// for including the virtual in res.send() on express
userSchema.set("toObject", { getters: true });

// statics methods are accessible on models. aka model methods.
userSchema.static(
  "findByCredentials",
  async function findByCredentials(username, password) {
    const user = await User.findOne({ username });

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
      username: user.username.toString(),
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
        username: user.username.toString(),
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
  // delete userObject["_id"];

  return userObject;
};

const User = model<IUser, UserModel>("User", userSchema);

export { User };
