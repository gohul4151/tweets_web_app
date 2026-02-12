import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';

function Share({ post, isOpen, onClose }) {
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    if (!post) return null;

    const shareUrl = `${window.location.origin}/post/${post._id}`;
    const shareText = `Check out this post: ${post.title || post.description || 'Amazing post!'}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: isOpen ? 'auto' : 'none'
    };

    const modalStyle = {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '420px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.05)'
    };

    const headerStyle = {
        padding: '16px 20px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafafa'
    };

    const inputContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        padding: '4px',
        border: '1px solid #e5e7eb',
        marginTop: '0'
    };



    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>Share Post</h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex' }}
                    >
                        <X size={20} color="#6b7280" />
                    </button>
                </div>

                <div style={{ padding: '10px' }}>
                    <div>
                        {post.userId && (
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <img
                                    src={post.userId.profile_url || "/default-avatar.png"}
                                    alt="profile"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        marginRight: '12px',
                                        objectFit: 'cover'
                                    }}
                                />
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>{post.userId.name}</span>
                            </div>
                        )}
                        {post.title && (
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>{post.title}</p>
                            </div>
                        )}
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>Subject link</p>
                        <div style={inputContainerStyle}>
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    padding: '8px 12px',
                                    fontSize: '0.875rem',
                                    color: '#374151',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            />
                            <button
                                onClick={handleCopy}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: copied ? '#dcfce7' : '#ffffff',
                                    color: copied ? '#166534' : '#374151',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    boxShadow: copied ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Share;
