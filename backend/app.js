const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const postsRoute = require("./routes/posts");
const userRoute = require("./routes/user");
const path = require('path');

//Get Express App
const app = express();


const connection = "mongodb://localhost:27017";

//Connect to Mongodb via Mongoose
mongoose.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to database..');
  })
  .catch((err) => {
    console.log(err);
    console.log('Connection Failed');
  });

//body parse to json all incoming requests, this converts it to all express requests..
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// This will allow static file images to be served from express
app.use("/images", express.static(path.join('backend/images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  next();
});

//Make express aware of our imported routes..
app.use("/api/posts", postsRoute);
app.use("/api/user", userRoute);

module.exports = app;
