import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user";

interface IRequest extends Request {
  token?: string;
  user?: any;
}

export async function auth(req: IRequest, res: Response, next: NextFunction) {
  try {
    const [_, token] = req.headers["authorization"]?.split(" ") as string[];

    if (!token) {
      res.status(403).send({
        message: "User not authenticated",
        redirect: "/login",
      });
      return;
    }

    const decoded: any = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.accessToken": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log("Auth error: ", error);
    res.status(401).send({ error: "Please authenticate" });
  }
}
