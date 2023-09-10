const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 5000;
const authRoute = require("./routes/authRoutes");
const bodyParser = require('body-parser');
const {notFound, errorHandler } = require('./middlewares/errorHandler');

//dbConnect
dbConnect();
//bodyparser()
app.use(bodyParser());
app.use(bodyParser.urlencoded({extended:false}));

//routes
app.use("/api/user", authRoute);

//error handler
app.use(notFound);
app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`Server is Running on ${PORT}.`);
})