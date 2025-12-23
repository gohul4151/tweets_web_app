import { useState } from "react";

function Addpostupdate({des, ti, tag, file, setclose,addpost}) {
    const [lod, setlod] = useState(false);
    const [message, setMessage] = useState("");
    
    async function putpost() {
        if (!file) {
            setMessage("Please select a file first");
            return;
        }
        
        setlod(true);
        setMessage("");
        
        try {
            // Get values from refs
            const title = ti?.current?.value || "";
            const description = des?.current?.value || "";
            const tagValue = tag?.current?.value || "";
            
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", title);
            formData.append("description", description);
            formData.append("tag", tagValue);
            
            const response = await fetch("http://localhost:3000/putpost", {
                method: "POST",
                body: formData,  // Send FormData directly
                credentials: "include"
            });
            
            const result = await response.json();
            
            if (result.message === "File uploaded successfully") {
                setMessage("Post uploaded successfully!");
                
                // Clear form fields
                if (ti?.current) ti.current.value = "";
                if (des?.current) des.current.value = "";
                if (tag?.current) tag.current.value = "";
                
                if (addpost) {
                    addpost();
                }
                // Close modal after delay
                setTimeout(() => {
                    setclose(false);
                    setlod(false);
                }, 1500);

            } else {
                setMessage(result.message || "Upload failed");
                setlod(false);
            }
        } catch (error) {
            setMessage("Network error: " + error.message);
            setlod(false);
        }
    }
    
    return (
        <>
            <button onClick={putpost} disabled={lod}>
                {lod ? "Posting..." : "Post"}
            </button>
            
            {lod && (
                <div className="loading-modal">
                    <div className="loading-content">
                        <div className="spinner"></div>
                        <p>Uploading your post...</p>
                    </div>
                </div>
            )}
            
            {message && !lod && (
                <div style={{
                    marginTop: '10px',
                    color: message.includes('success') ? 'green' : 'red'
                }}>
                    {message}
                </div>
            )}
        </>
    );
}

export default Addpostupdate;