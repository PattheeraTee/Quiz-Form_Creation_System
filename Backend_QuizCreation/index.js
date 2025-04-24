require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const app = express();
const cors = require("cors");
const userRouter = require("./src/routes/userRoute");
const formRouter = require("./src/routes/formRoutes");
const responseRouter = require("./src/routes/responseRoutes");
const generateFormRouter = require("./src/routes/geminiRoutes");
const port = 3001;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => console.log(err));

app.use(
  cors({
    // origin: "http://localhost:3000", // ระบุโดเมนที่อนุญาต
    origin: "http://10.198.200.33:3000", // ระบุโดเมนที่อนุญาต
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/form", formRouter);
app.use("/response", responseRouter);
app.use("/", generateFormRouter);
app.use("/",userRouter);
