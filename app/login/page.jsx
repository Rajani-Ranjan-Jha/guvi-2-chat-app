'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { signIn } from "next-auth/react";
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/authSlice'; 

import React, { useState, useEffect } from 'react';
import { EyeClosedIcon, EyeIcon } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [EyeBtn, setEyeBtn] = useState(true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch(); 
    useEffect(() => {

        const checkAuth = async () => {
            const response = await fetch('/api/auth/session');
            const data = await response.json();
            if (data?.user) {
                router.push('/');
            }
        };
        checkAuth();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            console.error(result.error);
            setLoading(false);
        } else {
            dispatch(setAuth({ user: result.user, token: result.token }));
            console.warn('Logged in successfully');
            router.push("/");
            
        }
    };

    return (
        <div className='bg-black w-screen h-screen flex justify-center items-center'>
            <div className='bg-black/80 p-10 w-100 h-4/5 text-sm border rounded-md flex flex-col justify-center items-center'>
                <h2 className='text-4xl text-white mb-4'>Log In</h2>
                <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center gap-4 mt-4  w-full'>
                    <input onChange={(e) => { setEmail(e.target.value) }} type="email" placeholder='Email' className='w-4/5  mx-atuo focus:outline-none focus:ring-red-500 p-2 rounded-md bg-gray-800 text-white' />
                    <div className='w-4/5 relative flex justify-center items-center'>
                        <input onChange={(e) => { setPassword(e.target.value) }} type={`${EyeBtn ? "password" : "text"}`} placeholder='Password' className='w-full  mx-atuo focus:outline-none focus:ring-red-500 p-2 rounded-md bg-gray-800 text-white'

                        />
                        <button type="button" className='absolute right-5 top-1 text-white w-3 h-3'
                        onClick={(e) => {
                            e.preventDefault();
                            setEyeBtn(!EyeBtn);
                        }}
                        >
                            {EyeBtn ? (<EyeClosedIcon/>) : (<EyeIcon />)}
                        </button>
                    </div>
                    <button type="submit" disabled={loading} className='mt-4 bg-blue-600 px-4 py-2 rounded-md text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 transition-colors'>{loading ? 'Loading...' : "Login"}</button>
                </form>
                <p className='text-white mt-4'>Don't have an account? <a href="/register" className='text-blue-500 hover:underline'>Create a new account</a></p>
            </div>
        </div>
    );
};

export default Login;
