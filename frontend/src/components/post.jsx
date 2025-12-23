import {useState, useEffect, useRef} from 'react';
import '../post.css';

function Addpost({p1, del, onDelete}) {
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);
    
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
            console.log("response",result);
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
                                        🗑️ Delete Post
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
                    <p>{p1.description}</p>
                </div>
            )}
            
            <div className="post-stats">
                <span>Likes: {p1.likesCount}</span>
                <span>Dislikes: {p1.dislikesCount}</span>
            </div>
        </div>
    );
}

export default Addpost;