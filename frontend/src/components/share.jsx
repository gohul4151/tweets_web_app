import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';

function Share({ post, isOpen, onClose }) {
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    if (!post) return null;

    const shareUrl = `${window.location.origin}/post/${post._id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            <div
                className={`bg-white dark:bg-black w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-transform duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Share Post</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4">
                    {post.userId && (
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src={post.userId.profile_url || "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg"}
                                alt="profile"
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-800"
                            />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{post.userId.name}</span>
                        </div>
                    )}

                    {post.title && (
                        <div className="mb-4">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{post.title}</p>
                        </div>
                    )}

                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">Subject link</p>

                    <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-1">
                        <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-gray-700 dark:text-gray-300 truncate"
                        />
                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${copied
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300 shadow-sm hover:shadow'
                                }`}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Share;

