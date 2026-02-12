import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Addpost from './post';

function GetPostShare() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                // Fetching from the endpoint requested by the user: /sharepost/:id
                // Note: Ensure the backend supports this endpoint.
                const response = await fetch(`http://localhost:3000/sharepost/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include' // Important for auth if backend checks it
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();

                // Assuming the backend returns { post: { ... } } or just the post object
                // Adapting based on standard patterns observed in getallpost.js
                const postData = data.post || data;
                setPost(postData);

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
            {post ? (
                <Addpost p1={post} />
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Post not found</div>
            )}
        </div>
    );
}

export default GetPostShare;
