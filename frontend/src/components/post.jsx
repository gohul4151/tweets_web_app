import { useState, useEffect, useRef } from 'react';
import '../post.css';
import { ArrowBigUp } from 'lucide-react';
import { ArrowBigDown } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { Send } from 'lucide-react';
import Delete from './delete';
import Reply_delete from './reply_delete';

function Addpost({ p1, del, onDelete }) {
    const profile = useRef(null);
    const name = useRef(null);
    const [user, setuser] = useState(p1.userId.name);
    const [getreply, setgetreply] = useState({});
    const [commentCount, setcommentCount] = useState(p1.commentCount);
    const [comment, setcomment] = useState("");
    const [error, setError] = useState(null);
    const [get_command, setget_command] = useState(null);
    const [command, setcommand] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);
    const [like, setlike] = useState(p1.likesCount);
    const [dislike, setdislike] = useState(p1.dislikesCount);
    const [isliked, setisliked] = useState(p1.isLiked);
    const [isdisliked, setisdisliked] = useState(p1.isDisliked);
    const [read, setread] = useState(false);
    const [tag, settag] = useState(p1.tags);
    const [c_page, setc_page] = useState(1);
    const [Loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showRepliesForComment, setShowRepliesForComment] = useState({});
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);

    //getting the username
    async function username() {
        const res = await fetch("http://localhost:3000/mytotalpost", {
            method: "GET",
            credentials: "include",
        });
        const data = await res.json();
        name.current = data.name;
        profile.current = data.profile_url;
    }
    username();
    console.log(name);
    console.log(profile);

    // Track reply pages and loading states for each comment
    const [replyPages, setReplyPages] = useState({});
    const [replyLoading, setReplyLoading] = useState({});
    const [replyHasMore, setReplyHasMore] = useState({});
    const replyRefs = useRef({});

    const maxread = 150;
    const isLongDescription = p1.description && p1.description.length > maxread;

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        }

        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showOptions]);

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3000/deletepost/${p1._id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const result = await response.json();
            if (result) {
                if (onDelete) {
                    onDelete(p1._id);
                }
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
        setShowOptions(false);
    };

    // Handle comment deletion - update UI immediately
    const handleCommentDelete = (commentId) => {
        setget_command(prev => prev.filter(c => c._id !== commentId));
        setcommentCount(prev => Math.max(0, prev - 1));
    };

    // Handle reply deletion - update UI immediately
    const handleReplyDelete = (replyId, parentCommentId) => {
        // Remove reply from the replies list
        setgetreply(prev => ({
            ...prev,
            [parentCommentId]: prev[parentCommentId]?.filter(r => r._id !== replyId) || []
        }));
        // Decrement replies count on the parent comment
        setget_command(prev => prev.map(c => {
            if (c._id === parentCommentId) {
                return { ...c, repliesCount: Math.max(0, (c.repliesCount || 1) - 1) };
            }
            return c;
        }));
    };

    async function sentlikeon() {
        const response = await fetch(`http://localhost:3000/post/${p1._id}/likeon`, {
            method: 'POST',
            credentials: 'include'
        });
        console.log("response :likeon request");
    }

    async function sentlikeoff() {
        const response = await fetch(`http://localhost:3000/post/${p1._id}/likeoff`, {
            method: 'POST',
            credentials: 'include'
        });
        console.log("response :likeoff request");
    }

    async function sentdislikeon() {
        const response = await fetch(`http://localhost:3000/post/${p1._id}/dislikeon`, {
            method: 'POST',
            credentials: 'include'
        });
        console.log("response :dislikeon request");
    }

    async function sentdislikeoff() {
        const response = await fetch(`http://localhost:3000/post/${p1._id}/dislikeoff`, {
            method: 'POST',
            credentials: 'include'
        });
        console.log("response :dislikeoff request");
    }

    async function getcommand() {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:3000/post/${p1._id}/comment?page=${c_page}`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();

            if (c_page === 1) {
                setget_command(data.comments);
            } else {
                // FIXED: Changed from appending to prepending for infinite scroll
                // But for pagination, we should append at bottom. However, for new comments we prepend
                setget_command(prev => [...prev, ...data.comments]);
            }

            if (data.comments.length === 0) {
                setHasMore(false);
            }

            console.log("Comments response:", data);

        } catch (error) {
            console.error("Error fetching comments:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    // FIXED: Added optimistic update for new comments at the top
    async function sent_command() {
        // Create a temporary comment object for optimistic update
        const tempComment = {
            _id: `temp-${Date.now()}`,
            text: comment,
            userId: {
                profile_url: "default-avatar.png", // You might want to get current user's profile
                name: "You" // Or get current user's name
            },
            likesCount: 0,
            dislikesCount: 0,
            repliesCount: 0,
            isLiked: false,
            isDisliked: false,
            createdAt: new Date().toISOString()
        };

        // FIXED: Add new comment at the TOP immediately
        setget_command(prev => [tempComment, ...(prev || [])]);
        setcommentCount(prev => prev + 1);
        setcomment(""); // Clear input immediately

        try {
            const response = await fetch(`http://localhost:3000/post/${p1._id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ text: comment, parentCommentId: null }),
            });

            const result = await response.json();

            if (result.comment) {
                // Replace temp comment with real comment from server
                setget_command(prev =>
                    prev.map(c =>
                        c._id === tempComment._id ? result.comment : c
                    )
                );
            } else {
                // If server didn't return comment, refetch to get accurate data
                setc_page(1);
                setHasMore(true);
                await getcommand();
            }

            console.log("response : comment sent");

        } catch (error) {
            console.error("Error sending comment:", error);
            // Remove temp comment on error
            setget_command(prev => prev.filter(c => c._id !== tempComment._id));
            setcommentCount(prev => Math.max(0, prev - 1));
            // Restore the comment text so user can try again
            setcomment(tempComment.text);
        }
    }

    useEffect(() => {
        if (command && c_page > 1) {
            getcommand();
        }
    }, [c_page]);

    useEffect(() => {
        if (command) {
            setc_page(1);
            setHasMore(true);
        }
    }, [command]);

    async function send_reply(parentCommentId) {
        // Update UI immediately - increment reply count
        setget_command(prev =>
            prev.map(comment => {
                if (comment._id === parentCommentId) {
                    return {
                        ...comment,
                        repliesCount: (comment.repliesCount || 0) + 1
                    };
                }
                return comment;
            })
        );

        try {
            const response = await fetch(`http://localhost:3000/post/${p1._id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    text: comment,
                    parentCommentId: parentCommentId
                }),
            });
            console.log("response : reply sent");

            // Refresh replies if they are shown
            if (showRepliesForComment[parentCommentId]) {
                // Reset to page 1 and reload all replies
                setReplyPages(prev => ({ ...prev, [parentCommentId]: 1 }));
                setgetreply(prev => ({ ...prev, [parentCommentId]: [] }));
                await get_reply(parentCommentId, 1, true);
            }

        } catch (error) {
            console.error("Error sending reply:", error);
            // Rollback on error
            setget_command(prev =>
                prev.map(comment => {
                    if (comment._id === parentCommentId) {
                        return {
                            ...comment,
                            repliesCount: Math.max(0, (comment.repliesCount || 1) - 1)
                        };
                    }
                    return comment;
                })
            );
        } finally {
            setReplyingToCommentId(null);
            setcomment("");
        }
    }

    // Handle comment like with immediate UI update
    async function handleCommentLike(commentId) {
        setget_command(prev =>
            prev.map(comment => {
                if (comment._id === commentId) {
                    const updatedComment = { ...comment };

                    if (updatedComment.isLiked) {
                        updatedComment.likesCount = Math.max(0, updatedComment.likesCount - 1);
                        updatedComment.isLiked = false;
                    } else {
                        updatedComment.likesCount = updatedComment.likesCount + 1;
                        updatedComment.isLiked = true;

                        if (updatedComment.isDisliked) {
                            updatedComment.dislikesCount = Math.max(0, updatedComment.dislikesCount - 1);
                            updatedComment.isDisliked = false;
                        }
                    }

                    return updatedComment;
                }
                return comment;
            })
        );

        try {
            const response = await fetch(`http://localhost:3000/comment/${commentId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            console.log("response : comment liked");
        } catch (error) {
            console.error("Error liking comment:", error);
        }
    }

    // Handle comment dislike with immediate UI update
    async function handleCommentDislike(commentId) {
        setget_command(prev =>
            prev.map(comment => {
                if (comment._id === commentId) {
                    const updatedComment = { ...comment };

                    if (updatedComment.isDisliked) {
                        updatedComment.dislikesCount = Math.max(0, updatedComment.dislikesCount - 1);
                        updatedComment.isDisliked = false;
                    } else {
                        updatedComment.dislikesCount = updatedComment.dislikesCount + 1;
                        updatedComment.isDisliked = true;

                        if (updatedComment.isLiked) {
                            updatedComment.likesCount = Math.max(0, updatedComment.likesCount - 1);
                            updatedComment.isLiked = false;
                        }
                    }

                    return updatedComment;
                }
                return comment;
            })
        );

        try {
            const response = await fetch(`http://localhost:3000/comment/${commentId}/dislike`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            console.log("response : comment disliked");
        } catch (error) {
            console.error("Error disliking comment:", error);
        }
    }

    // Get replies with pagination
    async function get_reply(commentId, page = 1, reset = false) {
        setReplyLoading(prev => ({ ...prev, [commentId]: true }));

        try {
            const response = await fetch(`http://localhost:3000/comment/${commentId}/replies?page=${page}&limit=10`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const data = await response.json();

            // Handle different response structures
            let replies = [];
            if (Array.isArray(data)) {
                replies = data;
            } else if (data.replies) {
                replies = data.replies;
            } else if (data.comments) {
                replies = data.comments;
            }

            setgetreply(prev => {
                const currentReplies = prev[commentId] || [];
                if (reset || page === 1) {
                    return { ...prev, [commentId]: replies };
                } else {
                    return { ...prev, [commentId]: [...currentReplies, ...replies] };
                }
            });

            // Update hasMore flag for this comment
            setReplyHasMore(prev => ({
                ...prev,
                [commentId]: replies.length === 10
            }));

            // Update page for this comment
            setReplyPages(prev => ({
                ...prev,
                [commentId]: page
            }));

            console.log("Loaded replies for comment", commentId, "page", page, "count:", replies.length);

        } catch (error) {
            console.error("Error fetching replies:", error);
        } finally {
            setReplyLoading(prev => ({ ...prev, [commentId]: false }));
        }
    }

    // Function to handle scroll for replies
    const handleReplyScroll = (e, commentId) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;

        // Load more when scrolled near bottom (within 50px)
        if (scrollHeight - scrollTop - clientHeight < 50) {
            // Check if not already loading and has more to load
            if (!replyLoading[commentId] && replyHasMore[commentId] !== false) {
                const nextPage = (replyPages[commentId] || 1) + 1;
                get_reply(commentId, nextPage);
            }
        }
    };

    const toggleReplies = async (commentId) => {
        const isCurrentlyShowing = showRepliesForComment[commentId];

        setShowRepliesForComment(prev => ({
            ...prev,
            [commentId]: !isCurrentlyShowing
        }));

        if (!isCurrentlyShowing) {
            // Initialize states for this comment if not exists
            if (!replyPages[commentId]) {
                setReplyPages(prev => ({ ...prev, [commentId]: 1 }));
            }
            if (!getreply[commentId] || getreply[commentId].length === 0) {
                await get_reply(commentId, 1, true);
            }
        }

        setReplyingToCommentId(null);
    };

    return (
        <div className="post-container">
            <div className="post-header">
                <img
                    src={p1.userId?.profile_url}
                    alt="profile"
                    className="profile-pic"
                />
                <span className="username">{p1.userId?.name}</span>
                {p1.timeAgo && <div>{p1.timeAgo}</div>}

                {del && (
                    <div className="post-options" ref={optionsRef}>
                        <button
                            className="options-button"
                            onClick={() => setShowOptions(!showOptions)}
                            title="More options"
                        >
                            ⋮
                        </button>

                        {showOptions && (
                            <>
                                <div className="options-overlay"></div>
                                <div className="options-menu">
                                    <button
                                        className="option-item delete-option"
                                        onClick={handleDelete}
                                    >
                                        Delete Post
                                    </button>
                                    <button
                                        className="option-item cancel-option"
                                        onClick={() => setShowOptions(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {p1.title && (
                <div className="post-title">
                    <h3>{p1.title}</h3>
                </div>
            )}

            <div className="post-media">
                {p1.type === "image" && (
                    <img
                        src={p1.url}
                        alt="post"
                        className="post-image"
                    />
                )}
                {p1.type === "video" && (
                    <video
                        src={p1.url}
                        controls
                        className="post-video"
                    />
                )}
            </div>

            {p1.description && (
                <div className="post-description">
                    <p>
                        {read || !isLongDescription
                            ? p1.description : `${p1.description.substring(0, maxread)}...`
                        }
                        {isLongDescription && (
                            <button
                                className="read-more-btn"
                                onClick={() => setread(!read)}
                            >
                                {read ? 'Show Less' : 'Read More'}
                            </button>
                        )}
                    </p>
                    <div>
                        {tag}
                    </div>
                </div>
            )}

            <div className="post-stats">
                <span><div><button onClick={() => {
                    if (isliked === false) {
                        if (isdisliked === true) {
                            setdislike(c => c - 1);
                            setisdisliked(false);
                            sentdislikeoff();
                        }
                        setlike(c => c + 1);
                        setisliked(true);
                        sentlikeon();
                    }
                    else {
                        setlike(c => c - 1);
                        setisliked(false);
                        sentlikeoff();
                    }
                }}><ArrowBigUp /></button><div>{like}</div></div></span>
                <span><div><button onClick={() => {
                    if (isdisliked === false) {
                        if (isliked === true) {
                            setlike(c => c - 1);
                            setisliked(false);
                            sentlikeoff();
                        }
                        setdislike(c => c + 1);
                        setisdisliked(true);
                        sentdislikeon();
                    }
                    else {
                        setdislike(c => c - 1);
                        setisdisliked(false);
                        sentdislikeoff();
                    }
                }}><ArrowBigDown /></button><div>{dislike}</div></div></span>
                <div>
                    <button onClick={() => {
                        setcommand(!command);
                        if (!command) {
                            getcommand();
                        }
                    }}>
                        <MessageCircle />
                    </button>
                    <div>{commentCount}</div>
                </div>
                <div>
                    <button >
                        <Send />
                    </button>
                </div>
            </div>
            <div>
                <div>
                    {command && (
                        <div>
                            <div
                                onScroll={(e) => {
                                    const { scrollTop, scrollHeight, clientHeight } = e.target;
                                    if (scrollHeight - scrollTop - clientHeight < 50 && !Loading && hasMore) {
                                        setc_page(prev => prev + 1);
                                    }
                                }}
                                style={{
                                    maxHeight: '250px',
                                    overflowY: 'auto',
                                    marginBottom: '10px'
                                }}
                            >
                                {!get_command || get_command.length === 0 ? (
                                    <div>No comments</div>
                                ) : (
                                    get_command.map((c, index) => (
                                        <div key={c._id || index}>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <img src={c.userId?.profile_url || "/default-avatar.png"} alt="profile" className="profile-pic" />
                                                {c.userId?.name || "You"}
                                                {(user === name.current || c.userId?.name === name.current) && (
                                                    <div>
                                                        <Delete c_id={c._id} onDelete={handleCommentDelete} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ margin: "10px", paddingLeft: "55px" }}>
                                                <div>{c.text}</div>
                                                <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        {c.likesCount}
                                                        <button onClick={() => handleCommentLike(c._id)}>
                                                            like
                                                        </button>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        {c.dislikesCount}
                                                        <button onClick={() => handleCommentDislike(c._id)}>
                                                            dislike
                                                        </button>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        {c.repliesCount}
                                                        <button onClick={() => toggleReplies(c._id)}>
                                                            {showRepliesForComment[c._id] ? "Hide replies" : "View replies"}
                                                        </button>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <button onClick={() => {
                                                            setReplyingToCommentId(
                                                                replyingToCommentId === c._id ? null : c._id
                                                            );
                                                            setcomment("");
                                                        }}>
                                                            {replyingToCommentId === c._id ? "Cancel" : "Reply"}
                                                        </button>
                                                    </div>
                                                </div>


                                                {replyingToCommentId === c._id && (
                                                    <div style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
                                                        <input
                                                            value={comment}
                                                            type="text"
                                                            onChange={(e) => setcomment(e.target.value)}
                                                            placeholder="Write a reply..."
                                                            style={{ flex: 1 }}
                                                            autoFocus
                                                        />
                                                        <button onClick={() => send_reply(c._id)}>
                                                            Send
                                                        </button>
                                                    </div>
                                                )}

                                                {showRepliesForComment[c._id] && (
                                                    <div style={{
                                                        marginTop: "10px",
                                                        marginLeft: "20px",
                                                        borderLeft: "2px solid #ddd",
                                                        paddingLeft: "10px"
                                                    }}>
                                                        <div
                                                            ref={el => replyRefs.current[c._id] = el}
                                                            onScroll={(e) => handleReplyScroll(e, c._id)}
                                                            style={{
                                                                maxHeight: "200px",
                                                                overflowY: "auto",
                                                                marginBottom: "10px"
                                                            }}
                                                        >
                                                            {getreply[c._id] && getreply[c._id].length > 0 ? (
                                                                getreply[c._id].map((reply, replyIndex) => (
                                                                    <div key={reply._id || replyIndex} style={{
                                                                        marginBottom: "8px",
                                                                        paddingBottom: "8px",
                                                                        borderBottom: "1px solid #eee"
                                                                    }}>
                                                                        <div style={{ display: "flex", alignItems: "center" }}>
                                                                            <img
                                                                                src={reply.user?.profile_url || reply.userId?.profile_url || "/default-avatar.png"}
                                                                                alt="profile"
                                                                                style={{
                                                                                    width: "25px",
                                                                                    height: "25px",
                                                                                    borderRadius: "50%",
                                                                                    marginRight: "8px"
                                                                                }}
                                                                            />
                                                                            <strong style={{ fontSize: "0.9em" }}>
                                                                                {reply.user?.name || reply.userId?.name || "Unknown User"}
                                                                            </strong>
                                                                            {(user === name.current || (reply.user?.name || reply.userId?.name) === name.current) && (
                                                                                <Reply_delete
                                                                                    c_id={reply._id}
                                                                                    parentCommentId={c._id}
                                                                                    onDelete={handleReplyDelete}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <div style={{ marginLeft: "33px", fontSize: "0.9em" }}>
                                                                            {reply.text || reply.content || "No content"}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div style={{ color: "#666", fontSize: "0.9em" }}>
                                                                    No replies yet
                                                                </div>
                                                            )}

                                                            {/* Show loading indicator when loading more replies */}
                                                            {replyLoading[c._id] && (
                                                                <div style={{ textAlign: "center", padding: "10px", color: "#666", fontSize: "0.9em" }}>
                                                                    Loading more replies...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}

                                {Loading && (
                                    <div style={{ textAlign: 'center', padding: '10px' }}>
                                        Loading more comments...
                                    </div>
                                )}
                            </div>

                            {replyingToCommentId === null && (
                                <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
                                    <input
                                        value={comment}
                                        type="text"
                                        onChange={(e) => setcomment(e.target.value)}
                                        placeholder="Write a comment..."
                                        style={{ flex: 1 }}
                                    />
                                    <button onClick={() => {
                                        sent_command();
                                    }}>
                                        Send
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Addpost;