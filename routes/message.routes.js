const express =require('express');
const { protect } = require('../middlewares/authMiddleware');
const { sendMessage, recieveMessages } = require('../controllers/message.controller');
const messageRouter=express.Router()

messageRouter.route('/').post(protect,sendMessage);
messageRouter.route('/:chat_id').get(protect,recieveMessages);
module.exports=messageRouter;