const mongoose= require("mongoose")

const ChatModel= mongoose.Schema({
    "S_id":"String",
    "R_id":"String",
    "chat":"String",
    'time':"String"
    // createdAt:new Date(0)
},
{
timestamps:true
})

module.exports= new mongoose.model("chat",ChatModel,"chat")