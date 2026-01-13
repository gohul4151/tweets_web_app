import { useState, useEffect, useRef } from 'react';
import '../post.css';
import { ArrowBigUp } from 'lucide-react';
import { ArrowBigDown } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { Send } from 'lucide-react';

function Addpost({ p1, del, onDelete }) {
    const [comment, setcomment] = useState("");
    const [error, setError] = useState(null);
    const [get_command,setget_command]=useState(null);
    const [command,setcommand]=useState(false);
    const [reply,setreply]=useState("");
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);
    const [like, setlike] = useState(p1.likesCount);
    const [dislike, setdislike] = useState(p1.dislikesCount);
    const [isliked, setisliked] = useState(p1.isLiked);
    const [isdisliked, setisdisliked] = useState(p1.isDisliked);
    const [read, setread] = useState(false);
    const [tag,settag]=useState(p1.tags);
    const [c_page,setc_page]=useState(1);
    const [Loading,setLoading]=useState(false);
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
                // Call the onDelete callback if provided
                if (onDelete) {
                    onDelete(p1._id);
                }
            }
            // No alerts - silent failure
        } catch (error) {
            console.error('Error deleting post:', error);
            // No alerts - silent failure
        }
        setShowOptions(false);
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
            setget_command(data.comments);
            console.log("Comments response:", data);
            
        } catch (error) {
            console.error("Error fetching comments:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function sent_command() {
        const response = await fetch(`http://localhost:3000/post/${p1._id}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ text: comment, parentCommentId: null }),
        });
        console.log("response : comment sent");
        setLoading(true); // Show loading indicator
        await getcommand(); // Wait for getcommand to complete
        setLoading(false); // Hide loading indicator
        setcomment("");
    }

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

                {/* Three-dot options menu - only show if del prop is true */}
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
                    if (isliked == false) {
                        if (isdisliked == true) {
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
                    if (isdisliked == false) {
                        if (isliked == true) {
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
                            if (!command) 
                            {
                                getcommand();
                            }
                        }}>
                            <MessageCircle  />
                        </button>
                    <div>{p1.commentCount}</div>
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
                        <div className="comments-section">
                            {Loading ? <div>Loading...</div> : 
                            !get_command || get_command.length===0 ? <div>No comments</div> : 
                            get_command.map((c, index) => (
                                <div key={c._id || `comment-${index}`}>
                                    <div style={{display:"flex", alignItems:"center"}}>
                                        <img src={c.userId?.profile_url} alt="profile" className="profile-pic"/>
                                        {c.userId?.name}
                                    </div>
                                    <div style={{margin:"10px",paddingLeft:"55px"}}>
                                        {c.text}
                                    </div>
                                </div>
                            ))}
                            <input value={comment} type="text" onChange={(e) => setcomment(e.target.value)} />
                            <button onClick={() => {sent_command();  }}>Send</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Addpost;
