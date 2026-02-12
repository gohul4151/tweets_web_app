import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Addpost from './post';

function GetPostShare() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [canInteract, setCanInteract] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`http://localhost:3000/sharepost/${id}`, {
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading post...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <div style={{ fontSize: '1.2rem', color: '#ef4444', marginBottom: '1rem' }}>Failed to load post</div>
                <div style={{ color: '#666' }}>{error}</div>
                <a href="/" style={{ marginTop: '1rem', color: '#3b82f6', textDecoration: 'none' }}>Go Home</a>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '0 15px' }}>
            <div style={{ marginBottom: '20px' }}>
                <a href="/" style={{ display: 'inline-flex', alignItems: 'center', color: '#666', textDecoration: 'none', fontWeight: 500 }}>
                    ← Back to Feed
                </a>
            </div>

            {/* Show login/signup banner when user is not logged in */}
            {!canInteract && (
                <div style={{
                    border: '1px solid #ccc',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div style={{ fontSize: '0.9rem' }}>
                        Sign up or log in to like, dislike, and comment.
                    </div>
                    <a href="/" style={{
                        padding: '6px 14px',
                        borderRadius: '4px',
                        border: '1px solid #888',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        color: 'inherit'
                    }}>
                        Log In / Sign Up
                    </a>
                </div>
            )}

            {post ? (
                <Addpost p1={post} canInteract={canInteract} />
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Post not found</div>
            )}
        </div>
    );
}

export default GetPostShare;

