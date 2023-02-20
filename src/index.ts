import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user";
import { connectMongoDB } from "./db/mongoose";
import { lyricsRouter } from "./routes/lyrics";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import i18nextMiddleware from "i18next-http-middleware";

const app: express.Application = express();
const PORT: number = (process.env.PORT as unknown as number) || 3000;

connectMongoDB();

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: {
      loadPath: "./locales/{{lng}}/translation.json",
    },
  });

app.use(i18nextMiddleware.handle(i18next));
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
