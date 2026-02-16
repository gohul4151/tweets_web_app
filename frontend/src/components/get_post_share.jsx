import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Addpost from './post';
import { ArrowLeft, Loader2 } from 'lucide-react';

function GetPostShare() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [canInteract, setCanInteract] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sharepost/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                const postData = data.post || data;
                setPost(postData);
                setCanInteract(!!postData.canInteract);

            } catch (err) {
                console.error("Failed to fetch post:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black text-black dark:text-white">
                <Loader2 size={40} className="animate-spin text-gray-400 mb-4" />
                <div className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading post...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black text-black dark:text-white p-4 text-center">
                <div className="text-xl font-bold text-red-500 mb-2">Failed to load post</div>
                <div className="text-gray-600 dark:text-gray-400 mb-6">{error}</div>
                <a
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 transition-all"
                >
                    <ArrowLeft size={20} />
                    Go Home
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <a
                        href="/"
                        className="inline-flex items-center text-gray-600 dark:text-gray-400 font-medium hover:text-black dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Feed
                    </a>
                </div>

                {/* Show login/signup banner when user is not logged in */}
                {!canInteract && (
                    <div className="border border-gray-200 dark:border-gray-800 p-5 rounded-xl flex items-center justify-between flex-wrap gap-4 mb-8 bg-gray-50 dark:bg-gray-900">
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                            Sign up or log in to like, dislike, and comment.
                        </div>
                        <a
                            href="/"
                            className="px-5 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            Log In / Sign Up
                        </a>
                    </div>
                )}

                {post ? (
                    <Addpost p1={post} canInteract={canInteract} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                        <p className="text-lg">Post not found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GetPostShare;


