'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const router = useRouter()

    async function handleSubmit(e) {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Password and confirm password should be same");
            return;
        }
        // Save user data temporarily in localStorage
        const userData = { name, email, password };
        localStorage.setItem('tempUserData', JSON.stringify(userData));
        // Navigate to create page
        router.push('/create');
    }

    return (
        <div className='bg-black w-screen h-screen flex justify-center items-center'>
            <div className='p-10 bg-black/80 w-100 h-4/5 text-sm border rounded-md flex flex-col justify-center items-center'>
                <h2 className='text-4xl text-white mb-4'>Sign Up</h2>
                <div className='flex justify-around items-center w-full my-4'>
                    <div onClick={() => signIn('facebook')} className='w-1/3 text-white flex justify-center items-center gap-2 border p-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer'>
                        <img src="/facebook.svg" alt="Facebook" className='w-5 h-5' />
                        <span>Facebook</span>
                    </div>
                    <div onClick={() => signIn('google')} className='w-1/3 text-white flex justify-center items-center gap-2 border p-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer'>
                        <img src="/google.svg" alt="Google" className='w-5 h-5' />
                        <span>Google</span>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center gap-4 mt-4  w-full'>
                    <input onChange={(e) => { setName(e.target.value) }} value={name} type="text" placeholder='Name' className='w-4/5  mx-atuo focus:outline-none focus:ring-red-500 p-2 rounded-md bg-gray-800 text-white' />
                    <input onChange={(e) => { setEmail(e.target.value) }} value={email} type="email" placeholder='Email' className='w-4/5  mx-atuo focus:outline-none focus:ring-red-500 p-2 rounded-md bg-gray-800 text-white' />
                    <input onChange={(e) => { setPassword(e.target.value) }} value={password} type="password" placeholder='Password' className='w-4/5  mx-atuo focus:outline-none focus:ring-red-500 p-2 rounded-md bg-gray-800 text-white' />
                    <input onChange={(e) => { setConfirmPassword(e.target.value) }} value={confirmPassword} type="password" placeholder='Confirm Password' className='w-4/5  mx-atuo focus:outline-none focus:ring-red-500 p-2 rounded-md bg-gray-800 text-white' />
                    <button type="submit" className='bg-blue-600 p-2 rounded-md text-white hover:bg-blue-700 transition-colors'>Register</button>
                </form>
                <p className='text-white mt-4'>Already have an account? <a href="/login" className='text-blue-500 hover:underline'>Login</a></p>
            </div>
        </div>
    )
}

export default Register
