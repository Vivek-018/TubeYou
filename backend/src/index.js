import dotenv from "dotenv";
import ConnectDB from "./db/connect.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

ConnectDB()
  .then(() => {
    app.on("ERROR", (error) => {
      console.log("error", error);
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is listening on ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGODB connection Error", err);
  });

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";

// First approach to connect with the database

/* import express from "express";
const app = express();
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    app.on("ERROR", (err) => {
      console.log("error", err);
      throw err;
    });

    app.listen(`${process.env.PORT}`, () => {
      console.log(`app is listening on ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
})()
*/
