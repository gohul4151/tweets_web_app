import { useState } from 'react'
import Login from "./components/login";
import Signup from "./components/signup";

function App() {
  const [login, setlogin] = useState(true);

  return <>
  <button onClick={() => setlogin(true)}>login</button>
  <button onClick={() => setlogin(false)}>signup</button>
  {login ? <Login/>:<Signup/>}
  </>
}

export default App
