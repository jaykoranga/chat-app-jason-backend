const express=require('express')
const expressAsyncHandler=require('express-async-handler')
const Message=require('../models/message.model');
const Chat = require('../models/chat.model');
const sendMessage=expressAsyncHandler(async(req,res)=>{
   const {content,chat_id}=req.body;
   if(!content || !chat_id){
       console.warn(`invalid input || either message content is missing or user_id missing`)  
       return res.sendStatus(400);
   }
   var newMessage={
       sender:req.user._id,
       content:content,
       chat:chat_id,
   }

   try {
         const createdMessage = await Message.create(newMessage)
         const fullMessage = await Message.findById(createdMessage._id)
           .populate("sender", "name pic")
           .populate("chat");

           const temp= await Chat.findByIdAndUpdate(req.body.chat_id,{
            latestMessage:fullMessage._id
           },{
            new:true
           }).populate({
            path:"latestMessage",
            populate:{
              path:"sender",
              select:"name email pic"
            }
           }).populate("latestMessage.content")
           console.log(`latest message : ${temp.latestMessage}`);
           
         res.status(201).json(fullMessage)
   } catch (error) {
    console.error(`error sending the message : ${error.message}`)
    res.status(500).json({message:`failed to send the daata`})
   }
   
})

const recieveMessages=expressAsyncHandler(async(req,res)=>{
      
    const { chat_id } = req.params;

    if (!chat_id) {
      return res.status(400).json({ message: "Chat ID is required." });
    }

    try {
      const messages = await Message.find({ chat: chat_id }).populate("sender","name pic").populate("chat")


      res.status(200).json(messages); // Return the fetched messages
    } catch (error) {
      console.error(`Error fetching messages: ${error.message}`);
      res.status(500).json({ message: "Failed to fetch messages." });
    }
})
module.exports={sendMessage,recieveMessages};