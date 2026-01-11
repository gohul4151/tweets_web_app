import { Children, useRef } from "react";
import { useState } from "react";
function Login({setlog})
{

    const inputemail=useRef(null);
    const inputpass=useRef(null);
    const [d1, setd1]=useState("");
    const [show,setshow]=useState(false);
    async function send() {
        const email = inputemail.current.value;
        const password = inputpass.current.value;
        if (email=="" || password=="")
        {
            setd1("email or password are required");
        }
        else{
            const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (data.message=="Login success")
            {
                setlog(true);
            }
            else
            {
                setd1(data.message);
            }
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
    <div>{d1}</div>
    <button onClick={() => setshow(!show)}>{show ? "Hide" : "Show"}</button>
    <button onClick={send}>sumbit</button>
    </>
}
export default Login