'use client';
import React, { useState, useEffect } from 'react';
import {useDispatch, useSelector } from 'react-redux';
import { setAuth } from "@/app/redux/authSlice";


import Image from 'next/image';

const UserProfile = () => {

    const [profileData, setProfileData] = useState(null);
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [NewName, setNewName] = useState(user.name);
    const [NewAbout, setNewAbout] = useState(user.bio);
    const [NewEmail, setNewEmail] = useState(user.email);

    useEffect(() => {
      if(user) {
        setProfileData(user);
        setNewName(user.name);
        setNewAbout(user.bio);
        setNewEmail(user.email);
      }
    }, [])
    


    const updateProfile = async () => {
        try {
            if(NewName === user.name && NewAbout === user.bio && NewEmail === user.email) {
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
                    bio: NewAbout,
                    email: NewEmail,
                }),
            });
            if (!response.ok) {
                throw new Error(response.statusText);
                }
            const data = await response.json();
            // console.warn("Profile updated successfully:", data);
            dispatch(setAuth(data));
            setProfileData(data);
            setLoading(false);
        }
        catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }


  return (
    <div className='absolute bottom-0 left-0 min-w-96 h-120 blur-1 
    rounded-lg border-2 border-white shadow-lg p-4 flex flex-col gap-4'
    onClick={(e) => e.stopPropagation()}
    >
      <h2 className='text-2xl text-center'>Your Profile</h2>
      <div className='w-full flex flex-col items-center gap-4'>
        <Image
            className='w-24 h-24 rounded-full mx-auto border border-white'
            src={user.profilePic || "/vercel.svg"}
            alt={`${user.name || "User"}'s profile picture`}
            width={96}
            height={96}
        />

        <div className='flex flex-row items-center gap-2'>
            <label htmlFor="name">Name:</label>
            <input className='text-left border border-white focus:outline-none rounded-lg px-3 py-2' placeholder='Enter your name' name='name' type="text" value={NewName} onChange={(e) => {setNewName(e.target.value)}} />
        </div>
        <div className='flex flex-row items-center gap-2'>
            <label htmlFor="about">About:</label>
            <input className='text-left border border-white focus:outline-none rounded-lg px-3 py-2' placeholder='Enter about you' name='about' type="text" value={NewAbout} onChange={(e) => {setNewAbout(e.target.value)}} />
        </div>
        <div className='flex flex-row items-center gap-2'>
            <label htmlFor="email">Email:</label>
            <input className='text-left border border-white focus:outline-none rounded-lg px-3 py-2' placeholder='Enter your email' name='email' type="text" value={NewEmail} onChange={(e) => {setNewEmail(e.target.value)}} />
        </div>

        <button
            className='w-full bg-blue-500 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors'
            onClick={updateProfile}
            disabled={loading}
        >
            {loading ? "Updating..." : "Update Profile"}
        </button>
        {error && <p className='text-red-500'>{error}</p>}
        
        

      </div>
    </div>
  )
}

export default UserProfile
