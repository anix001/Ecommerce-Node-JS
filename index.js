const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 5000;
const authRoute = require("./routes/authRoutes");
const productRoute = require("./routes/productRoutes");
const bodyParser = require('body-parser');
const {notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser =  require('cookie-parser');
const morgan = require('morgan');

//dbConnect
dbConnect();

// logger middleware 
app.use(morgan());
//bodyparser()
app.use(bodyParser());
app.use(bodyParser.urlencoded({extended:false}));
//middleware for parsing cookies
app.use(cookieParser());

//routes
app.use("/api/user", authRoute);
app.use("/api/product", productRoute);

//error handler
app.use(notFound);
app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`Server is Running on ${PORT}.`);
})