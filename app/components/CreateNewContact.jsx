"use client"
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
  MessageCircleMoreIcon
} from "lucide-react";
import { Tooltip } from 'react-tooltip'


const CreateNewContact = ({ creatingAGroup = false, onConversationCreate }) => {
  const [searchInput, setSearchInput] = useState('')
  const [conversation, setconversation] = useState(null)
  const [receivedData, setReceivedData] = useState([])
  const [filteredData, setFilteredData] = useState([])

  // for a group creation
  const [SelectedContactsForGroup, setSelectedContactsForGroup] = useState([])
  const [GroupName, setGroupName] = useState('')
  const [GroupDesc, setGroupDesc] = useState('')

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

  const handleCreateChat = async (user) => {
    try {

      const conversationRes = await axios.post('/api/conversation/create', {
        participants: [user._id],
        type: 'direct'
      });

      if (conversationRes.data) {
        setconversation(conversationRes.data.conversation)

        // console.warn(conversation.message)
        if (onConversationCreate) {
          onConversationCreate(conversationRes.data.conversation)

        }

      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  }

  const handleCreateGroup = async () => {

    if (SelectedContactsForGroup.length === 0 || GroupName.trim() === '') {
      console.warn("No contacts selected for group creation")
      return;
    }
    try {
      const conversationRes = await axios.post('/api/conversation/create', {
        participants: SelectedContactsForGroup.map(contact => contact._id),
        type: 'group',
        groupName: GroupName,
        groupDescription: GroupDesc,
        groupAvatar: '',
      });

      if (conversationRes.data) {
        setconversation(conversationRes.data.conversation);
        if (onConversationCreate) {
          onConversationCreate(conversationRes.data.conversation)
        }
      }
    } catch (error) {
      console.error('Error while creating group conversation:', error);
    }
  }

  useEffect(() => {
    fetchAllUsers()
  }, [])



  return (
    <div className='w-full h-full rounded-lg flex flex-col justify-center items-center gap-2 p-2'>
      <Tooltip id="request-it" />

      <h3 className='text-2xl mb-2'>Creating a {creatingAGroup ? "Group" : "Contact"}</h3>
      {creatingAGroup && (
        <div className='w-full flex flex-col gap-2 mb-2'>
          <div className='w-full flex flex-col items-start'>
            <label htmlFor="g-name">Group Name</label>
            <input
              required
              className='w-full border rounded-lg p-2 focus:outline-none'
              name='g-name'
              value={GroupName}
              type="text"
              placeholder='Enter the group name'
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className='w-full flex flex-col items-start'>
            <label htmlFor="g-description">Group Description</label>
            <textarea
              className='w-full border rounded-lg p-2 focus:outline-none'
              name='g-description'
              value={GroupDesc}
              type="text"
              placeholder='Enter the group description'
              onChange={(e) => setGroupDesc(e.target.value)}
              rows='2'
            />
          </div>
        </div>

      )}

      <label htmlFor="search">Add {creatingAGroup ? "Members" : "Contact"}</label>
      <input
        className='w-full border rounded-lg p-2 focus:outline-none'
        name='search'
        value={searchInput}
        type="text"
        placeholder='Enter the username'
        onChange={handleSearch}
      />

      <ul className='w-full min-h-36 p-2 rounded-lg overflow-auto handle-scroll'>
        {filteredData.length > 0 ? (
          filteredData.map((user, index) => (
            creatingAGroup ? (
              <li
                className='w-full flex justify-between items-center px-2 py-2 hover:bg-white/50 cursor-pointer rounded-lg'
                key={user._id || user.id || index}
                onClick={() => {

                  setSelectedContactsForGroup(prev => {
                    const isSelected = prev.some(contact => contact._id === user._id);
                    if (isSelected) {
                      return prev.filter(contact => contact._id !== user._id);
                    } else {
                      return [...prev, user];
                    }
                  });
                }}
              >
                <span>{user.username}</span>
                <input
                  type="checkbox"
                  checked={SelectedContactsForGroup.some(contact => contact._id === user._id)}
                  onChange={() => { }}
                  className="cursor-pointer"
                />
              </li>
            ) : (
              <li
                className='w-full flex justify-between items-center px-2 py-2 hover:bg-white/50 cursor-pointer rounded-lg'
                key={user._id || user.id || index}
                onClick={() => handleCreateChat(user)}
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
            )
          ))
        ) : (
          searchInput.length > 0 && (
            <p className='text-center text-red-500'>No user found with this name</p>
          )
        )}
      </ul>

      {creatingAGroup && (
        <button
          className='w-full bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed text-white p-2 rounded-lg hover:bg-blue-600 transition-colors'
          onClick={handleCreateGroup}
          disabled={SelectedContactsForGroup.length === 0}
        >
          Create Group
        </button>
      )}
    </div>
  )
}

export default CreateNewContact
