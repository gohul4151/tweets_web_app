import { useState, useRef } from 'react';
import Addpostupdate from './post_update';
import { Upload as UploadIcon, Check, AlertCircle, FileText, X, Eye } from 'lucide-react';

function FileUpload({ des, ti, tag, setclose, addpost }) {
    const [file, setfile] = useState(null);
    const [tempFile, setTempFile] = useState(null);
    const [up, setup] = useState(false);
    const [r, setr] = useState("");
    const [mediaPreview, setMediaPreview] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const fileInputRef = useRef(null);
    const maxSize = 50 * 1024 * 1024; // 50MB

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.size > maxSize) {
            setr("File size exceeds 50MB limit. Please upload a smaller file.");
            setTempFile(null);
            setup(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setTempFile(selectedFile);
        setup(true);
        setr("");

        // Create preview URL
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        setMediaPreview(URL.createObjectURL(selectedFile));
    };

    const clearFiles = () => {
        setfile(null);
        setTempFile(null);
        setup(false);
        setr("");
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        setMediaPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Attachment 
                </label>

                <div className="relative">
                    <input
                        type="file"
                        ref={fileInputRef}
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

            {(up || file) && (
                <div className={`flex items-center gap-3 p-3 rounded-xl border animate-in fade-in slide-in-from-top-1 duration-300 ${up
                    ? 'bg-gray-50/80 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'
                    : 'bg-indigo-50/40 dark:bg-indigo-900/10 border-indigo-100/50 dark:border-indigo-900/20'}`}>

                    <div className={`p-2 rounded-lg ${up ? 'bg-white dark:bg-gray-800' : 'bg-white dark:bg-indigo-900/30'} shadow-sm text-blue-500`}>
                        {up ? <FileText size={20} /> : <Check size={20} className="text-emerald-500" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${!up ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-200'}`}>
                            {(up ? tempFile : file)?.name}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {up ? 'Pending Confirmation' : 'Ready to Post'}
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-fit">
                        {mediaPreview && (
                            <button
                                onClick={() => setShowPreviewModal(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full text-xs font-bold transition-all shadow-sm border border-blue-100/50 dark:border-blue-900/30"
                            >
                                <Eye size={14} />
                                View
                            </button>
                        )}
                        {up ? (
                            <Upload
                                tempFile={tempFile}
                                setfile={setfile}
                                setup={setup}
                                setr={setr}
                            />
                        ) : (
                            <button
                                onClick={clearFiles}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full text-xs font-bold transition-all shadow-sm border border-red-100/50 dark:border-red-900/30"
                            >
                                <X size={14} />
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Media Preview Modal */}
            {showPreviewModal && mediaPreview && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setShowPreviewModal(false)}
                >
                    <div
                        className="relative max-w-3xl w-full max-h-[85vh] animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowPreviewModal(false)}
                            className="absolute -top-3 -right-3 z-10 p-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="rounded-2xl overflow-hidden border border-gray-700 shadow-2xl bg-black">
                            {(tempFile || file)?.type?.startsWith('video') ? (
                                <video
                                    src={mediaPreview}
                                    controls
                                    autoPlay
                                    className="w-full max-h-[80vh] object-contain"
                                />
                            ) : (
                                <img
                                    src={mediaPreview}
                                    alt="Preview"
                                    className="w-full max-h-[80vh] object-contain"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-2">
                <Addpostupdate des={des} ti={ti} tag={tag} file={file} setclose={setclose} addpost={addpost} />
            </div>
        </div>
    );
}

function Upload({ tempFile, setfile, setr, setup }) {
    return (
        <button
            onClick={() => {
                setfile(tempFile);
                setr("Success! File attached.");
                setup(false);
            }}
            className="flex items-center gap-1 text-xs font-black bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-1.5 rounded-full hover:opacity-90 transition-all shadow-md shadow-slate-900/10 active:scale-95 border border-slate-900 dark:border-zinc-100"
        >
            <UploadIcon size={12} />
            Confirm
        </button>
    );
}

export default FileUpload;