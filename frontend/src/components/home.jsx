import {useState,useRef,useEffect} from "react";
import FileUpload from "./upload_post";
import '../modal.css';
import Profile from "./viewprofile";
import YourPost from "./your_post";
import Addpost from "./post";

function Home({setlog})
{
    const [p1,setp1]=useState([]);
    const [close,setclose]=useState(false);
    const [you_post,setyou]=useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [refpost,setrefpost]=useState(0);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const fetchPosts = async (page = 1) => {
        setIsLoading(true);
        try {
            const result = await fetch(`http://localhost:3000/getpost?page=${page}`, {
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
    }, [currentPage,refpost]);

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

    if (you_post) {
        return <YourPost you_post={you_post} setyou={setyou} setrefpost={setrefpost}/>
    }
    
    return (
        <div>
            <div>
                {p1.length > 0 ? (
                    p1.map((post, index) => (
                        <Addpost key={post._id || index} p1={post} />
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
                <button onClick={() => setclose(true)}>+</button>
                <button onClick={() => setShowProfileModal(true)}>Edit Profile</button>
                <button onClick={() => setyou(true)}>your post</button>
                <button onClick={() => setlog(false)}>logout</button>
            </div>
            
            {close && <Post close={close} setclose={setclose} addpost={addpost}/>}
            {showProfileModal && <Profile showProfileModal={showProfileModal} setShowProfileModal={setShowProfileModal} setrefpost={setrefpost}/>}
        </div>
    );
}

function Post({close,setclose,addpost}){
    const ti=useRef(null);
    const des=useRef(null);
    const tag=useRef(null);
    return (
        <div className="postmainback">
            <div className="postfront">
                <div className="postclose">
                    <button onClick={() => {setclose(false)}}>X</button>
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
                    <FileUpload des={des} ti={ti} tag={tag} setclose={setclose} addpost={addpost}/>
                </div>
            </div>
        </div>
    );
}

export default Home;