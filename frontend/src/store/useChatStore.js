import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { socket } from "../lib/socket.js";
import { useAuthStore } from "./useAuthStore";
import isEqual from "lodash/isEqual";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      if (Array.isArray(res.data)) {
        set({ users: res.data });
      } else {
        console.error("Expected array of users, got:", res.data);
        set({ users: [] });
        toast.error("Invalid response format from server.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ users: [] });
      toast.error(error.response?.data?.message || "Failed to load users.");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      let messages = res.data;
      const authUser = useAuthStore.getState().authUser;
      const isReceiverOnline = get().isUserOnline(userId);
      if (isReceiverOnline) {
        messages = messages.map(msg =>
          msg.senderId === authUser._id && msg.receiverId === userId && !msg.seen
            ? { ...msg, delivered: true }
            : msg
        );
      }
      set({ messages });
      socket.emit("mark_seen", { senderId: userId, receiverId: authUser._id });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages.");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const authUser = useAuthStore.getState().authUser;
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    
    console.log("🔍 DEBUG - Sending message data:", {
      text: messageData.text,
      hasImage: !!messageData.image,
      imageLength: messageData.image?.length || 0
    });
    
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };
    
    set((state) => ({
      messages: [...state.messages, tempMessage],
    }));
    
    const socketData = {
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
    };
    
    console.log("🔍 DEBUG - Emitting socket data:", {
      hasImage: !!socketData.image,
      imageLength: socketData.image?.length || 0
    });
    
    socket.emit("send_message", socketData);
  },

  deleteMessage: async (messageId) => {
    const { selectedUser } = get();
    const authUser = useAuthStore.getState().authUser;
    try {
      await axiosInstance.delete(`/message/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
      socket.emit("delete_message", {
        messageId,
        senderId: authUser._id,
        receiverId: selectedUser?._id,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  deleteMessageForMe: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== messageId),
    }));
  },

  subscribeToMessages: () => {
    socket.off("receive_message");
    socket.off("delete_message");
    socket.off("messages_seen");
    
    socket.on("receive_message", (message) => {
      set((state) => {
        const existingTempIndex = state.messages.findIndex(
          msg => msg.isTemp && 
          msg.senderId === message.senderId && 
          msg.receiverId === message.receiverId &&
          msg.text === message.text
        );
        
        if (existingTempIndex !== -1) {
          const newMessages = [...state.messages];
          newMessages[existingTempIndex] = message;
          return { messages: newMessages };
        } else {
          return { messages: [...state.messages, message] };
        }
      });
    });
    
    socket.on("delete_message", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    });
    
    socket.on("messages_seen", ({ senderId, receiverId, messageIds }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          messageIds && messageIds.some(id => isEqual(id, msg._id))
            ? { ...msg, seen: true, seenAt: new Date() }
            : msg
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    socket.off("receive_message");
    socket.off("delete_message");
    socket.off("messages_seen");
  },

  isUserOnline: (userId) => {
    const onlineUsers = useAuthStore.getState().onlineUsers || [];
    return onlineUsers.includes(String(userId));
  },
}));
