import express from "express";
import { User } from "../models/user";
import { auth } from "../middlewares/auth";
import jwt from "jsonwebtoken";

const userRouter = express.Router();

userRouter.post("/token", async (req, res) => {
  const refreshToken: string = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);

  try {
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    const user: any = await User.findOne({
      _id: decoded._id,
    });

    let refreshTokens: string[] | undefined =
      user?.tokens?.refreshTokens?.toObject();

    // it is not valid
    if (!refreshTokens?.includes(refreshToken)) {
      return res.status(403).send({
        message: "No valid refresh token",
      });
    }

    // delete refresh token from db
    user.tokens.refreshTokens = user?.tokens?.refreshTokens.filter(
      (token: string) => token !== refreshToken
    );

    const accessToken = await user?.generateAuthToken();
    const newRefreshToken = await user?.generateRefreshToken();
    res.send({ data: { accessToken, refreshToken: newRefreshToken } });
  } catch (error) {
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        ignoreExpiration: true,
      }
    );
    const user = await User.findOne({ _id: decoded._id });
    // @ts-ignore
    user.tokens = {};
    // @ts-ignore
    await user.save();

    res.status(403).send({
      redirect: "/",
      message: (error as Error).message,
    });
  }
});

userRouter.get("/users", async (req, res) => {
  try {
    let users = await User.find({}).populate("lyrics");

    res.send({
      data: users,
    });
  } catch (error) {
    res.status(404).send({
      data: null,
    });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );

    const accessToken = await user.generateAuthToken();
    const refreshToken = await user.generateRefreshToken();

    res.send({
      user: user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(404).send({ error: (error as Error)?.message });
  }
});

userRouter.post("/register", async (req, res) => {
  const user = new User({
    username: req.body?.username,
    password: req.body?.password,
  });

  try {
    await user.save();
    res.status(201).send({ user });
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ error: error?._message || "Error has occurred" });
  }
});

userRouter.delete("/deleteAll", async (req, res) => {
  const deletedDocsCount = await User.deleteMany({});
  res.send({
    deletedDocsCount,
  });
});

userRouter.post("/logout", auth, async (req: any, res) => {
  try {
    req.user.tokens = {};
    await req.user.save();

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
});

export { userRouter };
