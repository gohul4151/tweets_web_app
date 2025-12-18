import {useState} from 'react';
import '../modal.css';
function FileUpload(){
    const [file, setfile]=useState();
    return <>
    <div className='upload-button'>
        <input type="file" onChange={(e) => setfile(e.target.files[0])}/>
        <Upload file={file} setfile={setfile}/>
    </div>
    </>
}
function Upload({file,setfile}){
    const [r,setr]=useState(false);
    const data=new FormData();
    data.append('file',file);
    async function filepost() {
        const res=await fetch("http://localhost:3000/upload",{
            method:"POST",
            credentials: "include",
            body:data
        })
        const result=await res.json()
        alert(result.message);
        if (result.ok){
            setr(true);
        }
    } 
    return <>
        <button onClick={filepost}>upload</button>
        {r && <p>uploaded sucessfully</p>}
    </>
}
export default FileUpload