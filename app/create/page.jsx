'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { signIn } from 'next-auth/react';


const CreateProfile = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [userData, setUserData] = useState(null);
    const router = useRouter()

    useEffect(() => {
        // Retrieve user data from localStorage
        const tempUserData = localStorage.getItem('tempUserData');
        if (tempUserData) {
            const parsedData = JSON.parse(tempUserData);
            console.log(parsedData)
            setUserData(parsedData);
            // setName(parsedData.name);
        } else {
            console.warn('didnot found any user data from the register page.')
        }
    }, [router]);


    const handleSubmit = async (e) => {
        e.preventDefault();


        try {
            // 1) Register user via NextAuth credentials with register flag
            const registerResult = await signIn('credentials', {
                redirect: false,
                register: 'true',
                name: userData?.name,
                email: userData?.email,
                username: username,
                password: userData?.password,
            });

            if (registerResult?.error) {
                throw new Error(registerResult.error);
            }

            // 2) Create profile document via profile API
            const profilePayload = {
                user: { name: userData?.name, email: userData?.email },
                username: username,
                bio: bio,
            };
            await axios.post('/api/user/create', profilePayload);

            // 3) After successful registration, route to home
            router.push('/');

        } catch (error) {
            if (error.response) {
                console.log(`${error.response.data.error || 'Account Creation failed'}`);
            } else if (error.request) {
                console.log('No response from server');
            } else {
                console.log(`${error.message}`);
            }
            console.error(error);
        }
    }

    return (
        <div className='bg-black w-screen h-screen flex justify-center items-center'>
            <div className='bg-black/80 p-10 w-100 h-4/5 text-sm border rounded-md flex flex-col justify-center items-center'>
                <h2 className='text-4xl text-white mb-4'>Create Profile</h2>
                <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center gap-4 mt-4  w-full'>
                    {/* <div className='text-left w-full flex flex-col justify-center items-center'>
                        <label htmlFor="name">Name:</label>
                        <input onChange={(e) => { setName(e.target.value) }} value={name} type="text" name='name' placeholder='name' className='w-4/5  mx-atuo focus:outline-none focus:ring-red-500 p-2 rounded-md bg-gray-800 text-white' />
                    </div> */}
                    <div className='text-left w-full flex flex-col justify-center items-center'>
                        <label htmlFor="username">Username:</label>
                        <input onChange={(e) => { setUsername(e.target.value) }} value={username} type="text" name='username' placeholder='Username' className='w-4/5  mx-atuo focus:outline-none focus:ring-red-500 p-2 rounded-md bg-gray-800 text-white' />
                    </div>
                    <div className='text-left w-full flex flex-col justify-center items-center'>
                        <label htmlFor="bio">Bio:</label>
                        <textarea onChange={(e) => { setBio(e.target.value) }}
                            className='w-4/5  mx-atuo focus:outline-none focus:ring-red-500 p-2 rounded-md bg-gray-800 text-white'
                            name="bio" id="bio" rows="2" placeholder='Enter something about you.'></textarea>
                    </div>
                    <button type="submit" className='mt-4 bg-blue-600 px-4 py-2 rounded-md text-white hover:bg-blue-700 transition-colors'>Create Profile</button>
                </form>
            </div>
        </div>
    )
}

export default CreateProfile
