const mongoose = require("mongoose");

async function dbStart () {
    const mongodb = await mongoose.connect("mongodb://localhost:27017/uniland-react");
    // console.log("Db Connected",mongodb)
}

module.exports=dbStart
