import { useState, useRef, useEffect } from "react";
import FileUpload from "./upload_post";
import '../modal.css';
import Profile from "./viewprofile";
import YourPost from "./your_post";
import Addpost from "./post";
import { Sun } from 'lucide-react';
import { Moon } from 'lucide-react';
import { UserCog } from 'lucide-react';
import { Plus } from 'lucide-react';
import { SquareUser } from 'lucide-react';
import { House } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { Search } from 'lucide-react';
import useDebounce from './useDebounce';
import Username from './username';

function Home({ setlog, settheme, theme }) {
    function Theme() {
        if (theme == 'light') {
            settheme('dark');
        }
        else {
            settheme('light');
        }
    }
    const [home, sethome] = useState(true);
    const [p1, setp1] = useState([]);
    const [close, setclose] = useState(false);
    const [you_post, setyou] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [refpost, setrefpost] = useState(0);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const fetchPosts = async (page = 1) => {
        setIsLoading(true);
        try {
            const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/getpost?page=${page}`, {
                method: "GET",
                credentials: "include",
            });
            const data = await result.json();

            console.log("API Response:", data); // Debug log

            // Check if data has posts array
            const postsArray = data.posts;

            if (!Array.isArray(postsArray)) {
                console.error("Expected array but got:", postsArray);
                return;
            }

            if (postsArray.length === 0) {
                // No more posts to load
                setHasMore(false);
            } else {
                // Append new posts to existing ones
                if (page === 1) {
                    setp1(postsArray);
                } else {
                    setp1(prev => [...prev, ...postsArray]);
                }

                // Check if this was the last page (less than 10 posts)
                if (postsArray.length < 10) {
                    setHasMore(false);
                }
            }

        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load and when page changes
    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage, refpost]);

    // Infinite scroll handler
    const handleScroll = () => {
        if (isLoading || !hasMore) return;

        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        // Load more when user is near bottom (100px from bottom)
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            setCurrentPage(prev => prev + 1);
        }
    };

    // Add scroll listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading, hasMore]);

    // Reset states when component mounts
    useEffect(() => {
        setp1([]);
        setCurrentPage(1);
        setHasMore(true);
    }, [refpost]);

    const addpost = () => {
        setrefpost(prev => prev + 1);
    };

    const [viewUser, setViewUser] = useState(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    // Use custom debounce hook
    const debouncedQuery = useDebounce(searchQuery, 300);

    // Search users when debounced query changes
    useEffect(() => {
        async function searchUsers() {
            if (debouncedQuery.trim() === "") {
                setSearchResults([]);
                setShowResults(false);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/search/users?q=${encodeURIComponent(debouncedQuery)}`, {
                    method: "GET",
                    credentials: "include"
                });
                const data = await res.json();
                setSearchResults(data.users || data || []);
                setShowResults(true);
            } catch (error) {
                console.error("Error searching users:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }

        searchUsers();
    }, [debouncedQuery]);

    // Close search results when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (you_post) {
        return <YourPost you_post={you_post} setyou={setyou} setrefpost={setrefpost} />
    }

    if (viewUser) {
        return <Username username={viewUser} sethome={() => setViewUser(null)} />
    }



    return <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={Theme}>
                {theme == 'light' ? <Sun /> : <Moon />}
            </button>
            <div style={{ position: "relative", display: "inline-block" }} ref={searchRef}>
                <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888", zIndex: 1 }} size={18} />
                <input
                    placeholder="Search users..."
                    style={{ paddingLeft: "35px" }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowResults(true)}
                />
                <button onClick={() => {
                    if (searchQuery.trim()) {
                        setViewUser(searchQuery);
                    }
                }}>Search</button>

                {/* Search Results Dropdown */}
                {showResults && (
                    <div style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        backgroundColor: theme === 'dark' ? '#1a1a2e' : '#fff',
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        maxHeight: "300px",
                        overflowY: "auto",
                        zIndex: 1000,
                        marginTop: "5px"
                    }}>
                        {isSearching ? (
                            <div style={{ padding: "15px", textAlign: "center", color: "#888" }}>
                                Searching...
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((user, index) => (
                                <div
                                    key={user._id || index}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "10px 15px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee",
                                        transition: "background-color 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a4e' : '#f5f5f5'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    onClick={() => {
                                        console.log("Selected user:", user);
                                        setShowResults(false);
                                        setSearchQuery(user.name);
                                    }}
                                >
                                    <img
                                        src={user.profile_url || "/default-avatar.png"}
                                        alt={user.name}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            marginRight: "12px",
                                            objectFit: "cover"
                                        }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: "bold", fontSize: "14px" }}>{user.name}</div>
                                        {user.email && <div style={{ fontSize: "12px", color: "#888" }}>{user.email}</div>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: "15px", textAlign: "center", color: "#888" }}>
                                No users found
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div style={{ width: "40px" }}></div>
        </div>
        <div>
            <div>
                {p1.length > 0 ? (
                    p1.map((post, index) => (
                        <Addpost key={post._id || index} p1={post} onUserClick={setViewUser} />
                    ))
                ) : !isLoading ? (
                    <p>No posts to display</p>
                ) : null}

                {/* Loading indicator at bottom */}
                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p>Loading more posts...</p>
                    </div>
                )}

                {/* Show message when no more posts */}
                {!hasMore && p1.length > 0 && !isLoading && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        <p>No more posts to load</p>
                    </div>
                )}
            </div>

            <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={() => sethome(true)}><House /></button>
                <button onClick={() => setclose(true)}><Plus /></button>
                <button onClick={() => setShowProfileModal(true)}>Edit Profile  <UserCog /></button>
                <button onClick={() => { setyou(true); sethome(false); }}>My post <SquareUser /></button>
                <button onClick={() => setlog(false)}>logou <LogOut /></button>
            </div>

            {close && <Post close={close} setclose={setclose} addpost={addpost} />}
            {showProfileModal && <Profile showProfileModal={showProfileModal} setShowProfileModal={setShowProfileModal} setrefpost={setrefpost} />}
        </div>
    </>;
}

function Post({ close, setclose, addpost }) {
    const ti = useRef(null);
    const des = useRef(null);
    const tag = useRef(null);
    return (
        <div className="postmainback">
            <div className="postfront">
                <div className="postclose">
                    <button onClick={() => { setclose(false) }}>X</button>
                </div>
                <div className="posttitle">
                    <p>title</p>
                    <input ref={ti} type="text" placeholder="Enter post title" />
                </div>
                <div className="postbody">
                    <p>description</p>
                    <textarea ref={des} placeholder="Write your post description here..." rows="4" cols="50" />
                </div>
                <div className="posttag">
                    <p>tag(optional)</p>
                    <input ref={tag} type="text" placeholder="Enter the tag" />
                </div>
                <div className="postbuttons">
                    <FileUpload des={des} ti={ti} tag={tag} setclose={setclose} addpost={addpost} />
                </div>
            </div>
        </div>
    );
}

export default Home;