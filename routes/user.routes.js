const express=require('express')
const userRoutes=express.Router();
const {registerUser,login,getAllUsers}=require('../controllers/user.controller');
const { protect } = require('../middlewares/authMiddleware');
userRoutes.post('/login',(req,res)=>{
      login(req,res);
})


userRoutes.post("/signup", (req,res) => {
    registerUser(req,res);
});

userRoutes.get("/getAllUsers",protect,getAllUsers);

module.exports=userRoutes;