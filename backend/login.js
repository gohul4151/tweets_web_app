const express=require('express');
const bcrypt=require('bcrypt');
const mongoose=require('mongoose');
const {userModel}=require('./db');
const jwt = require('jsonwebtoken');
const cors = require("cors");


mongoose.connect("mongodb+srv://dharaneesh1881:Dd%409790361881@cluster0.su0jsfi.mongodb.net/tweet");
const JWT_SECRET="dharaneesh1881";
const app= express();
app.use(express.json());
app.use(cors());

app.post("/signup",async function(req,res){

    const name=req.body.name ; 
    const email=req.body.email;
    const password=req.body.password;
    
    
    const hashedpassword= await bcrypt.hash(password,5);
    
    await userModel.create({
        name:name,
        email:email,
        password:hashedpassword
        
    });

    res.json({
        message:"User signed up"
    });
 
});

app.post("/login", async function(req,res){

    const email=req.body.email;
    const password=req.body.password;
 
    const user = await userModel.findOne({
        email:email
    })

    if(!user){
        res.status(403).json({
            message:"user does not exit "
        });
        return ;
    }

    const passwordMatch = await bcrypt.compare(password,user.password);

    if(passwordMatch){
        const token =jwt.sign({
            id:user._id
        },JWT_SECRET);

        res.json({
            token:token
        });

    }
    else{
        res.status(403).json({
            message:"incorrect cretentials"
        })
    }

});


function auth(req,res,next){
    const token = req.header.token
    
    const decoded = jwt.verify(token,JWT_SECRET);

    if(decoded){
        req.userId=decoded.id;
        next();
    }
    else{
        res.status(403).json({
            message:"incorrect cretentials"
        })
    }

}

app.listen(3000);