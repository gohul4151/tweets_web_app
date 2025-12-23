import {useState,useRef,useEffect} from "react";
import FileUpload from "./upload_post";
import '../modal.css';
import Profile from "./viewprofile";
import YourPost from "./your_post";
import Addpost from "./post";

function Home({setlog})
{
    const [posts, setPosts] = useState([]);
    const [close, setclose] = useState(false);
    const [p_c, setp_c] = useState(false);
    const [you_post, setyou] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch posts with pagination
    const fetchPosts = async (page = 1) => {
        setIsLoading(true);
        try {
            const result = await fetch(`http://localhost:3000/getpost?page=${page}`, {
                method: "GET",
                credentials: "include",
            });
            const data = await result.json();
            
            if (page === 1) {
                setPosts(data.posts); // Initial load
            } else {
                setPosts(prev => [...prev, ...data.posts]); // Append for infinite scroll
            }
            
            // If your API returns total pages, set it here
            // setTotalPages(data.totalPages);
            
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]);

    // For pagination buttons
    const handleNextPage = () => {
        setCurrentPage(prev => prev + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    // For infinite scroll (optional)
    const handleScroll = () => {
        if (
            window.innerHeight + document.documentElement.scrollTop === 
            document.documentElement.offsetHeight && 
            !isLoading && 
            currentPage < totalPages
        ) {
            setCurrentPage(prev => prev + 1);
        }
    };

    // Add scroll listener for infinite scroll
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading, currentPage, totalPages]);

    if (you_post) {
        return <YourPost you_post={you_post} setyou={setyou} />
    }

    return <>
        <div>
            <div>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <Addpost key={post._id} p1={post} /> //{/* Fixed: using post._id as key */}
                    ))
                ) : (
                    <p>No posts to display</p>
                )}
                
                {isLoading && <p>Loading more posts...</p>}
                
                {/* Pagination Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
                    <button 
                        onClick={handlePreviousPage} 
                        disabled={currentPage === 1 || isLoading}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage}</span>
                    <button 
                        onClick={handleNextPage}
                        disabled={isLoading}
                    >
                        Next
                    </button>
                </div>
            </div>
            
            <div>
                <button onClick={() => setclose(true)}>+</button>
                <button onClick={() => setp_c(true)}>your profile</button>
                <button onClick={() => setyou(true)}>your post</button>
                <button onClick={() => setlog(false)}>logout</button>
                
                {close && <Post close={close} setclose={setclose} />}
                {p_c && <Profile p_c={p_c} setp_c={setp_c}/>}
            </div>
        </div>
    </>
}

function Post({close,setclose}){
    const ti=useRef(null);
    const des=useRef(null);
    const tag=useRef(null);
    
    return <>
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
                    <input ref={tag} type="text" placeholder="Enter the tag" /> {/* Fixed: ref instead of rel */}
                </div>
                <div className="postbuttons">
                    <FileUpload des={des} ti={ti} tag={tag}/>
                </div>
            </div>
        </div>
    </>
}

export default Home