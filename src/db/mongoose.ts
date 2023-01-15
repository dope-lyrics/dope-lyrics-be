import mongoose from "mongoose";

async function connectMongoDB() {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(
      `mongodb+srv://onrszk:${process.env.MONGODB_PASSWORD}@dope-lyrics.gjdklyz.mongodb.net/`,
      {
        dbName: process.env.DB_NAME,
        retryWrites: true,
        w: "majority",
      }
    );
  } catch (error) {
    console.log("Couldn't connect to database");
  }
}

export { connectMongoDB };
