const asyncHandler=require('express-async-handler')
const User =require('../models/user.model')
const createJwt=require('../createJwt')
const generateToken=require('../createJwt')
const bcrypt=require('bcrypt')
// registering user

const registerUser = asyncHandler(async (req,res) => {

  const{name,email,password,pic}=req.body;
  if(name===""|| email===""||password===""){
    res.status(400)
    throw new Error("some feilds are empty ")
  }
  const userExist=await User.findOne({email})
  if(userExist){
    res.status(400);
    throw new Error("user already exists");
    return;
  }
  
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);

  const user=await User.create({
    name,
    email,
    password:hashedPassword,
    pic
  })
  if(user)res.status(200).json({
    _id:user._id,
    name:user.name,
    email:user.email,
    pic:user.pic,
    jwt:createJwt(user._id)
  })
  else{
    res.status(400)
    throw new Error("user creation failed")
    return;
  }

});

//log in the user

const login=asyncHandler(async (req,res)=>{
    const{email,password}=req.body;
     
    if (!email || !password) {
       res.status(400);
       throw new Error("Email and password are required");
     }

      const user = await User.findOne({ email });

       if (user && (await bcrypt.compare(password, user.password))) {
         res.status(200).json({
           _id: user._id,
           name: user.name,
           email: user.email,
           pic: user.pic,
           jwt: generateToken(user._id),
         });
       } 
       
       else {
         res.status(401); // Unauthorized
         throw new Error("Invalid email or password");
         
       }
       console.log(res.jwt)
})

//getting all users info 
const getAllUsers=asyncHandler(async (req,res)=>{
  console.log("the user logged in is :",req.user)  
  const search=req.query.name || "";
  // this is a comment that i am creating<>well that was all<>
  
     const allUSers=await User.find({
      $or:[
        {name:{$regex:search,$options:"i"}},
        {email:{$regex:search,$options:"i"}}
      ],
      _id: {$ne:req.user.id},
     }).select("name email password")
     if(!allUSers) res.json([])
      else res.status(200).json(allUSers);
       
     
})


module.exports={registerUser,login,getAllUsers};