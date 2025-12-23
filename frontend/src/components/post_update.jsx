import { useState } from "react";
function Addpostupdate({des,ti,tag,file})
{
    const data=new FormData();
    data.append("file",file);
    data.append("title",ti);
    data.append("description",des);
    data.append("tag",tag);  
    async function put_post()
    {
        const [lod,setlod] = useState(true);
        if (lod==true)
        {
            return <>
                <p>loading.....</p>
            </>
        }
        const response=await fetch("http://localhost:3000/putpost",{
            method:"POST",
            body:JSON.stringify({data}),
            credentials: "include"
        })
        if (response.message=="Success")
        {
            setlod(false);
        }
        else{
            return <>
                <p>{response.message}</p>
            </>
        }
    }
    return <>
        <button onClick={put_post}>Post</button>
    </>
}
export default Addpostupdate