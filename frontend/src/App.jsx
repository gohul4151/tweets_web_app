import { useState, useEffect } from 'react'
import Login from "./components/login";
import Signup from "./components/signup";
import Home from "./components/home";
import { Sun } from 'lucide-react';
import { Moon } from 'lucide-react';

function App() {
  const [theme,settheme]=useState('light');
  function Theme()
  {
      if (theme=='light')
      {
      settheme('dark');
    }
    else {
      settheme('light');
    }
  }
  const [login, setlogin] = useState(true);
  const [log, setlog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      try {
        const response = await fetch("http://localhost:3000/mytotalpost", {
          method: "GET",
          credentials: "include"
        });
        if (response.ok) {
          setlog(true);
        }
      } catch (e) {
        console.log("Not logged in");
      } finally {
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>Loading...</div>;
  }

  if (log) {
    return <>
      <Home setlog={setlog} settheme={settheme} theme={theme} />
    </>
  }
  return <>
    <div>
      <button onClick={Theme}>
        {theme == 'light' ? <Sun /> : <Moon />}
      </button>
    </div>
    <button type="button" onClick={() => setlogin(true)}>login</button>
    <button type="button" onClick={() => setlogin(false)}>signup</button>
    {login ? <Login setlog={setlog} /> : <Signup setlogin={setlogin} />}
  </>
}

export default App