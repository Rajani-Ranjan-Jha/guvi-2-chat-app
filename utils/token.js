// import { JsonWebTokenError, jsonwebtoken } from "jsonwebtoken";
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET
// console.log(JWT_SECRET)
export default function generateToken(user){

    try {
        console.log('user recieved in [generateToken]:',user)
        const payload = {
            _id:user._id,
            username:user.name,
            email:user.email
        }
        const token = jwt.sign(payload,JWT_SECRET)
        // console.log(token)
        return token
    } catch (error) {
        console.error('something went wrong while creating jwt key')
        return null;
    }

}

export function validateToken(token){

    try {   
        const result = jwt.verify(token,JWT_SECRET)
        console.log("token veryfication result:",result)
        return result
        
    } catch (error) {
        console.error('something went wrong while veryfying jwt key:',error)
        return null;
    }

}


