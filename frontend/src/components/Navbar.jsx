import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { LogOut, MessageSquare, Settings, User, Sun, Moon } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header
      className="backdrop-blur-lg bg-base-100/80 border-b border-base-300"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">BaatCheet</h1>
            </Link>
          </div>

          <div className="flex flex-row items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex gap-2 items-center px-3 py-1 rounded hover:bg-base-200 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {theme === 'light' ? 'Dark' : 'Light'}
              </span>
            </button>

            <Link
              to={"/settings"}
              className="flex gap-2 items-center px-3 py-1 rounded hover:bg-base-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className="flex gap-2 items-center px-3 py-1 rounded hover:bg-base-200 transition-colors">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center px-3 py-1 rounded hover:bg-base-200 transition-colors" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
