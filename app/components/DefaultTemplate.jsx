import React from 'react'
import { MessageSquare, Users, Sparkles } from "lucide-react";

const DefaultTemplate = () => {
  return (
    <div className='w-full h-full flex flex-col justify-center items-center text-white'>
        <div className="text-center max-w-md mx-auto px-6">
            {/* Welcome Icon */}
            <div className="mb-6">
                <MessageSquare className="w-20 h-20 mx-auto text-white/80" />
            </div>
            
            {/* Welcome Text */}
            <h1 className="text-3xl font-bold mb-4">
                Welcome to Chat-Z
            </h1>
            
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
                Select a contact from the sidebar to start chatting, or create a new conversation to connect with friends and family.
            </p>
            
            {/* Features */}
            <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 text-white/80">
                    <Users className="w-5 h-5" />
                    <span>Connect with your contacts</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                    <MessageSquare className="w-5 h-5" />
                    <span>Real-time messaging</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                    <Sparkles className="w-5 h-5" />
                    <span>Modern chat experience</span>
                </div>
            </div>
        </div>
    </div>
  )
}

export default DefaultTemplate
