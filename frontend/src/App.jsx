import { useState, useEffect } from 'react'
import Login from "./components/login";
import Signup from "./components/signup";
import Home from "./components/home";

function App() {
  const [login, setlogin] = useState(true);
  const [log, setlog] = useState(false);
  if (log) {
    return <>
      <Home setlog={setlog}/>
    </>
  }
  return <>
    <button type="button" onClick={() => setlogin(true)}>login</button>
    <button type="button" onClick={() => setlogin(false)}>signup</button>
    {login ? <Login setlog={setlog}/> : <Signup setlogin={setlogin}/>}
  </>
}

export default App