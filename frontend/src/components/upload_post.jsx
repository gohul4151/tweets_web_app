import {useState} from 'react';
import '../modal.css';

function FileUpload({des, ti, tag}) {
    const [file, setfile] = useState(null);
    const [up, setup] = useState(false);
    
    return <>
        <div className='upload-button'>
            <input type="file" onChange={(e) => {
                setfile(e.target.files[0]);
                setup(true);
            }}/>
            {up && <Upload file={file} ti={ti} des={des} tag={tag} setup={setup} />}
        </div>
    </>
}

function Upload({file, ti, des, tag, setup}) {
    const [r, setr] = useState(false);
    const [c, setc] = useState(false);
    
    async function filepost() {
        setc(true);
        if (!file) {
            setr("Please select a file first");
            setc(false);
            return;
        }
        const titleValue = ti.current.value;
        const descValue = des.current.value;
        const tagValue = tag?.current?.value || "";
        
        if (!titleValue.trim()) {
            setr("Please enter a title");
            setc(false);
            return ;
        }
        
        if (!descValue.trim()) {
            setr("Please enter a description");
            setc(false);
            return;
        }
        
        const data = new FormData();
        data.append("file", file);
        data.append("title", titleValue);
        data.append("description", descValue);
        data.append("tag", tagValue);
        
        try {
            const res = await fetch("http://localhost:3000/upload", {
                method: "POST",
                credentials: "include",
                body: data
            });
            const result = await res.json();
            if (result.message == "File uploaded successfully") {
                setr("Uploaded successfully!");
                setup(false);
            } else {
                setr(result.message);
            }
        } catch (error) {
            setr(error.message);
        } finally {
            setc(false);
        }
    } 
    return <>
        <div>{r}</div>
        <button onClick={filepost} disabled={c}>
            {c ? "Uploading..." : "Upload"}
        </button>
    </>
}

export default FileUpload