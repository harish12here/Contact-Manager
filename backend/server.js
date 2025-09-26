const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const ContactRoute = require("./Routes/contactRoute");
const UserRoute = require("./Routes/UserRoute");

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// app.get('/',(req,res)=>{
//     res.send("API is running...");
// });
app.use("/", ContactRoute);
app.use("/auth/", UserRoute);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
