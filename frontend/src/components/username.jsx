import { useState, useEffect, useRef, useCallback } from 'react';
import Addpost from "./post";
import { ArrowLeft } from 'lucide-react';

function Username({ username, sethome }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

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
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                console.log("User posts data:", data);

                // Robust data handling like in YourPost
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
        // Reset state when username changes
        setPosts([]);
        setPage(1);
        setHasMore(true);
        setInitialLoad(true);
        getPosts(1);
    }, [username]);

    // Fetch next page
    useEffect(() => {
        if (page > 1) {
            getPosts(page);
        }
    }, [page]);

    // Extract user profile from the first post if available
    const userProfile = posts.length > 0 && posts[0].userId ? posts[0].userId : null;

    return (
        <div>
            <div style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                borderBottom: "1px solid #777",
                backgroundColor: "inherit"
            }}>
                <button
                    onClick={sethome}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        color: "inherit"
                    }}
                >
                    <ArrowLeft size={24} />
                    <span style={{ marginLeft: "5px" }}>Back</span>
                </button>

                {userProfile && (
                    <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                        <img
                            src={userProfile.profile_url || "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg"}
                            alt={userProfile.name}
                            style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
                        />
                        <h2 style={{ margin: 0 }}>{userProfile.name}</h2>
                    </div>
                )}
                {!userProfile && <h2 style={{ margin: 0 }}>Posts by {username}</h2>}
            </div>

            <div style={{ padding: "20px" }}>
                {initialLoad ? (
                    <div style={{ textAlign: "center" }}>Loading posts...</div>
                ) : posts.length > 0 ? (
                    posts.map((post, index) => {
                        if (index === posts.length - 1) {
                            return (
                                <div ref={lastPostRef} key={post._id || index}>
                                    <Addpost p1={post} />
                                </div>
                            );
                        }
                        return (
                            <Addpost key={post._id || index} p1={post} />
                        );
                    })
                ) : (
                    <div style={{ textAlign: "center" }}>No posts found for {username}</div>
                )}

                {loading && !initialLoad && <div style={{ textAlign: "center", padding: "10px" }}>Loading more posts...</div>}
                {!hasMore && posts.length > 0 && <div style={{ textAlign: "center", padding: "10px", color: "#666" }}>No more posts to load</div>}
            </div>
        </div>
    );
}

export default Username;
