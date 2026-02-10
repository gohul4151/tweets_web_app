import { useState, useEffect } from 'react';
import Addpost from "./post";
import { ArrowLeft } from 'lucide-react';

function Username({ username, sethome }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUserPosts() {
            setLoading(true);
            try {
                // Using the same port 3000 as in home.jsx
                const response = await fetch(`http://localhost:3000/getuserpost/${username}`, {
                    method: "GET",
                    credentials: "include"
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("User posts data:", data);
                    // Handle different response structures based on backend
                    const postsData = data.posts || data;
                    if (Array.isArray(postsData)) {
                        setPosts(postsData);
                    } else {
                        console.error("Received data is not an array:", data);
                        setPosts([]);
                    }
                } else {
                    console.error("Failed to fetch user posts");
                }
            } catch (error) {
                console.error("Error fetching user posts:", error);
            } finally {
                setLoading(false);
            }
        }

        if (username) {
            fetchUserPosts();
        }
    }, [username]);

    return (
        <div>
            <div style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                borderBottom: "1px solid #777"
            }}>
                <button
                    onClick={sethome}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    <ArrowLeft size={24} />
                    <span style={{ marginLeft: "5px" }}>Back</span>
                </button>
                <h2 style={{ margin: 0 }}>Posts by {username}</h2>
            </div>

            <div style={{ padding: "20px" }}>
                {loading ? (
                    <div style={{ textAlign: "center" }}>Loading posts...</div>
                ) : posts.length > 0 ? (
                    posts.map((post, index) => (
                        <Addpost key={post._id || index} p1={post} />
                    ))
                ) : (
                    <div style={{ textAlign: "center" }}>No posts found for {username}</div>
                )}
            </div>
        </div>
    );
}
export default Username;
