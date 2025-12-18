import {useRef} from "react";
function YourPost()
{
    const p=useRef(null);
    return <>
        <div>
            <div>
                <div>profile</div>
                <div>username</div>
                <div>total no of post</div>
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