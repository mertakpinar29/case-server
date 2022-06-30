import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    // connecting to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to db");
  } catch (err) {
    console.log(err);
  }
});
