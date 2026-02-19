import { useState, useEffect } from 'react'
import Login from "./components/login";
import Signup from "./components/signup";
import Home from "./components/home";
import GetPostShare from "./components/get_post_share";
import { Sun, Moon, LogIn, UserPlus } from 'lucide-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import darkLogo from './logo/dark.jpg';
import lightLogo from './logo/light.jpeg';

function MainApp() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isLoginView, setIsLoginView] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);

    // Update favicon based on theme
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.href = theme === 'dark' ? '/favicon.jpg' : '/favicon-light.jpeg';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    async function checkLogin() {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/mytotalpost`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          credentials: "include"
        });
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        // Not logged in
      } finally {
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  // Authenticated View
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
        <Home setlog={setIsAuthenticated} settheme={setTheme} theme={theme} />
      </div>
    );
  }

  // Unauthenticated View
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-200 p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </div>

      {/* Logo + Branding */}
      <div className="flex flex-col items-center mb-8">
        <img src={lightLogo} alt="FeedStack" className="w-32 h-32 rounded-3xl object-cover shadow-2xl mb-4 dark:hidden" />
        <img src={darkLogo} alt="FeedStack" className="w-32 h-32 rounded-3xl object-cover shadow-2xl mb-4 hidden dark:block" />
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-slate-900 via-slate-600 to-slate-400 dark:from-white dark:via-zinc-400 dark:to-zinc-600 bg-clip-text text-transparent">FeedStack</h1>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setIsLoginView(true)}
            className={`flex-1 py-4 text-center font-medium transition-colors ${isLoginView ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <LogIn size={20} />
              Login
            </div>
          </button>
          <button
            onClick={() => setIsLoginView(false)}
            className={`flex-1 py-4 text-center font-medium transition-colors ${!isLoginView ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserPlus size={20} />
              Sign Up
            </div>
          </button>
        </div>

        <div className="p-6">
          {isLoginView ? (
            <>
              <Login setlog={setIsAuthenticated} />
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Don't have an account?{' '}
                <button onClick={() => setIsLoginView(false)} className="text-black dark:text-white font-bold hover:underline">Sign Up</button>
              </p>
            </>
          ) : (
            <>
              <Signup setlogin={setIsLoginView} />
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Already have an account?{' '}
                <button onClick={() => setIsLoginView(true)} className="text-black dark:text-white font-bold hover:underline">Login</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/post/:id" element={<GetPostShare />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;