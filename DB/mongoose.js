const mongoose = require("mongoose");

const url = process.env.MONGODB_URL;

mongoose
  .connect(url)
  .then(() => console.log("DB Connected"))
  .catch((e) => console.log("Something went Wrong in Db connection"));
