"use client"
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
  CircleArrowRight,
  MessageCircleMoreIcon
} from "lucide-react";
import { Tooltip } from 'react-tooltip'
import { useRouter } from 'next/navigation'
import EnhancedChatTemplate from './EnhancedChatTemplate';


const AddContacts = ({onConversationCreate}) => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('')
  const [conversation, setconversation] = useState(null)
  const [receivedData, setReceivedData] = useState([])
  const [filteredData, setFilteredData] = useState([])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchInput(value)
    if (value && value.length > 0) {
      const filtered = receivedData.filter((data) =>
        data.username.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredData(filtered)
    } else {
      setFilteredData([])
    }
  }

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get('/api/user/search')
      if (res.status === 200) {
        setReceivedData(res.data)
      }
    } catch (error) {
      console.warn(error)
    }
  }

  const handleSendMessage = async (user) => {
    try {
      // Create or get existing conversation with this user
      const conversationRes = await axios.post('/api/conversation/create', {
        //here user._id is the id of the user from the Profile collection
        participants: [user._id],
        type: 'direct'
      });

      if (conversationRes.data) {
        setconversation(conversationRes.data.conversation)

        console.warn(conversation.message)
        if(onConversationCreate){
          onConversationCreate(conversation)
        }
        
        // router.push(`/chat/${conversationRes.data._id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  }
  const handleSendMessage23 = async (user) => {
    return <EnhancedChatTemplate isFirstConversation={true} Reciever={user}/>

    // router.push(`/chat/tempchat`);
  }

  useEffect(() => {
    fetchAllUsers()
  }, [])

  return (
    <div className='w-full h-full rounded-lg flex flex-col justify-center items-center gap-2 p-2'>
      <Tooltip id="request-it" />
      <input
        className='w-full border rounded-lg p-2 focus:outline-none'
        value={searchInput}
        type="text"
        placeholder='Enter the username'
        onChange={handleSearch}
      />

      <ul className='w-full p-2 rounded-lg overflow-auto handle-scroll'>
        {filteredData.length > 0 ? (
          filteredData.map((user, index) => (
            <li
              className='w-full flex justify-between items-center px-2 py-2 hover:bg-white/50 cursor-pointer rounded-lg'
              key={index}
              onClick={() => handleSendMessage(user)}
            >
              <span>{user.username}</span>
              <button
                className='cursor-pointer'
                data-tooltip-id="request-it"
                data-tooltip-content="Send Message"
              >
                <MessageCircleMoreIcon />
              </button>
            </li>
          ))
        ) : (
          searchInput.length > 0 && (
            <p className='text-center text-gray-500'>No user found with this name</p>
          )
        )}
      </ul>
    </div>
  )
}

export default AddContacts
