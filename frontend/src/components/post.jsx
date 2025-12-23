import {useState} from 'react';
import '../post.css'; // Import the CSS file

function Addpost({p1})
{
    return (
        <div className="post-container">
            <div className="post-header">
                <img 
                    src={p1.userId?.profile_url}
                    alt="profile" 
                    className="profile-pic"
                />
                <span className="username">{p1.userId?.name}</span>  {/* alternative way: {p1.userId ? p1.userId.name : ''} */}
                <div>{p1.timeAgo}</div>
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