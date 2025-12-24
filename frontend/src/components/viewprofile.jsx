import {useState} from 'react';
import '../modal.css';
function Profile({p_c,setp_c})
{
    const [url,seturl]=useState();
    async function updateprofileurl()
    {
        const response=await fetch(``,{
            body:url
        })
    }
    async function sentpic(e)
    {
        const file=e.target.files[0];
        const data=new FormData();
        data.append("profile",file);
        const response=await fetch(``,{

        })
        return <>
            <input type='file' id="fileInput" onChange={(e) => sentpic(e)}/>
        </>
    }
    return <>
        <div className="profile-modal-overlay">
            <div className="profile-modal-content">
                <div className="close-button">
                    <button onClick={() => setp_c(false)}>X</button>
                </div>
                <div>
                    <div className="pic">
                    </div>
                    <button onClick={pic}>upload</button>
                    <div className="username">
                        <h3>username</h3>
                    </div>
                </div>
                <div className="get-user">
                    <p>username</p>
                    <input type="text"/>
                    <div className="error-msg-user"></div>
                </div>
                <div className="get-old-password">
                    <p>password</p>
                    <input type="password"/>
                    <div className="error-msg-password"></div>
                </div>
                <div className="get-password">
                    <p>password</p>
                    <input type="password"/>
                    <div className="error-msg-password"></div>
                </div>
                <div className="update-profile">
                    <button onClick={() => setp_c(false)}>update</button>
                </div>
            </div>
        </div>
    </>
}
export default Profile