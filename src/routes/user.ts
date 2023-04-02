import express from "express";
import { User } from "../models/user";
import { auth } from "../middlewares/auth";
import jwt from "jsonwebtoken";
import { decryptUserData } from "../utils/crypto";
import { sendVerificationEmail } from "../utils/email";

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
      data: {
        user: user,
        accessToken,
        refreshToken,
      },
      error: null,
    });
  } catch (error) {
    res.status(404).send({ error: (error as Error)?.message });
  }
});

userRouter.post("/register", async (req, res) => {
  if (
    !req.body.username ||
    !req.body.password ||
    !req.body.passwordConfirm ||
    !req.body.email
  ) {
    res.status(400).send({ error: req.t("common.error.missingInputs") });
    return;
  }

  if (req.body.password !== req.body.passwordConfirm) {
    res.status(400).send({
      error: req.t("register.form.validation.password.dontMatch"),
    });
    return;
  }

  const userData = {
    username: req.body?.username,
    password: req.body?.password,
    email: req.body?.email,
  };

  const user = await User.findOne({
    username: userData.username,
  });

  if (user) {
    return res.status(404).send({
      data: null,
      error: req.t("register.form.validation.user.alreadyInUse"),
    });
  }

  try {
    const info = await sendVerificationEmail({
      to: userData.email,
      subject: req.t("register.email.verification"),
      data: userData,
      req: req,
    });

    res.send({
      data: {
        message: `${req.t("register.result.success", {
          email: userData.email,
        })}`,
      },
      error: null,
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: (error as Error).message,
    });
  }
});

userRouter.post("/verify/:code", async (req, res) => {
  const code = req.params.code;
  if (!code) {
    res.status(400).send({
      data: null,
      error: "Code is missing!",
    });
  }

  try {
    const decryptedUserData = decryptUserData(code);

    if (new Date().getTime() > decryptedUserData.exp.getTime()) {
      return res.status(404).send({
        data: null,
        error: "Link is expired",
      });
    }

    const isAlreadyVerified = await User.findOne({
      username: decryptedUserData.username,
    });

    if (isAlreadyVerified) {
      return res.status(404).send({
        data: null,
        error: req.t("register.form.validation.user.alreadyVerified"),
      });
    }

    const user = await new User({
      username: decryptedUserData.username,
      password: decryptedUserData.password,
      email: decryptedUserData.email,
    });

    const accessToken = await user.generateAuthToken();
    const refreshToken = await user.generateRefreshToken();

    await user.save();

    res.send({
      data: {
        user: user,
        accessToken,
        refreshToken,
      },
      error: null,
    });
  } catch (error) {
    res.status(404).send({
      data: null,
      error: req.t("common.error.generic"),
    });
  }
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
