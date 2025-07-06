import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { socket, connectSocket, disconnectSocket } from "../lib/socket.js";


export const useAuthStore = create((set, get) => {
  socket.on("connect", () => {
    const authUser = get()?.authUser;
    if (authUser?._id) {
      socket.emit("join", authUser._id);
    }
  });

  return {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,
    isUpdatingProfile: false,
    onlineUsers: [],
    connectionCheckInterval: null,

    setOnlineUsers: (users) => {
      set({ onlineUsers: users });
    },

    subscribeToOnlineUsers: () => {
      socket.off("online_users");
      
      socket.on("online_users", (users) => {
        set({ onlineUsers: users || [] });
      });
      
      const connectionCheckInterval = setInterval(() => {
        const authUser = get()?.authUser;
        if (authUser?._id && socket.disconnected) {
          connectSocket();
        }
      }, 5000);
      
      set({ connectionCheckInterval });
    },

    unsubscribeFromOnlineUsers: () => {
      socket.off("online_users");
      
      const { connectionCheckInterval } = get();
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
        set({ connectionCheckInterval: null });
      }
    },

    checkAuth: async () => {
      try {
        const res = await axiosInstance.get("/auth/check");
        if (res.data) {
          if (socket.disconnected) {
            connectSocket();
          }
          set({ authUser: res.data, isCheckingAuth: false });
          
          if (socket.connected) {
            socket.emit("join", res.data._id);
          }
        } else {
          set({ authUser: null, isCheckingAuth: false });
        }
        return res.data;
      } catch (err) {
        set({ authUser: null, isCheckingAuth: false });
      }
    },

    login: async (data) => {
      set({ isLoggingIn: true });
      try {
        const res = await axiosInstance.post("/auth/login", data);
        set({ authUser: res.data });
        
        if (socket.disconnected) {
          connectSocket();
        }
        
        if (socket.connected) {
          socket.emit("join", res.data._id);
        }
        
        toast.success("Logged in successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Login failed");
      } finally {
        set({ isLoggingIn: false });
      }
    },

    signup: async (data) => {
      set({ isSigningUp: true });
      try {
        const res = await axiosInstance.post("/auth/signup", data);
        set({ authUser: res.data });
        toast.success("Account created successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Signup failed");
      } finally {
        set({ isSigningUp: false });
      }
    },

    logout: async () => {
      try {
        await axiosInstance.post("/auth/logout");
        socket.emit("logout");
        disconnectSocket();
        
        const { connectionCheckInterval } = get();
        if (connectionCheckInterval) {
          clearInterval(connectionCheckInterval);
        }
        
        set({ authUser: null, onlineUsers: [], connectionCheckInterval: null });
        toast.success("Logged out successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Logout failed");
      }
    },

    updateProfile: async (data) => {
      set({ isUpdatingProfile: true });
      try {
        const res = await axiosInstance.put("/auth/update-profile", data);
        set({ authUser: res.data });
        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Profile update failed");
      } finally {
        set({ isUpdatingProfile: false });
      }
    },
  };
});
