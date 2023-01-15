import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user";
import { connectMongoDB } from "./db/mongoose";
import { lyricsRouter } from "./routes/lyrics";

connectMongoDB();

const app: express.Application = express();
const PORT: number = (process.env.PORT as unknown as number) || 3000;

app.use(
  cors({
    exposedHeaders: "authorization",
  })
);

app.use(express.json());
app.use(userRouter);
app.use("/lyrics", lyricsRouter);

app.listen(PORT, () => {
  console.log(`----- > { Server is running on http://localhost:${PORT}/ }`);
});
