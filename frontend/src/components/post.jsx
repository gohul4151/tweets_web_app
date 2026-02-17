import { useState, useEffect, useRef } from 'react';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Send, MoreVertical, X, Trash2, Reply, Pencil, Loader2 } from 'lucide-react';
import Delete from './delete';
import Reply_delete from './reply_delete';
import Share from './share';

function Addpost({ p1, del, onDelete, onUserClick, canInteract = true }) {
    const profile = useRef(null);
    const name = useRef(null);
    const [user, setuser] = useState(p1.userId?.name);
    const [getreply, setgetreply] = useState({});
    const [commentCount, setcommentCount] = useState(p1.commentCount);
    const [comment, setcomment] = useState("");
    const [replyText, setReplyText] = useState("");
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
    const [title, setTitle] = useState(p1.title);
    const [description, setDescription] = useState(p1.description);
    const [c_page, setc_page] = useState(1);
    const [Loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showRepliesForComment, setShowRepliesForComment] = useState({});
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const [showShare, setShowShare] = useState(false);
    const [authToast, setAuthToast] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTitle, setEditTitle] = useState(p1.title || '');
    const [editDescription, setEditDescription] = useState(p1.description || '');
    const [editTag, setEditTag] = useState(p1.tags || '');
    const [editLoading, setEditLoading] = useState(false);
    const [editMessage, setEditMessage] = useState('');

    // Track reply pages and loading states for each comment
    const [replyPages, setReplyPages] = useState({});
    const [replyLoading, setReplyLoading] = useState({});
    const [replyHasMore, setReplyHasMore] = useState({});
    const replyRefs = useRef({});

    const maxread = 150;
    const isLongDescription = description && description.length > maxread;

    // Helper: check if user can interact; if not, show login/signup toast
    function requireAuth() {
        if (!canInteract) {
            setAuthToast(true);
            setTimeout(() => setAuthToast(false), 3000);
            return false;
        }
        return true;
    }

    //getting the username
    useEffect(() => {
        async function username() {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/mytotalpost`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (data) {
                    name.current = data.name;
                    profile.current = data.profile_url;
                }
            } catch (e) {
                // silently fail
            }
        }
        username();
    }, []);

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
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/deletepost/${p1._id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok) {
                if (onDelete) {
                    onDelete(p1._id);
                }
            } else {
                console.error('Failed to delete post:', result.message);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
        setShowOptions(false);
    };

    const handleEditOpen = () => {
        setEditTitle(title || '');
        setEditDescription(description || '');
        setEditTag(tag || '');
        setEditMessage('');
        setShowEditModal(true);
        setShowOptions(false);
    };

    const handleEditSave = async () => {
        setEditLoading(true);
        setEditMessage('');
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/editpost/${p1._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    tags: editTag
                })
            });
            const result = await response.json();
            if (response.ok) {
                setTitle(editTitle);
                setDescription(editDescription);
                settag(editTag);
                setEditMessage('Post updated successfully!');
                setTimeout(() => {
                    setShowEditModal(false);
                    setEditLoading(false);
                }, 1000);
            } else {
                setEditMessage(result.message || 'Failed to update post');
                setEditLoading(false);
            }
        } catch (error) {
            console.error('Error editing post:', error);
            setEditMessage('Network error: ' + error.message);
            setEditLoading(false);
        }
    };

    // Handle comment deletion - update UI immediately
    const handleCommentDelete = (commentId) => {
        setget_command(prev => prev.filter(c => c._id !== commentId));
        setcommentCount(prev => Math.max(0, prev - 1));
    };

    // Handle reply deletion - update UI immediately
    const handleReplyDelete = (replyId, parentCommentId) => {
        setgetreply(prev => ({
            ...prev,
            [parentCommentId]: prev[parentCommentId]?.filter(r => r._id !== replyId) || []
        }));
        setget_command(prev => prev.map(c => {
            if (c._id === parentCommentId) {
                return { ...c, repliesCount: Math.max(0, (c.repliesCount || 1) - 1) };
            }
            return c;
        }));
    };

    async function sentlikeon() {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/post/${p1._id}/likeon`, {
            method: 'POST',
            credentials: 'include'
        });
    }

    async function sentlikeoff() {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/post/${p1._id}/likeoff`, {
            method: 'POST',
            credentials: 'include'
        });
    }

    async function sentdislikeon() {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/post/${p1._id}/dislikeon`, {
            method: 'POST',
            credentials: 'include'
        });
    }

    async function sentdislikeoff() {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/post/${p1._id}/dislikeoff`, {
            method: 'POST',
            credentials: 'include'
        });
    }

    async function getcommand() {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/post/${p1._id}/comment?page=${c_page}`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();

            if (c_page === 1) {
                setget_command(data.comments);
            } else {
                setget_command(prev => [...prev, ...data.comments]);
            }

            if (data.comments.length === 0) {
                setHasMore(false);
            }

        } catch (error) {
            console.error("Error fetching comments:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function sent_command() {
        if (!comment.trim()) return;

        const tempComment = {
            _id: `temp-${Date.now()}`,
            text: comment,
            userId: {
                profile_url: profile.current || "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg",
                name: name.current || "You"
            },
            likesCount: 0,
            dislikesCount: 0,
            repliesCount: 0,
            isLiked: false,
            isDisliked: false,
            createdAt: new Date().toISOString()
        };

        setget_command(prev => [tempComment, ...(prev || [])]);
        setcommentCount(prev => prev + 1);
        setcomment("");

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/post/${p1._id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ text: tempComment.text, parentCommentId: null }),
            });

            const result = await response.json();

            if (result.comment) {
                setget_command(prev =>
                    prev.map(c => c._id === tempComment._id ? result.comment : c)
                );
            } else {
                setc_page(1);
                setHasMore(true);
                await getcommand();
            }

        } catch (error) {
            console.error("Error sending comment:", error);
            setget_command(prev => prev.filter(c => c._id !== tempComment._id));
            setcommentCount(prev => Math.max(0, prev - 1));
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
            getcommand();
        }
    }, [command]);

    async function send_reply(parentCommentId) {
        if (!replyText.trim()) return;

        setget_command(prev =>
            prev.map(c => {
                if (c._id === parentCommentId) {
                    return { ...c, repliesCount: (c.repliesCount || 0) + 1 };
                }
                return c;
            })
        );

        const replyContent = replyText;
        setReplyText(""); // Clear immediately
        setReplyingToCommentId(null);

        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/post/${p1._id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ text: replyContent, parentCommentId: parentCommentId }),
            });

            if (showRepliesForComment[parentCommentId]) {
                setReplyPages(prev => ({ ...prev, [parentCommentId]: 1 }));
                setgetreply(prev => ({ ...prev, [parentCommentId]: [] })); // Clear and reload
                await get_reply(parentCommentId, 1, true);
            }

        } catch (error) {
            console.error("Error sending reply:", error);
            // Rollback could go here
        }
    }

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
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/comment/${commentId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
        } catch (error) {
            console.error("Error liking comment:", error);
        }
    }

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
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/comment/${commentId}/dislike`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
        } catch (error) {
            console.error("Error disliking comment:", error);
        }
    }

    async function get_reply(commentId, page = 1, reset = false) {
        setReplyLoading(prev => ({ ...prev, [commentId]: true }));

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comment/${commentId}/replies?page=${page}&limit=10`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            const data = await response.json();
            let replies = Array.isArray(data) ? data : (data.replies || data.comments || []);

            setgetreply(prev => {
                const currentReplies = prev[commentId] || [];
                if (reset || page === 1) {
                    return { ...prev, [commentId]: replies };
                } else {
                    return { ...prev, [commentId]: [...currentReplies, ...replies] };
                }
            });

            setReplyHasMore(prev => ({ ...prev, [commentId]: replies.length === 10 }));
            setReplyPages(prev => ({ ...prev, [commentId]: page }));

        } catch (error) {
            console.error("Error fetching replies:", error);
        } finally {
            setReplyLoading(prev => ({ ...prev, [commentId]: false }));
        }
    }

    const handleReplyScroll = (e, commentId) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            if (!replyLoading[commentId] && replyHasMore[commentId] !== false) {
                const nextPage = (replyPages[commentId] || 1) + 1;
                get_reply(commentId, nextPage);
            }
        }
    };

    const toggleReplies = async (commentId) => {
        const isCurrentlyShowing = showRepliesForComment[commentId];
        setShowRepliesForComment(prev => ({ ...prev, [commentId]: !isCurrentlyShowing }));

        if (!isCurrentlyShowing) {
            if (!replyPages[commentId]) setReplyPages(prev => ({ ...prev, [commentId]: 1 }));
            if (!getreply[commentId] || getreply[commentId].length === 0) await get_reply(commentId, 1, true);
        }
        setReplyingToCommentId(null);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl mb-6 overflow-hidden transition-all duration-300 hover:border-slate-300 dark:hover:border-zinc-700 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none group/card">
            {/* Header */}
            <div className="p-4 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <img
                        src={p1.userId?.profile_url || "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg"}
                        alt="profile"
                        className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onUserClick && onUserClick(p1.userId?.name)}
                    />
                    <div>
                        <h3
                            className="font-bold text-gray-900 dark:text-gray-100 hover:underline cursor-pointer text-sm md:text-base"
                            onClick={() => onUserClick && onUserClick(p1.userId?.name)}
                        >
                            {p1.userId?.name}
                        </h3>
                        {p1.timeAgo && <p className="text-xs text-gray-500 dark:text-gray-400">{p1.timeAgo}</p>}
                    </div>
                </div>

                {del && (
                    <div className="relative" ref={optionsRef}>
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <MoreVertical size={20} />
                        </button>

                        {showOptions && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-100 dark:border-gray-800 z-10 py-1">
                                <button
                                    onClick={handleEditOpen}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                                >
                                    <Pencil size={16} /> Edit Post
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> Delete Post
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-5 pb-3">
                {title && <h2 className="text-xl font-bold mb-2.5 text-slate-900 dark:text-slate-50 leading-snug tracking-tight">{title}</h2>}

                {description && (
                    <div className="text-slate-700 dark:text-slate-300 mb-3 whitespace-pre-wrap text-base leading-relaxed font-normal">
                        {read || !isLongDescription
                            ? description : `${description.substring(0, maxread)}...`
                        }
                        {isLongDescription && (
                            <button
                                className="text-blue-500 hover:text-blue-400 ml-1 font-medium text-sm"
                                onClick={() => setread(!read)}
                            >
                                {read ? 'Show Less' : 'Read More'}
                            </button>
                        )}
                        <div className="mt-2 text-blue-500 text-sm font-medium">{tag}</div>
                    </div>
                )}
            </div>

            {/* Media */}
            <div className="w-full bg-slate-50 dark:bg-slate-950/50 px-2">
                <div className="rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                    {p1.type === "image" && (
                        <img src={p1.url} alt="post" className="w-full h-auto object-cover max-h-[700px] hover:scale-[1.01] transition-transform duration-500" />
                    )}
                    {p1.type === "video" && (
                        <video src={p1.url} controls className="w-full h-auto max-h-[600px]" />
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 px-5 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    if (!requireAuth()) return;
                                    if (isliked) {
                                        setlike(c => c - 1); setisliked(false); sentlikeoff();
                                    } else {
                                        if (isdisliked) { setdislike(c => c - 1); setisdisliked(false); sentdislikeoff(); }
                                        setlike(c => c + 1); setisliked(true); sentlikeon();
                                    }
                                }}
                                className={`p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all ${isliked ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'hover:text-emerald-500'}`}
                            >
                                <ArrowBigUp size={24} fill={isliked ? "currentColor" : "none"} />
                            </button>
                            <span className="font-medium text-sm">{like}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    if (!requireAuth()) return;
                                    if (isdisliked) {
                                        setdislike(c => c - 1); setisdisliked(false); sentdislikeoff();
                                    } else {
                                        if (isliked) { setlike(c => c - 1); setisliked(false); sentlikeoff(); }
                                        setdislike(c => c + 1); setisdisliked(true); sentdislikeon();
                                    }
                                }}
                                className={`p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all ${isdisliked ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'hover:text-rose-500'}`}
                            >
                                <ArrowBigDown size={24} fill={isdisliked ? "currentColor" : "none"} />
                            </button>
                            <span className="font-medium text-sm">{dislike}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    if (!requireAuth()) return;
                                    setcommand(!command);
                                }}
                                className={`p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all ${command ? 'text-slate-900 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-100' : 'hover:text-slate-600'}`}
                            >
                                <MessageCircle size={24} />
                            </button>
                            <span className="font-medium text-sm">{commentCount}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowShare(true)}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all hover:text-slate-900 dark:hover:text-zinc-100"
                    >
                        <Send size={24} />
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {command && (
                <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="flex gap-3 my-5">
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setcomment(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="flex-1 px-5 py-3 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-sm shadow-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sent_command();
                                }
                            }}
                        />
                        <button
                            onClick={sent_command}
                            disabled={!comment.trim()}
                            className="p-3 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl disabled:opacity-50 hover:opacity-90 shadow-md shadow-slate-900/10 disabled:shadow-none transition-all active:scale-95"
                        >
                            <Send size={16} />
                        </button>
                    </div>

                    <div
                        onScroll={(e) => {
                            const { scrollTop, scrollHeight, clientHeight } = e.target;
                            if (scrollHeight - scrollTop - clientHeight < 50 && !Loading && hasMore) {
                                setc_page(prev => prev + 1);
                            }
                        }}
                        className="max-h-[400px] overflow-y-auto space-y-4 pr-2"
                    >
                        {!get_command || get_command.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first!</div>
                        ) : (
                            get_command.map((c, index) => (
                                <div key={c._id || index} className="group">
                                    <div className="flex gap-3">
                                        <img
                                            src={c.userId?.profile_url || "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg"}
                                            alt="profile"
                                            className="w-8 h-8 rounded-full object-cover mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="bg-white dark:bg-black p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm inline-block min-w-[200px]">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{c.userId?.name || "You"}</span>
                                                    {(user === name.current || c.userId?.name === name.current) && (
                                                        <Delete c_id={c._id} onDelete={handleCommentDelete} />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{c.text}</p>
                                            </div>

                                            <div className="flex items-center gap-4 mt-2 ml-1 text-xs text-gray-500 font-medium">
                                                <button
                                                    onClick={() => { if (!requireAuth()) return; handleCommentLike(c._id); }}
                                                    className={`hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors ${c.isLiked ? 'text-blue-500 dark:text-blue-400' : ''}`}
                                                >
                                                    <ArrowBigUp size={16} fill={c.isLiked ? "currentColor" : "none"} />
                                                    {c.likesCount > 0 && c.likesCount}
                                                </button>
                                                <button
                                                    onClick={() => { if (!requireAuth()) return; handleCommentDislike(c._id); }}
                                                    className={`hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors ${c.isDisliked ? 'text-red-500' : ''}`}
                                                >
                                                    <ArrowBigDown size={16} fill={c.isDisliked ? "currentColor" : "none"} />
                                                    {c.dislikesCount > 0 && c.dislikesCount}
                                                </button>
                                                <button
                                                    onClick={() => { if (!requireAuth()) return; setReplyingToCommentId(replyingToCommentId === c._id ? null : c._id); }}
                                                    className={`hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors ${replyingToCommentId === c._id ? 'text-blue-500' : ''}`}
                                                >
                                                    <Reply size={14} />
                                                    {replyingToCommentId === c._id ? "Cancel" : "Reply"}
                                                </button>
                                                {c.repliesCount > 0 && (
                                                    <button onClick={() => toggleReplies(c._id)} className="hover:text-blue-500 text-blue-500 flex items-center gap-1.5 transition-colors ml-2">
                                                        <MessageCircle size={14} />
                                                        {showRepliesForComment[c._id] ? "Hide" : `${c.repliesCount} Replies`}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Reply Input */}
                                            {replyingToCommentId === c._id && (
                                                <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <input
                                                        type="text"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder={`Replying to ${c.userId?.name}...`}
                                                        className="flex-1 px-4 py-2 bg-white dark:bg-zinc-900 rounded-full border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-sm shadow-sm"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                send_reply(c._id);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => send_reply(c._id)}
                                                        disabled={!replyText.trim()}
                                                        className="text-xs px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                                                    >
                                                        Reply
                                                    </button>
                                                </div>
                                            )}

                                            {/* Replies List */}
                                            {showRepliesForComment[c._id] && (
                                                <div className="mt-3 pl-3 md:pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-3">
                                                    {getreply[c._id]?.map((reply, rIndex) => (
                                                        <div key={reply._id || rIndex} className="flex gap-2 group/reply">
                                                            <img
                                                                src={reply.user?.profile_url || reply.userId?.profile_url || "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg"}
                                                                alt="profile"
                                                                className="w-6 h-6 rounded-full object-cover mt-0.5 border border-gray-100 dark:border-gray-800"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-2xl rounded-tl-none inline-block min-w-[150px]">
                                                                    <div className="flex justify-between items-center gap-2 mb-0.5">
                                                                        <span className="font-bold text-xs text-gray-900 dark:text-gray-100">{reply.user?.name || reply.userId?.name}</span>
                                                                        {(user === name.current || (reply.user?.name || reply.userId?.name) === name.current) && (
                                                                            <Reply_delete c_id={reply._id} parentCommentId={c._id} onDelete={handleReplyDelete} />
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{reply.text || reply.content}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {replyLoading[c._id] && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 pl-2">
                                                            <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                                                            Loading replies...
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {Loading && (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-blue-500 inline-block"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showShare && <Share isOpen={showShare} onClose={() => setShowShare(false)} post={p1} />}

            {authToast && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full shadow-2xl z-[100] animate-bounce font-medium text-sm">
                    Please log in to interact!
                </div>
            )}

            {/* Edit Post Modal */}
            {showEditModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => { setShowEditModal(false); setEditLoading(false); setEditMessage(''); }}
                >
                    <div
                        className="bg-white dark:bg-black w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-black dark:text-white">Edit Post</h3>
                            <button
                                onClick={() => { setShowEditModal(false); setEditLoading(false); setEditMessage(''); }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors text-gray-500 hover:text-black dark:hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/20 border border-transparent focus:bg-white dark:focus:bg-black transition-all font-medium text-slate-900 dark:text-slate-100"
                                    placeholder="Enter post title"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/20 border border-transparent focus:bg-white dark:focus:bg-black transition-all font-medium resize-none text-slate-900 dark:text-slate-100"
                                    rows="4"
                                    placeholder="What's happening?"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Tag <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    type="text"
                                    value={editTag}
                                    onChange={(e) => setEditTag(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/20 border border-transparent focus:bg-white dark:focus:bg-black transition-all font-medium text-slate-900 dark:text-slate-100"
                                    placeholder="#tag"
                                />
                            </div>

                            <button
                                onClick={handleEditSave}
                                disabled={editLoading}
                                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-black font-bold text-base hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-slate-900/10"
                            >
                                {editLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>

                            {editMessage && (
                                <div className={`text-sm font-medium text-center p-2.5 rounded-xl ${editMessage.toLowerCase().includes('success')
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {editMessage}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Addpost;