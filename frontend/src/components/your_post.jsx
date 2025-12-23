import {useRef,useEffect,useState} from "react";
import Addpost from "./post";

function YourPost({you_post, setyou})
{
    const [pos, setpos] = useState([]);
    const [totalPosts, setTotalPosts] = useState(0);
    
    useEffect(() => {
        async function getting_post_user() {
            try {
                const res=await fetch("http://localhost:3000/mytotalpost",{
                    method:"GET",
                    credentials: "include",
                })
                const a=await res.json();
                setTotalPosts(a.body.totalPosts);
                const result = await fetch("http://localhost:3000/getmypost", {
                    method: "GET",
                    credentials: "include",
                });
                const data=await result.json();
                console.log("API Response:", data); // Check actual structure
                if (Array.isArray(data)) {
                    // If data is directly an array
                    setpos(data);
                } else if (data.posts && Array.isArray(data.posts)) {
                    // If data has posts property
                    setpos(data.posts);
                }
                
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        }
        getting_post_user();
    }, []);
    
    const handleDeletePost = (deletedPostId) => {
        setpos(prev => prev.filter(post => post._id !== deletedPostId));
        setTotalPosts(prev => prev - 1);
    };
    
    return (
        <div>
            <div>
                <div>profile</div>
                <div>username</div>
                <div>total no of post: {totalPosts}</div>
                <button onClick={() => setyou(false)}>back</button>
            </div>
            <div>
                <div>
                    {pos.length > 0 ? (
                        pos.map((post) => (
                            <Addpost 
                                key={post._id} 
                                p1={post} 
                                del={true}
                                onDelete={handleDeletePost}
                            />
                        ))
                    ) : (
                        <p>No posts to display</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default YourPost;