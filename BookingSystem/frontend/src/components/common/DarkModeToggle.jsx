import React, { useEffect, useState } from 'react';

const DarkModeToggle = () => {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="px-4 py-2">
      <div className="text-sm font-medium text-gray-700 mb-1">Mode</div>
      <label className="inline-flex items-center cursor-pointer">
        <span className="mr-2 text-xs text-gray-600">Light</span>
        <input
          type="checkbox"
          className="sr-only"
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
        <div className="w-11 h-6 bg-gray-300 rounded-full relative transition">
          <div
            className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
              theme === 'dark' ? 'translate-x-5' : 'translate-x-1'
            }`}
          ></div>
        </div>
        <span className="ml-2 text-xs text-gray-600">Dark</span>
      </label>
    </div>
  );
};

export default DarkModeToggle;