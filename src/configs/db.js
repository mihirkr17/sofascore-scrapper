
const mongoose = require("mongoose");
const { retry } = require("../utils/core");
const { DB_URL } = require("./constant");

async function connectToDB() {
   // console.log(DB_URL);
   return retry(async function () {
      if (DB_URL) {
         await mongoose.connect(DB_URL);
         console.log("Database connected successfully.");
      }
   }, 50)();
}

module.exports = connectToDB;