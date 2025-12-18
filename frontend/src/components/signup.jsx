import { useRef } from "react";
import { useState } from "react";
function Signup({setlogin})
{
    const inputuser=useRef(null);
    const inputemail=useRef(null);
    const [d1, setd1]=useState("");
    const [d2, setd2]=useState("");
    const [d3, setd3]=useState("");
    const inputpass=useRef(null);
    const [show,setshow]=useState(false);
    async function send() {
        const name = inputuser.current.value;
        const email = inputemail.current.value;
        const password = inputpass.current.value;
        let s1="name is required",s2="email is required",s3="password is required";
        if (name=="") {
            setd1(s1);
        }
        if (email=="")
        {
            setd2(s2);
        }
        if (password=="")
        {
            setd3(s3);
        }
        else
        {
            const response = await fetch("http://localhost:3000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            
            const data = await response.json();
            if (data.message=="User signed up")
            {
                setlogin(true);
            }
            else
            {
                setd1(data.message);
            }
        }
    }
    return <>
    <br />
    username
    <input 
        ref={inputuser}
        type="text"
        placeholder="your username" 
    />
    <div>{d1}</div>
    email
    <input
        ref={inputemail}
        type="text"
        placeholder="your email"
    />
    <div >{d2}</div>
    password
    <input 
        ref={inputpass}
        type={show ? "text":"password"}
        placeholder="your password"
    />
    <div>{d3}</div>
    <button type="button" onClick={() => setshow(!show)}>{show ? "Hide" : "Show"}</button>
    <button type="button" onClick={send}>Submit</button>
    </>
}
export default Signup
