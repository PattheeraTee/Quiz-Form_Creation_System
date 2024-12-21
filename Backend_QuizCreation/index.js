require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const quizRouter = require("./src/routes/quiz");
const userRouter = require("./src/routes/user");
const testForm = require("./src/routes/formRoutes");
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
    origin: "http://localhost:3000", // ระบุโดเมนที่อนุญาต
  })
);

app.use(express.json());
app.use("/", testForm);
app.use("/", quizRouter);
app.use("/",userRouter);
