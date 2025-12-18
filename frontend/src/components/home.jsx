import {useState} from "react";
import FileUpload from "./upload_post";
import '../modal.css';
import Profile from "./viewprofile";
function Home({setlog})
{
    const [close,setclose]=useState(false);
    const [p_c,setp_c]=useState(false);
    return <>
    <div>
        <div>
            posts
        </div>
        <div>
            <button onClick={() => setclose(true)}>+</button>
            <button onClick={() => setp_c(true)}>your profile</button>
            <button >your post</button>
            <button onClick={() => setlog(false)}>logout</button>
            {close && <Post close={close} setclose={setclose} />}
            {p_c && <Profile p_c={p_c} setp_c={setp_c}/>}
        </div>
    </div>
    </>
} 
function Post({close,setclose}){
    return <>
        <div className="postmainback">
            <div className="postfront">
                <div className="postclose">
                    <button onClick={() => {setclose(false)}}>X</button>
                </div>
                <div className="posttitle">
                    <p>title</p>
                    <input type="text" placeholder="Enter post title" />
                </div>
                <div className="postbody">
                    <p>description</p>
                    <textarea placeholder="Write your post description here..." rows="4" cols="50" />
                </div>
                <div className="posttag">
                    <p>tag(optional)</p>
                    <input type="text" placeholder="Enter the tag" />
                </div>
                <div className="postbuttons">
                    <FileUpload />
                    <button>Post</button>
                </div>
            </div>
        </div>
    </>
}
export default Home