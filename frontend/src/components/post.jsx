import {useState} from 'react';
function Addpost({post})
{
    return <>
        <div>
            <div>
                {post.username}
                <img src={p1.profile_url} ></img>
            </div>
            <div>
                {post.title}
            </div>
            <div>
                {post.type=="image" && <img src={post.url} ></img>}
                {post.type=="video" && <video src={post.url} controls width="500" />}
            </div>
            <div>
                {p1.descripction}
            </div>
        </div>
    </>
}
export default Addpost