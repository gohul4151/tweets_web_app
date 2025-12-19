import {useState} from 'react';
import '../modal.css';
function FileUpload({des,ti}){
    const [file, setfile]=useState();
    const [up,setup]=useState(false);
    return <>
    <div className='upload-button'>
        <input type="file" onChange={(e) => {setfile(e.target.files[0]);
            setup(true);
        }}/>
        <Upload file={file} up={up} des={des} ti={ti}/>
    </div>
    </>
}
function Upload({file,up,ti,des}){
    const [r,setr]=useState(null);
    const [c,setc]=useState(false);
    const data=new FormData();
    data.append('file',file);
    async function filepost() {
        if (up==true)
        {
            const res=await fetch("http://localhost:3000/upload",{
            method:"POST",
            credentials: "include",
            body:data,
            title:ti.current.value,
            description:des.current.value
            })
            const result=await res.json()
            alert(result.message);
            if (result.message=="File uploaded successfully"){
                setr("uploaded sucessfully");
            }
            else
            {
                setr(result.message);
                setc(false);
            }
        } 
    } 
    return <>
        <div>{r}</div>
        <button onClick={() => {
            filepost();
            setc(true);
        }} disabled={c}>upload</button>
    </>
}
export default FileUpload