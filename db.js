require("dotenv").config();
const mongoose = require('mongoose');
const process = require("node:process");

const Database = {
    _connect: function(){
        let uri = process.env.MONGODB_URI;
        mongoose.connect(uri)
       .then(() => {
          //  console.log('Database connection successful')
       })
       .catch(err => {
            console.log(err)
            console.error('Database connection error')
       })
    }
}

exports.Database = Database;
