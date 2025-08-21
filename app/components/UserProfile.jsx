'use client';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth } from "@/app/redux/authSlice";


import Image from 'next/image';
import { Edit2Icon, Edit3 } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

const UserProfile = (toClose) => {

    const [profileData, setProfileData] = useState(null);
    const user = useSelector((state) => state.user.user) || {};
    const dispatch = useDispatch();


    const [loading, setLoading] = useState(false);
    const [editable, setEditable] = useState(false);
    const [error, setError] = useState(null);

    const [NewName, setNewName] = useState(user.name || "");
    const [NewUserName, setNewUserName] = useState(user.username || "");
    const [NewAbout, setNewAbout] = useState(user.bio || "");
    const [NewEmail, setNewEmail] = useState(user.email || "");

    useEffect(() => {
        if (user) {
            setProfileData(user);
            setNewName(user.name || "");
            setNewUserName(user.username || "");
            setNewAbout(user.bio || "");
            setNewEmail(user.email || "");
        }
    }, [user])



    const updateProfile = async () => {
        try {
            if (NewName === (user.name || "") && NewUserName === (user.name || "") && NewAbout === (user.bio || "") && NewEmail === (user.email || "")) {
                setError("No changes made to update.");
                return;
            }
            setLoading(true);
            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: profileData._id || profileData.id,
                    name: NewName,
                    username: NewUserName,
                    bio: NewAbout,
                    email: NewEmail,
                }),
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const data = await response.json();
            dispatch(setAuth(data));
            setProfileData(data);
            setLoading(false);
            toClose.toClose();
        }
        catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }


    return (
        <div className='absolute bottom-0 left-0 min-w-96 h-120 blur-1 
    rounded-lg border-2 border-white shadow-lg px-5 py-10 flex flex-col gap-4'
            onClick={(e) => e.stopPropagation()}
        >
            <Tooltip id="user-profile" />

            <h2 className='text-2xl text-center'>Your Profile</h2>
            <div className='w-full flex flex-col items-end justify-center gap-4'>
                {user && user.profilePic ? (
                    <Image
                        className="w-5 justify-self-center mx-auto "
                        src={user.profilePic}
                        alt={`${user.name || user.username}`}
                        width="5"
                        height="5"
                        data-tooltip-id="user-profile"
                        data-tooltip-content={`${user.name || user.username}(You)`}

                    />
                ) : (
                    <div className=" justify-self-center mx-auto w-20 h-20 text-2xl gradient-profile rounded-full flex items-center justify-center text-white font-semibold"
                        data-tooltip-id="user-profile"
                        data-tooltip-content={`${user.name || user.username}(You)`}
                    >
                        {user.name?.charAt(0) ||
                            user.username?.charAt(0) ||
                            "?"}
                    </div>
                )}

                <div className='relative flex flex-row items-center gap-2'>
                    <label htmlFor="name">Name:</label>
                    <input readOnly={!editable} className='text-left border border-white focus:outline-none rounded-lg px-3 py-2' placeholder='Enter your name' name='name' type="text" value={NewName} onChange={(e) => { setNewName(e.target.value) }} />
                    {!editable && (
                        <button
                            className={`absolute right-2 z-100 p-1 rounded-md text-white hover:bg-white/20 text-sm transition-colors`}
                            type='button'
                            onClick={() => setEditable(!editable)}
                        >
                            <Edit2Icon className='w-4 h-4' />
                        </button>
                    )}
                </div>
                <div className='relative flex flex-row items-center gap-2'>
                    <label htmlFor="username">User Name:</label>
                    <input readOnly={!editable} className='text-left border border-white focus:outline-none rounded-lg px-3 py-2' placeholder='Enter your username' name='username' type="text" value={NewUserName} onChange={(e) => { setNewUserName(e.target.value) }} />

                </div>
                <div className='flex flex-row items-center gap-2'>
                    <label htmlFor="about">About:</label>
                    <input readOnly={!editable} className='text-left border border-white focus:outline-none rounded-lg px-3 py-2' placeholder='Enter about you' name='about' type="text" value={NewAbout} onChange={(e) => { setNewAbout(e.target.value) }} />
                </div>
                <div className='flex flex-row items-center gap-2'>
                    <label htmlFor="email">Email:</label>
                    <input readOnly={!editable} className='text-left border border-white focus:outline-none rounded-lg px-3 py-2' placeholder='Enter your email' name='email' type="text" value={NewEmail} onChange={(e) => { setNewEmail(e.target.value) }} />
                </div>

                <div className='flex flex-row items-center justify-between w-full'>
                    {editable && (
                        <>
                            <button
                                className=' bg-white/20 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 hover:bg-white/40 transition-colors'
                                onClick={() => { toClose.toClose() }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className=' bg-blue-500 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors'
                                onClick={updateProfile}
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update"}
                            </button>
                        </>

                    )}



                </div>


                {error && <p className='text-red-500'>{error}</p>}



            </div>
        </div>
    )
}

export default UserProfile
