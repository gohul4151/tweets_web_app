import { useState } from 'react';
function Command() 
{
    const [comment, setcomment] = useState("");
    async function send_command() 
    {
        const response = await fetch(`http://localhost:3000/post/${p1._id}/comment`, {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ comment: comment }),
        });
        console.log("response : comment sent");
    }
    return <>
        <div>
            <input type="text" onChange={(e) => setcomment(e.target.value)} />
            <button onClick={send_command}>Send</button>
        </div>
    </>;
}
export default Command;
