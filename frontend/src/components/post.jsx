import {useState} from 'react';
function Addpost({p1})
{
    return <>
        <div>
            <div>
                {p1.username}
                <img src={p1.profile_url} ></img>
            </div>
            <div>
                {p1.title}
            </div>
            <div>
                {p1.type=="image" && <img src={d.url} ></img>}
                {p1.type=="video" && <video src={d.url} controls width="500" />
}
            </div>
            <div>
                {p1.descripction}
            </div>
        </div>
    </>
}
export default Addpost