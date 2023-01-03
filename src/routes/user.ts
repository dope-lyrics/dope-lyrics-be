import express from "express";
import { User } from "../models/user";

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  res.send();
});

userRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    console.log({ user, token });

    res.send({ user: user, token });
  } catch (error: any) {
    res.status(400).send({ error: error?.toString() });
  }
});

userRouter.post("/register", async (req, res) => {
  const user = new User({
    email: req.body?.email,
    password: req.body?.password,
  });

  try {
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
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

export { userRouter };
