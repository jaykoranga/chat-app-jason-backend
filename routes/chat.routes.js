const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  accessChats,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chat.controller");
const chatRoutes = express.Router();

chatRoutes.route("/").post(protect,accessChats)
chatRoutes.route("/").get(protect,fetchChats)

chatRoutes.route("/group").post(protect,createGroupChat) 
chatRoutes.route("/rename").put(protect,renameGroupChat)
chatRoutes.route("/groupAdd").put(protect,addToGroup)
chatRoutes.route("/groupRemove").put(protect,removeFromGroup)




module.exports = chatRoutes;
