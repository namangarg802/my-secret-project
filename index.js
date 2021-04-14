
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require('ejs');
const app = express();
const dotenv= require('dotenv');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');
dotenv.config();
const { MongoClient } = require("mongodb");
const mongoose = require('mongoose');
const assert=require('assert');
const encrypt=require('mongoose-encryption');
const url='mongodb+srv://atharvgarg:atharvgarg@cluster0.d5oez.mongodb.net/test';
const dbName='fruitsDB';
const client =new MongoClient(url,{ useNewUrlParser: true, useUnifiedTopology: true });
  mongoose.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true });



const userSchema= new mongoose.Schema({
  name:String,
  username:String,
  password:String,
  secrets:[String]
});

const secret="mysecret.";
userSchema.plugin(encrypt, { secret: secret,encryptedFields: ["password"] });
// var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;
const User=new mongoose.model("User",userSchema);



app.get("/",function(req,res){
 // console.log(md5("namangarg@8"));
  res.render("home");
});
app.get("/register",function(req,res)
{
  res.render("register");
})
app.post("/register", (req,res)   =>  {
  console.log(req.body.username);
  const usern=req.body.username;
   User.findOne({username:req.body.username},(err,result)=>{
     console.log(result);
    if(!err)
    {
      if(result)
           res.render("registered",{registerinfo:"Email already registered"});
      else
      {
        const user=new User({
          name:req.body.name,
          username:req.body.username,
          password:req.body.password
        });
        // User.insertMany(user,function(err){
        //   if(err){
        //     console.log(err);
        //
        //   }
        user.save(err=>{
          if(err){
              console.log(err);

            }
            else{
              console.log("success");
                res.render("registered",{registerinfo:"registerd successfully"});
            }
        })
      }
    }
  });
});

app.get("/login",(req,res)=>{
  res.render("login");
});
app.post("/login",(req,res)=>{
  User.findOne({username:req.body.username},(err,result)=>{
    if(!err)
    {
      if(result)
      {
        if(result.password===req.body.password)
        {
          console.log("logged in successfully");
          res.render("loggedin",{logininfo:"Logged in successfully",button:"no",username:req.body.username});
        }
         else
         {
           console.log("incorrect password");
              res.render("loggedin",{logininfo:"Incorrect password!!please try again",button:"yes"});
         }
      }
    }
    else{
      console.log(err);
    }
  })
})
// app.post("/loggedin",(req,res)=>{
//   res.render("secrets");
// })
app.get("/secrets/:user",(req,res)=>{
  res.render("secrets",{username:req.params.user});
})
app.post("/secrets/:user",(req,res)=>{
console.log(req.params.user);
console.log(req.body.value);
User.findOneAndUpdate({username:req.params.user},{ $push: { secrets: req.body.value }},(err,result)=>{
  console.log(result);
  if(!err)
  {
    if(result)
    {
       console.log("updated");
       // res.render("final",{lists:result.secrets});

       res.render("saved");
    }
  }
})

});
app.get("/final/:user",(req,res)=>{
  User.findOne({username:req.params.user},(err,result)=>{
    console.log(result);
    if(!err)
    {
      if(result)
      {
        console.log("found!!");
        res.render("final",{lists:result.secrets});
      }
    }
  })
});

app.listen(3000,function()
{
  console.log("server started on port 3000");
})
