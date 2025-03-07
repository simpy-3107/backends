const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');

const indexrouter = require("./routes/indexroutes");
const userrouter = require("./routes/userroutes");
const productrouter = require("./routes/productroutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




connectDB();
app.use("/",indexrouter);
app.use("/user",userrouter);
app.use("/product",productrouter);
app.listen(4000);



