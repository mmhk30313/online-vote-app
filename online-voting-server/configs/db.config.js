/**
 Module dependencies.
 */
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();
 // Production and Dev Stage Detect
 /**
  * For Running Produnction State. Start with --production Flag
  * For Running Development State. Run as normal CMD
  */
 
let dbURI;
let uri;
let isLive = false;
let dbNameLocal = 'OnlineVotingSystem';
let dbNameLive = 'online_voting_system';
let dbUserNameLive = 'online_voting_system';

if (process.env.NODE_ENV === "development") {
  
  console.log("Running at Development State");

  //  console.log("\n ########### \n");
  console.log(
  "\x1b[42m%s\x1b[0m",
  "Application was Running at localDB. Any Change Can Be Done"
  );
  console.log("\n ########### \n");

  // Local Config
  dbURI = `mongodb://localhost:27017/${dbNameLocal}`;
  uri = "localhost://27017";

}

module.exports = mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
                  .then(() => {
                    console.log("Mongodb Connected at", uri);

                    !isLive && console.log("Mongodb Connected URI", dbURI);

                  //  log("Mongodb Connected at" + uri);
                  })
                  .catch(error => console.log("Mongodb Error: " + error));
