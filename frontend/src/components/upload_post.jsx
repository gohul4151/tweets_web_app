import {useState} from 'react';
import '../modal.css';

function FileUpload({des, ti, tag}) {
    const [file, setfile] = useState(null);
    const [up, setup] = useState(false);
    
    return (
        <div className='upload-button'>
            <input 
                type="file" 
                onChange={(e) => {
                    setfile(e.target.files[0]);
                    setup(true);
                }}
            />
            <Upload 
                file={file} 
                up={up} 
                des={des} 
                ti={ti} 
                tag={tag} 
                setup={setup}
            />
        </div>
    );
}

function Upload({file, up, ti, des, tag, setup}) {
    const [r, setr] = useState(null);
    const [c, setc] = useState(false);
    
    async function filepost() {
        // Check if all refs exist
        if (!ti.current || !des.current || !tag.current) {
            setr("Please fill all fields");
            return;
        }
        
        // Get values from refs
        const title = ti.current.value;
        const description = des.current.value;
        const tagValue = tag.current.value;
        
        if (!file) {
            setr("Please select a file");
            return;
        }
        
        // Create FormData inside the function
        const data = new FormData();
        data.append("file", file);
        data.append("title", title);
        data.append("description", description);
        data.append("tag", tagValue);
        
        try {
            const res = await fetch("http://localhost:3000/upload", {
                method: "POST",
                credentials: "include",
                body: data
            });
            
            const result = await res.json();
            
            if (result.message === "File uploaded successfully") {
                setr("Uploaded successfully!");
                // Clear form
                ti.current.value = "";
                des.current.value = "";
                tag.current.value = "";
                setup(false); // Reset upload state
            } else {
                setr(result.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setr("Upload failed: " + error.message);
        } finally {
            setc(false); // Re-enable button
        }
    } 
    
    return (
        <>
            <div>{r}</div>
            <button 
                onClick={() => {
                    setc(true); // Disable button
                    filepost();
                }} 
                disabled={c || !up} // Disable if uploading OR no file selected
            >
                {c ? "Uploading..." : "Upload"}
            </button>
        </>
    );
}

export default FileUpload;