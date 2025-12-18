import {useRef} from "react";
function YourPost({you_post,setyou})
{
    const p=useRef(null);
    return <>
        <div>
            <div>
                <div>profile</div>
                <div>username</div>
                <div>total no of post</div>
                <button onClick={() => setyou(false)}>back</button>
            </div>
            <div>
                <div ref={p}>
                    posts's
                </div>
            </div>
        </div>
    </>
}
export default YourPost