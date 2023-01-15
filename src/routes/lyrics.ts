import express, { response } from "express";
import { Lyrics } from "../models/lyrics";
import { auth } from "../middlewares/auth";

const lyricsRouter = express.Router();

lyricsRouter.use((req, res, next) => {
  console.log("In router middleware");
  next();
});

lyricsRouter.get("/", async (req, res) => {
  try {
    const lyrics = await Lyrics.find({});

    if (!lyrics) {
      res.send({
        data: null,
        message: "There is no data.",
      });
      return;
    }

    res.send({
      data: lyrics,
      message: null,
    });
  } catch (error) {
    res.status(404).send({
      data: null,
      message: "Not Found",
    });
  }
});

lyricsRouter.post("/add", auth, async (req: any, res) => {
  const lyrics = new Lyrics({
    ...req.body,
    owner: {
      _id: req.user._id,
      email: req.user.email,
    },
  });

  console.log("new lyric is : ", lyrics);

  try {
    const result = await lyrics.save();
    console.log("result is : ", result);

    res.send({
      data: await Lyrics.find({}),
    });
  } catch (error: any) {
    console.log("ERROR: ", error);
    res.status(400).send(error.toString());
  }
});

lyricsRouter.get("/:mood", async (req, res) => {
  console.log("in /:mood");
  const mood = req.params.mood;
  try {
    const foundLyric = await Lyrics.find({
      mood: mood,
    });
    console.log("foundLyric:", foundLyric);
    res.send({
      data: foundLyric,
    });
  } catch (error) {
    res.status(404).send(404);
  }
});

export { lyricsRouter };
