import { useRef, useEffect, useState, useCallback } from "react";
import Addpost from "./post";
import { ArrowLeft, User } from "lucide-react";

function YourPost({ you_post, setyou, setrefpost }) {
    const [pos, setpos] = useState([]);
    const [totalPosts, setTotalPosts] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const name = useRef(null);
    const profile = useRef(null);
    const observer = useRef();

    const lastPostRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const getPosts = useCallback(async (pageNum) => {
        setLoading(true);
        try {
            // First fetch total posts and user info on initial load
            if (pageNum === 1) {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/mytotalpost`, {
                    method: "GET",
                    credentials: "include",
                });
                const a = await res.json();
                setTotalPosts(a.totalPosts);
                name.current = a.name;
                profile.current = a.profile_url;
            }

            // Fetch posts for current page
            const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/getmypost?page=${pageNum}&limit=10`, {
                method: "GET",
                credentials: "include",
            });

            if (!result.ok) throw new Error("Failed to fetch posts");

            const data = await result.json();

            // Handle different response structures
            let postsArray = [];
            if (Array.isArray(data)) {
                postsArray = data;
            } else if (data.posts && Array.isArray(data.posts)) {
                postsArray = data.posts;
            } else if (Array.isArray(data.data)) {
                postsArray = data.data;
            }

            // Check if we have more posts
            if (postsArray.length === 0 || postsArray.length < 10) {
                setHasMore(false);
            }

            // Append new posts or set initial posts
            setpos(prev => pageNum === 1 ? postsArray : [...prev, ...postsArray]);

        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    }, []);

    useEffect(() => {
        if (initialLoad) {
            getPosts(1);
        }
    }, [initialLoad, getPosts]);

    useEffect(() => {
        if (page > 1 && !initialLoad) {
            getPosts(page);
        }
    }, [page, initialLoad, getPosts]);

    const handleDeletePost = (deletedPostId) => {
        setpos(prev => prev.filter(post => post._id !== deletedPostId));
        setTotalPosts(prev => prev - 1);
    };

    const handleBackClick = () => {
        setrefpost(c => c + 1);
        setyou(false);
    };

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 flex items-center gap-4">
                <button
                    onClick={handleBackClick}
                    className="p-2.5 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500 hover:text-indigo-600"
                    aria-label="Go back"
                >
                    <ArrowLeft size={22} />
                </button>

                <div className="flex items-center gap-3">
                    {profile.current ? (
                        <img
                            src={profile.current}
                            alt="profile"
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-800"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                            <User size={20} className="text-gray-500" />
                        </div>
                    )}
                    <div>
                        <h2 className="font-bold text-lg leading-tight">
                            {name.current || "Your Profile"}
                        </h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {totalPosts} posts
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                {initialLoad ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 dark:border-zinc-800 dark:border-t-zinc-400 rounded-full animate-spin mb-6"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Designing your universe...</p>
                    </div>
                ) : pos.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {pos.map((post, index) => (
                            <div
                                key={post._id}
                                ref={index === pos.length - 1 ? lastPostRef : null}
                            >
                                <Addpost
                                    p1={post}
                                    del={true}
                                    onDelete={handleDeletePost}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="inline-block p-6 bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl mb-6 text-indigo-600 dark:text-indigo-400">
                            <User size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-black mb-3 tracking-tight">Pure Silence</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                            Your timeline is a blank canvas. Start sharing your thoughts with the world!
                        </p>
                    </div>
                )}

                {loading && !initialLoad && (
                    <div className="py-6 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-black dark:border-gray-800 dark:border-t-white rounded-full animate-spin"></div>
                    </div>
                )}

                {!hasMore && pos.length > 0 && (
                    <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-600">
                        No more posts to load
                    </div>
                )}
            </div>
        </div>
    );
}

export default YourPost;