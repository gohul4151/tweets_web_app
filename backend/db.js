const mongoose=require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const user = new Schema({
    name:String,
    email:String,
    password:String
    
})

// const userpage =new Schema({
//     name:String,
//     userId:ObjectId

// })

const userModel= mongoose.model("users",user);
//const todoModel= mongoose.model("todos",todo);

module.exports={
    userModel:userModel
    //todoModel:todoModel
} 
