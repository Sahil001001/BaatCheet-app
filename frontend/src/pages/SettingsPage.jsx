import React from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();

  const themes = [
    { name: 'light', label: 'Light', icon: Sun },
    { name: 'dark', label: 'Dark', icon: Moon },
  ];

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Settings</h1>
          
          <div className="bg-base-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Theme Settings</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-base-content/70">
                Choose your preferred theme for the application
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map((themeOption) => {
                  const IconComponent = themeOption.icon;
                  const isActive = theme === themeOption.name;
                  
                  return (
                    <button
                      key={themeOption.name}
                      onClick={() => setTheme(themeOption.name)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-base-300 bg-base-100 hover:border-primary/50'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{themeOption.label}</span>
                      {isActive && (
                        <div className="ml-auto w-3 h-3 bg-primary rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-base-300">
                <Sun className={`w-5 h-5 ${!isDark ? 'text-warning' : 'text-base-content/50'}`} />
                
                <button
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  className={`relative w-16 h-8 flex items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    isDark ? 'bg-primary' : 'bg-base-300'
                  }`}
                >
                  <span
                    className={`w-6 h-6 bg-base-100 rounded-full shadow-md transform transition-transform duration-300 ${
                      isDark ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
                
                <Moon className={`w-5 h-5 ${isDark ? 'text-primary' : 'text-base-content/50'}`} />
              </div>
              

            </div>
          </div>


          
          <div className="bg-base-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">More Settings</h2>
            <p className="text-base-content/70">
              Additional settings will be available here in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
