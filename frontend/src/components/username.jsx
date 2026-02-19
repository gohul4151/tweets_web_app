import { useState, useEffect, useRef, useCallback } from 'react';
import Addpost from "./post";
import { ArrowLeft, User } from 'lucide-react';

function Username({ username, sethome, refpost }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    const [totalPosts, setTotalPosts] = useState(0);
    const [userProfile, setUserProfile] = useState(null);

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
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/getuserpost/${username}?page=${pageNum}&limit=10`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();

                // Robust data handling
                let postsArray = [];
                if (data.posts && Array.isArray(data.posts)) {
                    postsArray = data.posts;
                    if (data.totalPosts !== undefined) {
                        setTotalPosts(data.totalPosts);
                    }
                    if (data.user) {
                        setUserProfile(data.user);
                    }
                } else if (Array.isArray(data)) {
                    postsArray = data;
                } else if (Array.isArray(data.data)) {
                    postsArray = data.data;
                }

                // Check if we have more posts
                if (postsArray.length === 0 || postsArray.length < 10) {
                    setHasMore(false);
                }

                setPosts(prev => pageNum === 1 ? postsArray : [...prev, ...postsArray]);
            } else {
                console.error("Failed to fetch user posts");
            }
        } catch (error) {
            console.error("Error fetching user posts:", error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    }, [username]);

    useEffect(() => {
        // Reset state when username or refpost changes
        setPosts([]);
        setTotalPosts(0);
        setUserProfile(null);
        setPage(1);
        setHasMore(true);
        setInitialLoad(true);
        getPosts(1);
    }, [username, refpost]);

    // Fetch next page
    useEffect(() => {
        if (page > 1) {
            getPosts(page);
        }
    }, [page]);



    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 flex items-center gap-4">
                <button
                    onClick={sethome}
                    className="p-2.5 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500 hover:text-indigo-600"
                    aria-label="Go back"
                >
                    <ArrowLeft size={22} />
                </button>

                <div className="flex items-center gap-3">
                    {userProfile ? (
                        <img
                            src={userProfile.profile_url || "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg"}
                            alt={userProfile.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-800"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                            <User size={20} className="text-gray-500" />
                        </div>
                    )}
                    <div>
                        <h2 className="font-bold text-lg leading-tight">
                            {userProfile ? userProfile.name : username}
                        </h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {totalPosts > 0 ? `${totalPosts} Posts` : initialLoad ? 'Calculating...' : 'No Posts'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                {initialLoad ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 dark:border-zinc-800 dark:border-t-zinc-400 rounded-full animate-spin mb-6"></div>
                        <p className="text-slate-500 font-medium">Discovering @{username}...</p>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {posts.map((post, index) => (
                            <div
                                key={post._id || index}
                                ref={index === posts.length - 1 ? lastPostRef : null}
                            >
                                <Addpost p1={post} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="inline-block p-6 bg-slate-100 dark:bg-slate-800 rounded-3xl mb-6 text-slate-400">
                            <User size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-black mb-3 tracking-tight">Quiet Profile</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                            @{username} hasn't shared any moments yet. Check back later!
                        </p>
                    </div>
                )}

                {loading && !initialLoad && (
                    <div className="py-6 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-black dark:border-gray-800 dark:border-t-white rounded-full animate-spin"></div>
                    </div>
                )}

                {!hasMore && posts.length > 0 && (
                    <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-600">
                        You've reached the end
                    </div>
                )}
            </div>
        </div>
    );
}

export default Username;

