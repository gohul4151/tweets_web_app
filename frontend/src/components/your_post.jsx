import { useRef, useEffect, useState, useCallback } from "react";
import Addpost from "./post";

function YourPost({ you_post, setyou }) {
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
                const res = await fetch("http://localhost:3000/mytotalpost", {
                    method: "GET",
                    credentials: "include",
                });
                const a = await res.json();
                setTotalPosts(a.totalPosts);
                name.current = a.name;
                profile.current = a.profile_url;
            }

            // Fetch posts for current page
            const result = await fetch(`http://localhost:3000/getmypost?page=${pageNum}&limit=10`, {
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
        setyou(false);
    };

    return (
        <div>
            <div>
                <div>
                    Profile: <img src={profile.current} alt="profile" className="profile-pic"/>
                </div>
                <div>Username: {name.current}</div>
                <div>Total posts: {totalPosts}</div>
                <button onClick={handleBackClick}>Back</button>
            </div>
            
            <div>
                <div>
                    {initialLoad ? (
                        <p>Loading posts...</p>
                    ) : pos.length > 0 ? (
                        pos.map((post, index) => {
                            if (index === pos.length - 1) {
                                return (
                                    <div ref={lastPostRef} key={post._id}>
                                        <Addpost 
                                            p1={post} 
                                            del={true}
                                            onDelete={handleDeletePost}
                                        />
                                    </div>
                                );
                            }
                            return (
                                <Addpost 
                                    key={post._id} 
                                    p1={post} 
                                    del={true}
                                    onDelete={handleDeletePost}
                                />
                            );
                        })
                    ) : (
                        <p>No posts to display</p>
                    )}
                    
                    {loading && <p>Loading more posts...</p>}
                    {!hasMore && pos.length > 0 && <p>No more posts to load</p>}
                </div>
            </div>
        </div>
    );
}

export default YourPost;