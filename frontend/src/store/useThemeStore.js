import { create } from "zustand";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("chat-theme");
  if (savedTheme === "coffee") return "light";
  if (savedTheme === "dark") return "dark";
  return "light";
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
