import { useRef } from "react";
import { useState } from "react";
export default function Login()
{
    const inputemail=useRef(null);
    const inputpass=useRef(null);
    const [show,setshow]=useState(false);
    async function send() {
        const email = inputemail.current.value;
        const password = inputpass.current.value;
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        alert(data.message);
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
    }
    return <>
    <br />
    email
    <input 
        ref={inputemail}
        type="text"
        placeholder="your email" 
    />
    <br />
    password
    <input 
        ref={inputpass}
        type={show ? "text":"password"}
        placeholder="your password"
    />
    <br />
    <button onClick={() => setshow(!show)}>{show ? "Hide" : "Show"}</button>
    <button onClick={send}>sumbit</button>
    </>
}
