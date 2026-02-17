import { useState, useRef, useEffect } from 'react';
import { CircleUser, UserPen, LockKeyhole, X, Upload, ChevronRight, Loader2, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';

function Profile({ setrefpost, refpost, goHome, setlog }) {
    const [activeModal, setActiveModal] = useState(null); // 'image', 'username', 'password'
    const [newUsername, setNewUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const fileInputRef = useRef(null);
    const [msg, setmsg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/mytotalpost`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                setUserData(data);
            } catch (error) {
                // silently fail
            }
        }
        fetchUserData();
    }, [refpost]);

    // Open specific view
    const openModal = (modalType) => {
        setActiveModal(modalType);
        setmsg(null);
    };

    // Close all views
    const closeAllModals = () => {
        setActiveModal(null);
        setNewUsername('');
        setCurrentPassword('');
        setNewPassword('');
        setmsg(null);
        setIsLoading(false);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
    };

    // Handle profile image removal
    const removeProfileImage = async () => {
        if (window.confirm("Are you sure you want to remove your profile photo?")) {
            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/removeprofilepicture`, {
                    method: 'POST',
                    credentials: "include"
                });
                const data = await response.json();

                // Update local state immediately with the new default profile URL
                setUserData(prev => ({
                    ...prev,
                    profile_url: data.profile_url
                }));

                // Trigger global refresh
                setrefpost(c => c + 1);

                // Close modal and show success message
                setIsLoading(false);
                setActiveModal(null);
                setmsg(data.message || "Profile photo removed");
            } catch (error) {
                setmsg("Failed to remove profile image");
                setIsLoading(false);
            }
        }
    };


    // Handle profile image update
    const updateProfileImage = async () => {
        if (fileInputRef.current?.files[0]) {
            setIsLoading(true);
            try {
                const file = fileInputRef.current.files[0];
                const formData = new FormData();
                formData.append("profileurl", file);

                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/updateprofilepicture`, {
                    method: 'PUT',
                    credentials: "include",
                    body: formData
                });
                const data = await response.json();

                // Update local state immediately with the new profile URL
                setUserData(prev => ({
                    ...prev,
                    profile_url: data.profile_url
                }));

                // Trigger global refresh
                setrefpost(c => c + 1);

                // Close modal and show success message
                setIsLoading(false);
                setActiveModal(null);
                if (imagePreview) URL.revokeObjectURL(imagePreview);
                setImagePreview(null);
                setmsg(data.message || "Profile picture updated");
            } catch (error) {
                setmsg("Failed to update profile image");
                setIsLoading(false);
            }
        }
    };

    // Handle username update
    const updateUsername = async () => {
        if (newUsername.trim()) {
            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/changeusername`, {
                    method: "PUT",
                    headers: { 'Content-Type': 'application/json' },
                    credentials: "include",
                    body: JSON.stringify({ name: newUsername })
                });
                const data = await response.json();

                if (data.message === "Name too short" || data.message === "user name already exists") {
                    setmsg(data.message);
                    setIsLoading(false);
                } else {
                    setmsg(data.message || "Username updated successfully");
                    setActiveModal(null);
                    setrefpost(c => c + 1);
                }
            } catch (error) {
                setmsg("Failed to update username");
                setIsLoading(false);
            }
        }
    };

    // Handle password update
    const updatePassword = async () => {
        if (currentPassword && newPassword) {
            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/changepassword`, {
                    method: "PUT",
                    headers: { 'Content-Type': 'application/json' },
                    credentials: "include",
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                const data = await response.json();

                if (data.message === "incorrect oldcurrent password") {
                    setmsg(data.message);
                    setIsLoading(false);
                } else {
                    setmsg(data.message || "Password updated successfully");
                    setActiveModal(null);
                    setrefpost(c => c + 1);
                }
            } catch (error) {
                setmsg("Failed to update password");
                setIsLoading(false);
            }
        }
    };

    // Handle account deletion
    const deleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        setDeleteLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/deleteaccount`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                // Account deleted, log the user out
                setlog(false);
            } else {
                setmsg(data.message || 'Failed to delete account');
                setDeleteLoading(false);
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            setmsg('Network error. Please try again.');
            setDeleteLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-white dark:bg-black text-black dark:text-white">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/60 p-4 flex items-center gap-4">
                <button
                    onClick={activeModal ? () => setActiveModal(null) : goHome}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft size={22} />
                </button>
                <h2 className="text-xl font-bold">{activeModal ? 'Edit Details' : 'Settings'}</h2>
            </div>

            <div className="max-w-2xl mx-auto relative px-4 py-6 pb-28">
                {/* Global Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 z-50 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-20">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
                            <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
                            <p className="font-bold text-lg">Updating...</p>
                        </div>
                    </div>
                )}

                {/* Profile Image Update View */}
                {activeModal === 'image' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-6">
                            <h3 className="text-2xl font-black">Change Profile Picture</h3>
                            <p className="text-gray-500">Update your account's public avatar</p>
                        </div>

                        <div className="flex flex-col items-center gap-8 mb-10 py-8 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <div className="w-48 h-48 rounded-full bg-white dark:bg-black flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden relative group">
                                <img
                                    src={imagePreview || userData?.profile_url || "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg"}
                                    className="w-full h-full object-cover"
                                    alt="Current Profile"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <Upload size={32} className="text-white" />
                                </div>
                            </div>

                            <div className="w-full max-w-sm px-6">
                                <input
                                    type='file'
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        setmsg(null);
                                        if (e.target.files[0]) {
                                            setmsg("File: " + e.target.files[0].name);
                                            // Create preview URL
                                            if (imagePreview) URL.revokeObjectURL(imagePreview);
                                            setImagePreview(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full py-4 bg-white dark:bg-black text-black dark:text-white rounded-2xl font-bold border border-gray-200 dark:border-gray-800 hover:border-blue-500 transition-all shadow-sm"
                                >
                                    Choose New Image
                                </button>
                                {msg && <p className="text-center mt-3 text-sm font-medium text-blue-500">{msg}</p>}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 max-w-md mx-auto footer-spacing">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={updateProfileImage}
                                    className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                            {userData?.profile_url && userData.profile_url !== "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg" && (
                                <button
                                    onClick={removeProfileImage}
                                    className="w-full py-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl font-bold border border-red-100 dark:border-red-900/20 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Remove Current Photo
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Username Update View */}
                {activeModal === 'username' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black">Change Username</h3>
                            <p className="text-gray-500">How you appear to others on FeedStack</p>
                        </div>

                        <div className="space-y-6 mb-10 max-w-md">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">New Display Name</label>
                                <input
                                    type="text"
                                    placeholder="Choose a new unique username"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg"
                                />
                            </div>
                            {msg && <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-500 text-sm font-bold rounded-xl border border-red-100 dark:border-red-900/20">{msg}</div>}
                        </div>

                        <div className="flex gap-4 max-w-md">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="flex-1 py-4 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateUsername}
                                className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {/* Password Update View */}
                {activeModal === 'password' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black">Account Security</h3>
                            <p className="text-gray-500">Secure your account with a strong password</p>
                        </div>

                        <div className="space-y-6 mb-10 max-w-md">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Current Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">New Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg"
                                />
                            </div>
                            {msg && <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-500 text-sm font-bold rounded-xl border border-red-100 dark:border-red-900/20">{msg}</div>}
                        </div>

                        <div className="flex gap-4 max-w-md">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="flex-1 py-4 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updatePassword}
                                className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                )}

                {/* Delete Account Confirmation View */}
                {activeModal === 'deleteaccount' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-red-500">Delete Account</h3>
                            <p className="text-gray-500">This action is permanent and cannot be undone</p>
                        </div>

                        <div className="mb-8 p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl mt-1">
                                    <AlertTriangle size={24} className="text-red-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-600 dark:text-red-400 text-lg mb-2">Warning: Permanent Deletion</h4>
                                    <p className="text-red-600/80 dark:text-red-400/80 text-sm leading-relaxed">
                                        Deleting your account will permanently remove:
                                    </p>
                                    <ul className="mt-3 space-y-2 text-sm text-red-600/80 dark:text-red-400/80">
                                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span> All your posts and media</li>
                                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span> All your comments and replies</li>
                                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span> Your profile and all account data</li>
                                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span> All your likes and dislikes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 max-w-md mb-8">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                Type <span className="text-red-500 font-black">DELETE</span> to confirm
                            </label>
                            <input
                                type="text"
                                placeholder="Type DELETE here"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono text-lg tracking-widest"
                            />
                            {msg && <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-500 text-sm font-bold rounded-xl border border-red-100 dark:border-red-900/20">{msg}</div>}
                        </div>

                        <div className="flex gap-4 max-w-md">
                            <button
                                onClick={() => { setActiveModal(null); setDeleteConfirmText(''); setmsg(null); }}
                                className="flex-1 py-4 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500 flex items-center justify-center gap-2"
                            >
                                {deleteLoading ? (
                                    <><Loader2 className="animate-spin" size={20} /> Deleting...</>
                                ) : (
                                    <><Trash2 size={18} /> Delete Forever</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Menu - shown when no activeModal is selected */}
                {!activeModal && (
                    <div className="animate-in fade-in duration-500">
                        {/* User Preview Card */}
                        <div className="mb-12 p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/5 dark:from-blue-500/20 dark:to-gray-900/40 border border-blue-100/30 dark:border-gray-800/50 shadow-sm flex flex-col items-center text-center">
                            <div className="relative group mb-6">
                                <img
                                    src={userData?.profile_url || "https://res.cloudinary.com/dbqdx1m4t/image/upload/v1771181818/profile_pics/nwirmfxg3fi59tqnxyyj.jpg"}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-2xl transition-transform group-hover:scale-105"
                                />
                                <button
                                    onClick={() => openModal('image')}
                                    className="absolute bottom-1 right-1 p-2.5 bg-blue-500 text-white rounded-full shadow-xl hover:bg-blue-600 transition-all transform hover:scale-110 active:scale-95 border-4 border-white dark:border-gray-800"
                                >
                                    <UserPen size={18} />
                                </button>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                {userData?.name || "Loading..."}
                            </h2>
                            <p className="text-blue-500 font-bold px-4 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full text-sm">
                                @{userData?.name?.toLowerCase().replace(/\s/g, '') || "feedstack_user"}
                            </p>
                        </div>

                        <div className="mb-8 ml-2">
                            <h3 className="text-2xl font-black mb-2 tracking-tight">Account Settings</h3>
                            <p className="text-gray-500 text-lg">Update your profile information and security.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-all group text-left"
                                onClick={() => openModal('image')}
                            >
                                <div className="p-4 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-colors shadow-sm">
                                    <CircleUser size={28} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl">Profile Picture</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Change your public avatar</p>
                                </div>
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 group-hover:translate-x-1 transition-all">
                                    <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500" />
                                </div>
                            </button>

                            <button
                                className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-all group text-left"
                                onClick={() => openModal('username')}
                            >
                                <div className="p-4 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-colors shadow-sm">
                                    <UserPen size={28} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl">Display Name</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Change how others see you</p>
                                </div>
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 group-hover:translate-x-1 transition-all">
                                    <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500" />
                                </div>
                            </button>

                            <button
                                className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-all group text-left"
                                onClick={() => openModal('password')}
                            >
                                <div className="p-4 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-colors shadow-sm">
                                    <LockKeyhole size={28} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl">Account Security</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Update your account password</p>
                                </div>
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-black border border-gray-100 dark:border-gray-800 group-hover:translate-x-1 transition-all">
                                    <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500" />
                                </div>
                            </button>
                        </div>

                        {/* Danger Zone */}
                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                            <div className="mb-4 ml-2">
                                <h3 className="text-lg font-bold text-red-500 tracking-tight">Danger Zone</h3>
                                <p className="text-gray-500 text-sm">Irreversible actions for your account</p>
                            </div>
                            <button
                                className="flex items-center gap-6 p-6 rounded-3xl bg-red-50/50 dark:bg-red-950/10 hover:bg-red-100 dark:hover:bg-red-950/20 border border-red-200/50 dark:border-red-900/20 transition-all group text-left w-full"
                                onClick={() => openModal('deleteaccount')}
                            >
                                <div className="p-4 bg-white dark:bg-black rounded-2xl border border-red-200 dark:border-red-900/30 group-hover:border-red-500 transition-colors shadow-sm">
                                    <Trash2 size={28} className="text-red-400 group-hover:text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl text-red-600 dark:text-red-400">Delete Account</h3>
                                    <p className="text-red-400/70 dark:text-red-500/50">Permanently delete your account and all data</p>
                                </div>
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-black border border-red-100 dark:border-red-900/30 group-hover:translate-x-1 transition-all">
                                    <ChevronRight size={20} className="text-red-300 group-hover:text-red-500" />
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;