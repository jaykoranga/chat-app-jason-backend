const express=require('express')
const userRoutes=express.Router();
const {registerUser,login,getAllUsers}=require('../controllers/user.controller');
const { protect } = require('../middlewares/authMiddleware');
userRoutes.post('/login',login)


userRoutes.post("/signup", registerUser);

userRoutes.get("/getAllUsers",protect,getAllUsers);

module.exports=userRoutes;