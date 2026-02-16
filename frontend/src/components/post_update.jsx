import { useState } from "react";
import { Loader2 } from "lucide-react";

function Addpostupdate({ des, ti, tag, file, setclose, addpost }) {
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

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/putpost`, {
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
        <div className="relative">
            <button
                onClick={putpost}
                disabled={lod}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
                {lod ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Posting...
                    </>
                ) : (
                    "Post"
                )}
            </button>

            {lod && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50 rounded-lg flex flex-col items-center justify-center">
                    {/* The button already shows loading state, so we don't strictly need a full screen overlay unless we want to block other interactions. 
                        Since the button is disabled, the user can't click it again. 
                        However, if we want a global loading look over the modal: */}
                </div>
            )}

            {message && !lod && (
                <div className={`mt-3 text-sm font-medium text-center p-2 rounded-lg ${message.toLowerCase().includes('success')
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default Addpostupdate;