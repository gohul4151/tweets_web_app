import { useState } from 'react';
import Addpostupdate from './post_update';
import { Upload as UploadIcon, Check, AlertCircle, FileText } from 'lucide-react';

function FileUpload({ des, ti, tag, setclose, addpost }) {
    const [file, setfile] = useState(null);
    const [up, setup] = useState(false);
    const [r, setr] = useState("");
    const maxSize = 50 * 1024 * 1024; // 50MB

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.size > maxSize) {
            setr("File size exceeds 50MB limit. Please upload a smaller file.");
            setfile(null);
            setup(false);
            return;
        }

        setfile(selectedFile);
        setup(true);
        setr("");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Attachment (Optional)
                </label>

                <div className="relative">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-black file:text-white
                            dark:file:bg-white dark:file:text-black
                            hover:file:bg-gray-800 dark:hover:file:bg-gray-200
                            cursor-pointer"
                    />
                </div>
            </div>

            {r && (
                <div className={`text-sm flex items-center gap-2 ${r.includes('exceeds') ? 'text-red-500' : 'text-green-500'}`}>
                    {r.includes('exceeds') ? <AlertCircle size={16} /> : <Check size={16} />}
                    {r}
                </div>
            )}

            {up && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                    <FileText size={20} className="text-gray-500" />
                    <span className="text-sm truncate max-w-[200px]">{file?.name}</span>
                    <div className="flex-1"></div>
                    <Upload
                        up={up}
                        setup={setup}
                        setr={setr}
                    />
                </div>
            )}

            <div className="pt-2">
                <Addpostupdate des={des} ti={ti} tag={tag} file={file} setclose={setclose} addpost={addpost} />
            </div>
        </div>
    );
}

function Upload({ up, setr, setup }) {
    return (
        <button
            onClick={() => {
                setr("File selected successfully");
                setup(false);
            }}
            disabled={!up}
            className="flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        >
            <UploadIcon size={14} />
            Confirm
        </button>
    );
}

export default FileUpload;