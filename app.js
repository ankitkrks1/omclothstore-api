const express = require("express");
//DB Connection
require("./DB/mongoose");
//Routers
const productRouter = require('./Routers/productRouter')
const userRouter = require("./Routers/userRouter");
//Cors
const cors = require("cors");
const billRouter = require("./Routers/billRouter");

const port = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());


app.use(productRouter)
app.use(billRouter)
app.use(userRouter)


app.listen(port, () => {
  console.log(`Server is Running in port ${port}`);
});

