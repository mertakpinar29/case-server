import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";

import router from "./routers/router.js";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use("/", router);

export default app;
