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
      return res.sendStatus(403);
    }

    // delete refresh token from db
    user.tokens.refreshTokens = user?.tokens?.refreshTokens.filter(
      (token: string) => token !== refreshToken
    );

    const accessToken = await user?.generateAuthToken();
    const newRefreshToken = await user?.generateRefreshToken();
    res.send({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.log(error);
    res.sendStatus(403);
  }
});

userRouter.get("/users", async (req: any, res) => {
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

// for testing purpose
userRouter.post("/add", auth, async (req: any, res) => {
  res.send({
    user: req.user,
    token: req.token,
  });
});

userRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const accessToken = await user.generateAuthToken();
    const refreshToken = await user.generateRefreshToken();

    res.send({
      user: user,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    res.status(404).send({ error: error?.message });
  }
});

userRouter.post("/register", async (req, res) => {
  const user = new User({
    email: req.body?.email,
    password: req.body?.password,
  });

  try {
    const accessToken = await user.generateAuthToken();
    res.status(201).send({ user, accessToken });
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

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
  }
});
export { userRouter };
