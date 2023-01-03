import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user";
import { connectMongoDB } from "./db/mongoose";

connectMongoDB().catch((error) => {
  console.error(error);
});

const app: express.Application = express();
const PORT: number = (process.env.PORT as unknown as number) || 3000;

app.use(cors());
app.use(express.json());
app.use(userRouter);

app.listen(PORT, () => {
  console.log(`----- > { Server is running on http://localhost:${PORT}/ }`);
});
