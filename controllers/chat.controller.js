const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");

const accessChats=expressAsyncHandler(async(req,res)=>{
     const {userId}=req.body;
     if(!userId){
        console.log("user id not send in the params");
        return res.status(400);
     }
     let existingChat=await Chat.findOne({
        $and:[
            {users:{$elemMatch:{$eq:req.user._id}}},
            {users:{$elemMatch:{$eq:userId}}}
        ],
     }).populate("users","-password").populate("latestMessage")

     if(existingChat){
        existingChat=await User.populate(existingChat,{
            path:"latestMessage.sender",
            select:"name email pic",
        })
        res.json(existingChat);
        // console.log(`chat that has been selected in the backend is ${existingChat}`)
     }
     else{
        
        try {
          const otherUser = await User.findById(userId).select("name");
          const newChatName = otherUser ? otherUser.name : "Chat";
          
          var newChat = {
            chatName: `${newChatName}`,
            isGroupChat: false,
            users: [req.user.id, userId],
          };
            let createChat= await Chat.create(newChat);
            let finalChat= await Chat.findById({_id:createChat._id}).populate("users","-password");
            
           res.status(200).send(finalChat);
        } catch (error) {
            throw new Error(error.message);
        }
     }
    
})

// fetching all the chats of the user
const fetchChats=expressAsyncHandler(async(req,res)=>{
       try {
          let chats=Chat.find({
            users:{$elemMatch:{$eq:req.user._id}}
          }).populate("users","-password").populate("latestMessage").populate("groupAdmin","-password");
          chats=await User.populate(chats,{
            path:"latestmessage.sender",
            select:"name email pic"
          })
          res.status(200).send(chats)
       } catch (error) {
          throw new Error(error.message);
       }
})

//create a group chat

const createGroupChat=expressAsyncHandler(async(req,res)=>{
    let groupName=req.body.groupName
    let users=JSON.parse(req.body.users)
    if(!groupName || !users){
        return res.status(400).send({message:"please fill all the fields"})
    }
    users.push(req.user);
    if(users.length < 2){
        return res.status(400).send({message:"please have more than two participants"})
    }
    
    try {
        let groupChat=await Chat.create({
            chatName:groupName,
            isGroupChat:true,
            users:users,
            groupAdmin:req.user,
        })
        
        let finalGroupChat=await Chat.findById(groupChat._id).populate("users","-password").populate("groupAdmin","-password")
        res.status(200).send(finalGroupChat)
    } catch (error) {
        throw new Error(error.message);
    }
})

//rename a groupchat

const renameGroupChat = expressAsyncHandler(async (req, res) => {
  const { chatId, newChatName } = req.body;

  // Validation: Ensure chatId and newChatName are provided
  if (!chatId || !newChatName) {
    return res
      .status(400)
      .send({ message: "Chat ID and new chat name are required." });
  }

  try {
    // Find the group chat and update its name
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: newChatName },
      { new: true } // Returns the updated document
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // If chat not found
    if (!updatedChat) {
      return res.status(404).send({ message: "Group chat not found." });
    }

    res.status(200).send(updatedChat);
  } catch (error) {
    res
      .status(500)
      .send({
        message: "Error updating group chat name.",
        error: error.message,
      });
  }
});

//add to group 

const addToGroup=expressAsyncHandler(async(req,res)=>{
    const {chatId,userId}=req.body;
    if(!chatId || !userId){
        return res.status(400).send({message:"the userID or chat id is not given"});
    }
     try {
       const updatedChat = await Chat.findByIdAndUpdate(
         chatId,
         { $addToSet: { users: userId } }, // Ensures no duplicates
         { new: true } // Return the updated document
       )
         .populate("users", "-password")
         .populate("groupAdmin", "-password");

       if (!updatedChat) {
         return res.status(404).send({ message: "Chat not found" });
       }

       res.status(200).send(updatedChat);
     } catch (error) {
       res.status(500).send({ message: error.message });
     }

})

//remove from a group

const removeFromGroup=expressAsyncHandler(async (req,res)=>{
       const { chatId, userId } = req.body

    if (!chatId || !userId) {
        return res.status(400).send({ message: "Chat ID and User ID are required" });
    }

    try {
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).send({ message: "Chat not found" });
        }

        // Check if the requesting user is the group admin
        if (chat.groupAdmin.toString() !== req.user._id.toString()) {
            return res.status(403).send({ message: "Only group admin can remove users" });
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } }, // Remove the user from the array
            { new: true } // Return the updated document
        ).populate("users", "-password").populate("groupAdmin", "-password");

        res.status(200).send(updatedChat);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})
module.exports = {
  accessChats,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
};