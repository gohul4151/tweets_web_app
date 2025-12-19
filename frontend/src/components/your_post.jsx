import {useRef,useEffect,useState} from "react";
import Addpost from "./post";
function YourPost({you_post,setyou})
{
    const [pos,setpos]=useState([]);
    useEffect(() => {
                async function getting_post_user() {
                    try {
                        const result = await fetch("http://localhost:3000/get-post-user", {
                            method: "GET",
                            credentials: "include",
                        });
                        const data = await result.json();
                        setpos(data);
                    } catch (error) {
                        console.error("Error fetching posts:", error);
                    }
                }
                getting_post_user();
            }, []);
    return <>
        <div>
            <div>
                <div>profile</div>
                <div>username</div>
                <div>total no of post</div>
                <button onClick={() => setyou(false)}>back</button>
            </div>
            <div>
                <div >
                    {pos.length > 0 ? (
                        pos.map((post, index) => (
                        <Addpost key={index} pos={post} />
                    ))
                ) : (
                    <p>No posts to display</p>
                )}
                </div>
            </div>
        </div>
    </>
}
export default YourPost