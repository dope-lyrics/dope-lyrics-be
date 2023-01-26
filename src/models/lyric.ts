import mongoose, { Model, Schema, model } from "mongoose";

export interface ILyric {
  _id?: string;
  lyric: string;
  mood: string;
  singer: string;
  language: string;
  song: string;
  owner: mongoose.Schema.Types.ObjectId;
}

interface ILyricMethods {}

interface LyricsModel extends Model<ILyric, {}, ILyricMethods> {}

const lyricSchema = new Schema<ILyric, LyricsModel, ILyricMethods>(
  {
    lyric: { type: String, trim: true, required: true },
    mood: { type: String, required: true, default: "uncertain" },
    singer: { type: String, required: true },
    language: { type: String },
    song: { type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Lyric = model<ILyric, LyricsModel>("Lyric", lyricSchema);

export { Lyric };