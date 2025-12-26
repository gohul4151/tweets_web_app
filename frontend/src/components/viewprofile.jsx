import { useState, useRef } from 'react';
import '../modal.css';

function Profile({ showProfileModal, setShowProfileModal,setrefpost }) {
    const [activeModal, setActiveModal] = useState(null); // 'image', 'username', 'password'
    const [newUsername, setNewUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const fileInputRef = useRef(null);
    const [msg,setmsg]=useState(null);
    // Open specific modal
    const openModal = (modalType) => {
        setActiveModal(modalType);
    };
    
    // Close all modals
    const closeAllModals = () => {
        setActiveModal(null);
        setNewUsername('');
        setCurrentPassword('');
        setNewPassword('');
        setShowProfileModal(false);
    };
    
    // Handle file upload
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const data = new FormData();
            data.append("profile", file);
            // Upload logic here
            console.log("Selected file:", file.name);
        }
    };
    
    // Handle profile image update
    const updateProfileImage = async () => {
        if (fileInputRef.current?.files[0]) {
            const file = fileInputRef.current.files[0];
            const data = new FormData();
            data.append("profileurl", file);
            // API call here
            const response=await fetch(`http://localhost:3000/updateprofilepicture`,{
                method:`PUT`,
                body:data
            })
            console.log("Updating profile image...");
            closeAllModals();
            setrefpost(c => c+1);
        }
    };
    
    // Handle username update
    const updateUsername = async () => {
        if (newUsername.trim()) {
            // API call here
            const response=await fetch(`http://localhost:3000/changeusername"`,{
                method:`PUT`,
                body:newUsername
            })
            const data =await response.json();
            if (data.message=="Name too short" || data.message=="user name already exists")
            {
                setmsg(data.message);
            }
            else
            {
                alert(data.message);
            }
            console.log("Updating username to:", newUsername);
            closeAllModals();
            setrefpost(c => c+1);
        }
    };
    
    // Handle password update
    const updatePassword = async () => {
        if (currentPassword && newPassword) {
            // API call here
            const response=await fetch(`http://loaclhost:3000/changepassword"`,{
                method:"PUT",
                body:JSON.stringify({currentPassword,newPassword})
            })
            const data =await response.json();
            if (data.message=="incorrect oldcurrent password")
            {
                setmsg(data.message);
            }
            else
            {
                alert(data.message);
            }
            console.log("Updating password...");
            closeAllModals();
            setrefpost(c => c+1);
        }
    };
    
    // Don't render anything if showProfileModal is false
    if (!showProfileModal) {
        return null;
    }
    

    // Main Profile Modal - always shown when showProfileModal is true
    return (
        <div className="profile-modal-overlay">
            <div className="profile-modal-content">
                {/* Profile Image Update Modal */}
                {activeModal === 'image' && (
                    <>
                        <div className="postclose">
                            <button onClick={() => setActiveModal(null)}>✕</button>
                        </div>
                        
                        <div className="posttitle">
                            <p>Change Profile Picture</p>
                            <div className="upload-button">
                                <input 
                                    type='file' 
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <button onClick={() => fileInputRef.current.click()}>
                                    Choose Image
                                </button>
                                <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
                                    Recommended: Square image, max 5MB
                                </p>
                            </div>
                        </div>
                        
                        <div className="postbuttons">
                            <button onClick={() => setActiveModal(null)}>Cancel</button>
                            <button onClick={updateProfileImage}>Update Picture</button>
                        </div>
                    </>
                )}
                
                {/* Username Update Modal */}
                {activeModal === 'username' && (
                    <>
                        <div className="postclose">
                            <button onClick={() => setActiveModal(null)}>✕</button>
                        </div>
                        
                        <div className="postbody">
                            <p>New Username</p>
                            <input 
                                type="text" 
                                placeholder="Enter new username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                            />
                            <div>{msg}</div>
                            <div className="error-msg-user"></div>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                <div>{msg}</div>
                            </p>
                        </div>
                        
                        <div className="postbuttons">
                            <button onClick={() => setActiveModal(null)}>Cancel</button>
                            <button onClick={updateUsername}>Update Username</button>
                        </div>
                    </>
                )}
                
                {/* Password Update Modal */}
                {activeModal === 'password' && (
                    <>
                        <div className="postclose">
                            <button onClick={() => setActiveModal(null)}>✕</button>
                        </div>
                        
                        <div className="posttag">
                            <p>Current Password</p>
                            <input 
                                type="password" 
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <div>{msg}</div>
                            <div className="error-msg-password"></div>
                        </div>
                        
                        <div className="posttag">
                            <p>New Password</p>
                            <input 
                                type="password" 
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <div className="error-msg-password"></div>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            </p>
                        </div>
                        <div className="postbuttons">
                            <button onClick={() => setActiveModal(null)}>Cancel</button>
                            <button onClick={updatePassword}>Update Password</button>
                        </div>
                    </>
                )}
                
                {/* Main Menu - shown when no activeModal is selected */}
                {!activeModal && (
                    <>
                        <div className="postclose">
                            <button onClick={closeAllModals}>✕</button>
                        </div>
                        
                        <div className="profile-menu">
                            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                                Update Profile
                            </h2>
                            
                            <div className="profile-options">
                                <button 
                                    className="profile-option-btn"
                                    onClick={() => openModal('image')}
                                >
                                    <div className="option-icon">📷</div>
                                    <div className="option-text">
                                        <h3>Change Profile Image</h3>
                                        <p>Upload a new profile picture</p>
                                    </div>
                                    <div className="option-arrow">→</div>
                                </button>
                                
                                <button 
                                    className="profile-option-btn"
                                    onClick={() => openModal('username')}
                                >
                                    <div className="option-icon">👤</div>
                                    <div className="option-text">
                                        <h3>Change Username</h3>
                                        <p>Update your display name</p>
                                    </div>
                                    <div className="option-arrow">→</div>
                                </button>
                                
                                <button 
                                    className="profile-option-btn"
                                    onClick={() => openModal('password')}
                                >
                                    <div className="option-icon">🔒</div>
                                    <div className="option-text">
                                        <h3>Change Password</h3>
                                        <p>Set a new password</p>
                                    </div>
                                    <div className="option-arrow">→</div>
                                </button>
                            </div>
                            
                            <div className="postbuttons">
                                <button onClick={closeAllModals}>Close</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Profile;