import { useState, useRef, useEffect } from "react";
import FileUpload from "./upload_post";
import Profile from "./viewprofile";
import YourPost from "./your_post";
import Addpost from "./post";
import {
    Sun, Moon, Home as HomeIcon, PlusSquare,
    User, LogOut, Search, X, MessageSquare, ChevronRight
} from 'lucide-react';
import useDebounce from './useDebounce';
import Username from './username';
import darkLogo from '../logo/dark.jpg';
import lightLogo from '../logo/light.jpeg';

function Home({ setlog, settheme, theme }) {
    const [home, sethome] = useState(true);
    const [p1, setp1] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [you_post, setyou] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [refpost, setrefpost] = useState(0);
    const [editProfile, setEditProfile] = useState(false);
    const [viewUser, setViewUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        async function fetchCurrentUser() {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/mytotalpost`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    credentials: "include",
                });
                const data = await res.json();
                setCurrentUser(data);
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        }
        fetchCurrentUser();
    }, [refpost]);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const debouncedQuery = useDebounce(searchQuery, 300);

    const toggleTheme = () => {
        settheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const fetchPosts = async (page = 1) => {
        setIsLoading(true);
        try {
            const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/getpost?page=${page}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                credentials: "include",
            });
            const data = await result.json();
            const postsArray = data.posts;

            if (!Array.isArray(postsArray)) return;

            if (postsArray.length === 0) {
                setHasMore(false);
            } else {
                if (page === 1) {
                    setp1(postsArray);
                } else {
                    setp1(prev => [...prev, ...postsArray]);
                }
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

    useEffect(() => {
        if (home && !you_post && !viewUser) {
            fetchPosts(currentPage);
        }
    }, [currentPage, refpost, home, you_post, viewUser]);

    const handleScroll = () => {
        if (isLoading || !hasMore || you_post || viewUser) return;
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            setCurrentPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading, hasMore, you_post, viewUser]);

    useEffect(() => {
        if (home && !you_post && !viewUser) {
            setp1([]);
            setCurrentPage(1);
            setHasMore(true);
        }
    }, [refpost, home, you_post, viewUser]);

    const addpost = () => {
        setrefpost(prev => prev + 1);
    };

    // Search Users Effect
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
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
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

    // Close search on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
                setInputFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Navigation handlers
    const handleHomeClick = () => {
        sethome(true);
        setyou(false);
        setViewUser(null);
        setEditProfile(false);
        setrefpost(prev => prev + 1);
    };

    const handleYourPostClick = () => {
        setyou(true);
        sethome(false);
        setViewUser(null);
        setEditProfile(false);
    };

    const handleEditProfileClick = () => {
        setEditProfile(true);
        sethome(false);
        setyou(false);
        setViewUser(null);
    };

    const handleFeedStackClick = () => {
        setViewUser("FeedStack");
        sethome(false);
        setyou(false);
        setEditProfile(false);
    };

    const NavItem = ({ onClick, icon: Icon, label, active, danger }) => (
        <button
            onClick={onClick}
            className={`flex items-center gap-4 p-3.5 w-full rounded-2xl transition-all duration-300 group relative overflow-hidden ${danger
                ? 'hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500'
                : active
                    ? 'bg-slate-50 dark:bg-zinc-800/40 text-slate-900 dark:text-zinc-100 font-bold'
                    : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                }`}
        >
            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-slate-900 dark:bg-zinc-100 rounded-r-full" />}
            <Icon size={24} className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className={`hidden md:block text-lg ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
            <div className="container mx-auto px-0 md:px-4 max-w-screen-2xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 min-h-screen relative">

                    {/* Left Sidebar - Desktop */}
                    <div className="hidden md:block md:col-span-3 xl:col-span-3 sticky top-0 h-screen overflow-y-auto py-6 border-r border-slate-200/60 dark:border-slate-800/50 no-scrollbar">
                        <div className="flex flex-col gap-2 h-full justify-between pb-4">
                            <div>
                                <div className="px-6 mb-8 w-fit cursor-pointer group flex items-center gap-3" onClick={handleFeedStackClick}>
                                    <img src={lightLogo} alt="FeedStack" className="w-11 h-11 rounded-xl object-cover dark:hidden" />
                                    <img src={darkLogo} alt="FeedStack" className="w-11 h-11 rounded-xl object-cover hidden dark:block" />
                                    <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-slate-900 via-slate-600 to-slate-400 dark:from-white dark:via-zinc-400 dark:to-zinc-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">FeedStack</h1>
                                </div>

                                <nav className="space-y-3 px-4">
                                    <NavItem onClick={handleHomeClick} icon={HomeIcon} label="Home" active={home && !you_post && !viewUser && !editProfile} />
                                    <NavItem onClick={handleYourPostClick} icon={MessageSquare} label="Posts" active={you_post} />
                                    <NavItem onClick={handleEditProfileClick} icon={User} label="Profile" active={editProfile} />
                                    <NavItem onClick={toggleTheme} icon={theme === 'light' ? Moon : Sun} label={theme === 'light' ? "Dark" : "Light"} />

                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-10 w-full bg-gradient-to-r from-slate-900 to-slate-700 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-black font-bold text-lg py-3.5 rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all hidden md:block"
                                    >
                                        Create Post
                                    </button>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-8 w-12 h-12 bg-slate-900 dark:bg-zinc-100 text-white dark:text-black rounded-2xl shadow-lg flex items-center justify-center hover:bg-slate-800 md:hidden mx-auto transition-all"
                                    >
                                        <PlusSquare size={24} />
                                    </button>
                                </nav>
                            </div>

                            <div className="px-4 mt-auto">
                                <NavItem onClick={() => { localStorage.removeItem("token"); setlog(false); }} icon={LogOut} label="Logout" danger />
                            </div>
                        </div>
                    </div>

                    {/* Main Feed Content Column - Centered Width */}
                    <div className="col-span-1 md:col-span-6 lg:col-span-6 xl:col-span-6 md:pl-8 border-r border-slate-200/60 dark:border-slate-800/50 min-h-screen relative bg-slate-50/30 dark:bg-transparent">
                        {/* Mobile Header */}
                        <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center transition-all">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={handleFeedStackClick}>
                                <img src={lightLogo} alt="FeedStack" className="w-9 h-9 rounded-lg object-cover dark:hidden" />
                                <img src={darkLogo} alt="FeedStack" className="w-9 h-9 rounded-lg object-cover hidden dark:block" />
                                <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">FeedStack</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                {currentUser && (
                                    <div className="flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-slate-800 max-w-[150px]" onClick={handleEditProfileClick}>
                                        <img src={currentUser.profile_url || "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg"} alt="profile" className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                        <span className="text-xs font-bold truncate dark:text-zinc-200">{currentUser.name}</span>
                                    </div>
                                )}
                                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    {theme === 'light' ? <Moon size={22} className="text-gray-600" /> : <Sun size={22} className="text-yellow-400" />}
                                </button>
                            </div>
                        </div>

                        {/* Content Switcher */}
                        {editProfile ? (
                            <Profile setrefpost={setrefpost} refpost={refpost} goHome={handleHomeClick} setlog={setlog} />
                        ) : you_post ? (
                            <YourPost you_post={you_post} setyou={setyou} sethome={handleHomeClick} refpost={refpost} />
                        ) : viewUser ? (
                            <Username username={viewUser} sethome={handleHomeClick} refpost={refpost} />
                        ) : (
                            <>
                                {/* Sticky Search Container */}
                                <div className="sticky top-0 z-40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-zinc-800/50">
                                    {/* Search Bar Section */}
                                    <div className="p-4 py-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                        <div className="relative group" ref={searchRef}>
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-slate-500 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                className="block w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500/50 transition-all text-sm shadow-sm"
                                                placeholder="Search users..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onFocus={() => { searchQuery && setShowResults(true); setInputFocused(true); }}
                                                onBlur={() => setTimeout(() => setInputFocused(false), 200)}
                                            />
                                            {showResults && (
                                                <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                                    {isSearching ? (
                                                        <div className="p-6 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                                                            <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                                                            Searching...
                                                        </div>
                                                    ) : searchResults.length > 0 ? (
                                                        <div className="py-2">
                                                            {searchResults.map((user, i) => (
                                                                <div key={user._id || i} onClick={() => { setViewUser(user.name); setShowResults(false); }} className="flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group/item">
                                                                    <div className="relative">
                                                                        <img src={user.profile_url || "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg"} alt={user.name} className="w-11 h-11 rounded-full object-cover mr-4 ring-2 ring-transparent group-hover/item:ring-slate-500/30 transition-all" />
                                                                        <div className="absolute bottom-0 right-4 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-slate-600 dark:group-hover/item:text-zinc-400 transition-colors">{user.name}</div>
                                                                        <div className="text-xs text-slate-500 font-medium">@{user.username || user.name.toLowerCase().replace(/\s/g, '')}</div>
                                                                    </div>
                                                                    <ChevronRight size={16} className="text-slate-300 group-hover/item:text-slate-500 transition-all -translate-x-2 group-hover/item:translate-x-0 opacity-0 group-hover/item:opacity-100" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-8 text-center text-slate-500 text-sm italic">No people found matching "{searchQuery}"</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Feed Content - Maximum Width */}
                                <div className="pb-20 md:pb-0 max-w-4xl mx-auto">
                                    {p1.length > 0 ? (
                                        <div className="py-6 px-4 md:px-4 flex flex-col items-center">
                                            {p1.map((post, index) => (
                                                <div key={post._id || index} className="w-full">
                                                    <Addpost p1={post} onUserClick={(username) => setViewUser(username)} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : !isLoading ? (
                                        <div className="py-24 px-6 text-center bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 m-4">
                                            <div className="inline-block p-6 bg-slate-100 dark:bg-zinc-800/50 rounded-3xl mb-6 text-slate-600 dark:text-zinc-400">
                                                <HomeIcon size={48} strokeWidth={1.5} />
                                            </div>
                                            <h3 className="text-2xl font-black mb-3 tracking-tight text-slate-900 dark:text-slate-100">Welcome to FeedStack</h3>
                                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                                                Your world is quiet right now. Follow some friends or start sharing your own moments!
                                            </p>
                                        </div>
                                    ) : null}

                                    {isLoading && (
                                        <div className="p-8 flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-500"></div>
                                        </div>
                                    )}

                                    {!hasMore && p1.length > 0 && !isLoading && (
                                        <div className="p-8 text-center text-gray-400 text-sm font-medium">
                                            You've reached the end!
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Sidebar - Wider for full name display */}
                    <div className="hidden md:block md:col-span-3 pb-8 sticky top-0 h-screen py-6 px-4">
                        {currentUser && (
                            <div
                                onClick={handleEditProfileClick}
                                className="flex items-center gap-4 p-4 rounded-[2rem] bg-indigo-50/50 dark:bg-zinc-900/40 border border-indigo-100/50 dark:border-slate-800/50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                            >
                                <div className="relative">
                                    <img
                                        src={currentUser.profile_url || "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg"}
                                        alt="profile"
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md group-hover:scale-105 transition-transform"
                                    />
                                    <div className="absolute bottom-1 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-black text-slate-900 dark:text-white text-lg leading-tight break-words">{currentUser.name}</p>
                                    <p className="text-xs text-slate-500 font-medium truncate">@{currentUser.name?.toLowerCase().replace(/\s/g, '') || 'user'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Nav - Glassmorphism */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 z-50 px-2 py-1 flex justify-between items-center pb-safe">
                <button onClick={handleHomeClick} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 flex flex-col items-center gap-1 w-full">
                    <HomeIcon size={24} className={home && !you_post && !viewUser ? "stroke-[2.5px] text-black dark:text-white" : "text-gray-500"} />
                </button>
                <button onClick={handleYourPostClick} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 flex flex-col items-center gap-1 w-full">
                    <MessageSquare size={24} className={you_post ? "stroke-[2.5px] text-black dark:text-white" : "text-gray-500"} />
                </button>
                <button onClick={() => setShowCreateModal(true)} className="p-3 flex flex-col items-center gap-1 w-full">
                    <div className="bg-black dark:bg-white text-white dark:text-black rounded-full p-2.5 shadow-lg">
                        <PlusSquare size={20} />
                    </div>
                </button>
                <button onClick={handleEditProfileClick} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 flex flex-col items-center gap-1 w-full">
                    <User size={24} className={editProfile ? "stroke-[2.5px] text-black dark:text-white" : "text-gray-500"} />
                </button>
                <button onClick={() => { localStorage.removeItem("token"); setlog(false); }} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 flex flex-col items-center gap-1 w-full">
                    <LogOut size={24} className="text-gray-500" />
                </button>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <PostModal
                    close={showCreateModal}
                    setclose={setShowCreateModal}
                    addpost={addpost}
                />
            )}


        </div>
    );
}

// Renamed to avoid confusing with Post component
function PostModal({ close, setclose, addpost }) {
    const ti = useRef(null);
    const des = useRef(null);
    const tag = useRef(null);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setclose(false)}
        >
            <div
                className="bg-white dark:bg-black w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-black dark:text-white">Create Post</h3>
                    <button
                        onClick={() => setclose(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors text-gray-500 hover:text-black dark:hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Title</label>
                        <input
                            ref={ti}
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/20 border border-transparent focus:bg-white dark:focus:bg-black transition-all font-medium"
                            placeholder="Enter post title"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Detail</label>
                        <textarea
                            ref={des}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/20 border border-transparent focus:bg-white dark:focus:bg-black transition-all font-medium resize-none"
                            rows="4"
                            placeholder="What's happening?"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Tags <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input
                            ref={tag}
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/20 border border-transparent focus:bg-white dark:focus:bg-black transition-all font-medium"
                            placeholder="#tag"
                        />
                    </div>

                    <div className="pt-2">
                        <FileUpload des={des} ti={ti} tag={tag} setclose={setclose} addpost={addpost} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;