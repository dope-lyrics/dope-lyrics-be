import mongoose, { Model, Schema, model } from "mongoose";

export interface ILyrics {
  _id?: string;
  lyric: string;
  mood: string;
  singer: string;
  language: string;
  song: string;
  owner: {
    type: {
      id: mongoose.Schema.Types.ObjectId;
      email: string;
    };
  };
}

interface ILyricsMethods {}

interface LyricsModel extends Model<ILyrics, {}, ILyricsMethods> {}

const lyricsSchema = new Schema<ILyrics, LyricsModel, ILyricsMethods>(
  {
    lyric: { type: String, trim: true, required: true },
    mood: { type: String, required: true, default: "uncertain" },
    singer: { type: String, required: true },
    language: { type: String },
    song: { type: String },
    owner: {
      type: {
        id: { type: mongoose.Schema.Types.ObjectId },
        email: { type: String },
      },
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Lyrics = model<ILyrics, LyricsModel>("Lyrics", lyricsSchema);

export { Lyrics };
