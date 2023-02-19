import express, { response } from "express";
import { Lyric } from "../models/lyric";
import { auth } from "../middlewares/auth";

const lyricsRouter = express.Router();

lyricsRouter.use((req, res, next) => {
  next();
});

lyricsRouter.get("/", async (req, res) => {
  const { page, limit = 10 }: any = req.query;
  try {
    const lyrics = await Lyric.find({})
      .populate("owner")
      .limit(limit)
      .skip(page * limit)
      .sort({
        createdAt: "descending",
      });

    const totalLyricCount = await Lyric.estimatedDocumentCount();
    const hasMore = totalLyricCount > limit * (page + 1);

    if (!lyrics) {
      res.send({
        data: null,
        message: "There is no data.",
      });
      return;
    }

    res.send({
      data: {
        lyrics: lyrics.length > 0 ? lyrics : null,
        hasMore,
        totalCount: totalLyricCount,
      },
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
  const lyrics = new Lyric({
    ...req.body,
    owner: req.user._id,
  });

  try {
    const result = await lyrics.save();

    res.send({
      data: await Lyric.find({}),
    });
  } catch (error: any) {
    console.log("ERROR: ", error);
    res.status(400).send({ error: error?.message });
  }
});

lyricsRouter.get("/:mood", async (req, res) => {
  const mood = req.params.mood;
  try {
    const foundLyric = await Lyric.find({
      mood: mood,
    });
    res.send({
      data: foundLyric,
    });
  } catch (error) {
    res.status(404).send(404);
  }
});

/**
 * example of iterating documents of a Model, and update it.
 */
lyricsRouter.post("/modify-lyrics", async (req, res) => {
  for await (const doc of Lyric.find({})) {
    /**
     * some changes...
     * doc.lyric = []
     * */

    // save
    await doc.save();
  }
  res.send();
});

export { lyricsRouter };
