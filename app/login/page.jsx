'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { signIn } from "next-auth/react";
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/authSlice'; // Import setAuth action

import React, { useState, useEffect } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const dispatch = useDispatch(); // Initialize dispatch

    useEffect(() => {
        const getTokenFromCookie = () => {
            const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
            if (match) {
                console.log('Token from cookie:', match[2]);
            } else {
                console.log('No token cookie found(login.jsx)');
            }
        };
        getTokenFromCookie();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            console.error(result.error);
        } else {
            console.warn('Logged in successfully');
            // Dispatch setAuth action with user data
            dispatch(setAuth({ user: result.user, token: result.token }));
            router.push("/");
        }
    };

    return (
        <div className='bg-black w-screen h-screen flex justify-center items-center'>
            <div className='bg-black/80 p-10 w-100 h-4/5 text-sm border rounded-md flex flex-col justify-center items-center'>
                <h2 className='text-4xl text-white mb-4'>Log In</h2>
                <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center gap-4 mt-4  w-full'>
                    <input onChange={(e) => { setEmail(e.target.value) }} type="email" placeholder='Email' className='w-4/5  mx-atuo focus:outline-none focus:ring-red-500 p-2 rounded-md bg-gray-800 text-white' />
                    <input onChange={(e) => { setPassword(e.target.value) }} type="password" placeholder='Password' className='w-4/5  mx-atuo focus:outline-none focus:ring-red-500 p-2 rounded-md bg-gray-800 text-white' />
                    <button type="submit" className='mt-4 bg-blue-600 px-4 py-2 rounded-md text-white hover:bg-blue-700 transition-colors'>Login</button>
                </form>
                <p className='text-white mt-4'>Don't have an account? <a href="/register" className='text-blue-500 hover:underline'>Create a new account</a></p>
            </div>
        </div>
    );
};

export default Login;
