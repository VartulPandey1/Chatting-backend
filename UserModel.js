const mongoose= require("mongoose")


const userModel= new mongoose.Schema({
    "username":"String",
})

module.exports= new mongoose.model("users",userModel,"users")