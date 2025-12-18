const mongoose=require("mongoose");
const { id, ta } = require("zod/v4/locales");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const user = new Schema({
    name:{type:String , unique:true, required:true},
    email:{type: String, unique:true, required:true},
    password:{type:String,  required:true},
    profile:String,
    post_ids:[ObjectId]
    
})

const post =new Schema({
    userId:ObjectId,
    url:String,
    type:String,
    time:String,
    title:String,
    description:String,
    tags:[String],


})

const userModel= mongoose.model("users",user);
//const todoModel= mongoose.model("todos",todo);

module.exports={
    userModel:userModel
    //todoModel:todoModel
} 
