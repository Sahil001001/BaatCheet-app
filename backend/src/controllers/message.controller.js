import User from "../models/user.model.js"
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { Readable } from 'stream';

// Import socket.io instance (we'll need to pass it from index.js)
let io = null;
export const setSocketIO = (socketIO) => {
  io = socketIO;
};

export const getUsersForSidebar = async (req,res)=>{
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id : {$ne : loggedInUserId }}).select("-password");

        res.status(200).json(filteredUsers);

    }catch(err){
        res.status(500).json({message : "Internal server error"})
    }
}

export const getMessages = async (req,res)=>{
    try{
        const {id:userToChatId} = req.params;
        const myId = req.user._id;

        await Message.updateMany({
            senderId: userToChatId,
            receiverId: myId,
            seen: false
        }, { seen: true, seenAt: new Date() });

        const messages = await Message.find({
            $or:[
                {senderId : myId , receiverId : userToChatId},
                {senderId : userToChatId , receiverId : myId},
            ],
        });
        res.status(200).json(messages);

    }catch(err){
        res.status(500).json({message : "Internal error occured"});
    }
}

export const sendMessage = async (req,res)=>{
    try{
        const {text, receiverId, image} = req.body;
        const senderId = req.user._id;

        let imageUrl;

        if (req.file) {
            // Handle file upload via multer
            const stream = Readable.from(req.file.buffer);
            
            const uploadResponse = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "chat-images",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                
                stream.pipe(uploadStream);
            });
            
            imageUrl = uploadResponse.secure_url;
        } else if (image && image.startsWith('data:image')) {
            // Handle base64 image data from frontend
            const uploadResponse = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    image,
                    {
                        folder: "chat-images",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });
            
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });
        
        await newMessage.save();

        // Emit socket event for real-time updates
        if (io) {
            io.to(receiverId).to(senderId).emit("receive_message", newMessage);
        }

        res.status(201).json(newMessage);

    }catch(err){
        console.error("🔍 DEBUG - Error in sendMessage:", err);
        res.status(500).json({message : "Internal error occured"});
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const userId = req.user._id;
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        if (
            message.senderId.toString() !== userId.toString() &&
            message.receiverId.toString() !== userId.toString()
        ) {
            return res.status(403).json({ message: "Not authorized to delete this message" });
        }
        await Message.findByIdAndDelete(messageId);
        
        // Emit socket event for real-time updates
        if (io) {
            io.to(message.receiverId).to(message.senderId).emit("delete_message", { messageId });
        }
        
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Internal error occurred" });
    }
};