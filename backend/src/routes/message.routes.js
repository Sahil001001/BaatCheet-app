import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getMessages, sendMessage, deleteMessage } from "../controllers/message.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, upload.single('image'), sendMessage);
router.delete("/:id", protectRoute, deleteMessage);

export default router;

