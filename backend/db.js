const mongoose=require("mongoose");
const { ps } = require("zod/v4/locales");
const { id, ta } = require("zod/v4/locales");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const user = new Schema({
    name:{type:String , unique:true, required:true},
    email:{type: String, unique:true, required:true},
    password:{type:String,  required:true},
    profile_url:String,
    post_ids:[{ type: mongoose.Schema.Types.ObjectId, ref: "posts" }]
    
})

const post =new Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
    },
    url:String,
    type:String,
    time:String,
    title:String,
    description:String,
    tags:String,

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }]
})

const userModel= mongoose.model("users",user);
const postModel= mongoose.model("posts",post);

module.exports={
    userModel:userModel,
    postModel:postModel
} 
