import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { Plus, Minus, Download, X as CloseIcon, Trash2, Check, CheckCheck } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    deleteMessageForMe,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null });
  let longPressTimer = null;

  useEffect(() => {
    if (authUser && selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => {
      unsubscribeFromMessages();
    };
  }, [authUser, selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    setZoomLevel(1);
  }, [zoomedImage]);

  const handleContextMenu = (e, messageId) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, messageId });
  };

  const handleTouchStart = (e, messageId) => {
    longPressTimer = setTimeout(() => {
      setContextMenu({ visible: true, x: e.touches[0].clientX, y: e.touches[0].clientY, messageId });
    }, 600);
  };
  const handleTouchEnd = () => {
    clearTimeout(longPressTimer);
  };

  useEffect(() => {
    if (contextMenu.visible) {
      const hideMenu = () => setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
      window.addEventListener("click", hideMenu);
      return () => window.removeEventListener("click", hideMenu);
    }
  }, [contextMenu.visible]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
            onContextMenu={(e) =>
              (message.senderId === authUser._id || message.receiverId === authUser._id)
                ? handleContextMenu(e, message._id)
                : undefined
            }
            onTouchStart={(e) =>
              (message.senderId === authUser._id || message.receiverId === authUser._id)
                ? handleTouchStart(e, message._id)
                : undefined
            }
            onTouchEnd={handleTouchEnd}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col relative">
              {message.image && (
                <div className="relative group">
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2 cursor-zoom-in"
                    onClick={() => setZoomedImage(message.image)}
                  />
                  <a
                    href={message.image}
                    download={`chat-image-${message._id}.png`}
                    className="absolute top-2 right-2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Download image"
                    onClick={e => e.stopPropagation()}
                  >
                    <Download size={20} />
                  </a>
                </div>
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      {zoomedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setZoomedImage(null)}>
          <div className="relative flex items-center justify-center w-full h-full" onClick={e => e.stopPropagation()}>
            <div className="absolute top-6 right-6 flex gap-3 bg-white/90 rounded-full shadow-lg p-2 z-20">
              <button
                className="btn btn-circle btn-sm flex items-center justify-center"
                title="Zoom In"
                onClick={() => setZoomLevel(z => Math.min(z + 0.2, 3))}
                type="button"
              >
                <Plus size={20} />
              </button>
              <button
                className="btn btn-circle btn-sm flex items-center justify-center"
                title="Zoom Out"
                onClick={() => setZoomLevel(z => Math.max(z - 0.2, 0.4))}
                type="button"
              >
                <Minus size={20} />
              </button>
              <a
                href={zoomedImage}
                download={`chat-image.png`}
                className="btn btn-circle btn-sm flex items-center justify-center"
                title="Download"
                onClick={e => e.stopPropagation()}
              >
                <Download size={20} />
              </a>
              <button
                className="btn btn-circle btn-sm flex items-center justify-center"
                title="Close"
                onClick={() => setZoomedImage(null)}
                type="button"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg z-10"
              style={{ objectFit: "contain", transform: `scale(${zoomLevel})`, transition: 'transform 0.2s' }}
            />
          </div>
        </div>
      )}

      {contextMenu.visible && (() => {
        const msg = messages.find(m => m._id === contextMenu.messageId);
        if (!msg) return null;
        const isSender = msg.senderId === authUser._id;
        
        // Calculate position to keep menu within screen bounds
        const menuWidth = 180;
        const menuHeight = isSender ? 80 : 40;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        let x = contextMenu.x;
        let y = contextMenu.y;
        
        // Adjust horizontal position
        if (x + menuWidth > screenWidth) {
          x = screenWidth - menuWidth - 10;
        }
        if (x < 10) {
          x = 10;
        }
        
        // Adjust vertical position
        if (y + menuHeight > screenHeight) {
          y = screenHeight - menuHeight - 10;
        }
        if (y < 10) {
          y = 10;
        }
        
        return (
          <div
            className="fixed z-50"
            style={{ left: x, top: y }}
          >
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 px-3 py-2 min-w-[180px] flex flex-col gap-1">
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
                onClick={() => {
                  deleteMessageForMe(contextMenu.messageId);
                  setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
                }}
              >
                <Trash2 size={18} className="text-red-500" />
                <span className="text-red-600 font-medium text-sm">Delete for me</span>
              </div>
              {isSender && (
                <div
                  className="flex items-center gap-3 cursor-pointer hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
                  onClick={() => {
                    deleteMessage(contextMenu.messageId);
                    setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
                  }}
                >
                  <Trash2 size={18} className="text-red-500" />
                  <span className="text-red-600 font-medium text-sm">Delete for everyone</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
