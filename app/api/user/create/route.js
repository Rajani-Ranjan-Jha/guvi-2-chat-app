import Profile from '@/models/profile';
import ConnectToDB from '@/utils/connect';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request) {
    const {user,username,bio} = await request.json()
    if (!user || !username) {
        return NextResponse.json({ error: 'User and UserName are required' }, { status: 400 });
    }
    // console.log('received data:',{ name, username, user, bio})
    try {
        // Connect to the database
        await ConnectToDB();

        const newProfile = new Profile({
            name: user.name,
            username: username,
            email: user.email,
            bio: bio,
        });
    
        // Save the profile to the database
        await newProfile.save();

        return NextResponse.json({ message: 'Profile created successfully'}, { status: 200 });
    } catch (error) {
        console.error('Profile Creation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

