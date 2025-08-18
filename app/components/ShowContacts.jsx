'use client'
import Image from "next/image";
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from "react-redux";



import { setAuth, setActiveUsers } from "@/app/redux/authSlice";
import { useSocket } from './SocketProvider';


const ShowContacts = ({ onContactSelect, searchContact = null }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [allContacts, setAllContacts] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState(new Set());


    const { socket, isConnected } = useSocket();
    const dispatch = useDispatch();

    const handleContactClick = (contact) => {
        // console.warn('Contact clicked:', contact);
        if (onContactSelect) {
            onContactSelect(contact);
        }
    };

    const handleSearchContact = (searchContact) => {
        const term = (searchContact || '').trim().toLowerCase();
        if (term.length > 0) {
            const filteredContacts = allContacts.filter((contact) => {
                const name = contact?.contactUser?.name || '';
                const username = contact?.contactUser?.username || '';
                return (
                    name.toLowerCase().includes(term) ||
                    username.toLowerCase().includes(term)
                );
            });
            setContacts(filteredContacts);
        } else {
            setContacts(allContacts);
        }
    };

    const loadCurrentUser = async () => {
        try {
            const res = await axios.get('/api/auth/session');
            if (res.data?.user) {
                setCurrentUser(res.data.user);
            }
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/user/contact', { withCredentials: true });
            if (res.status === 200) {
                // console.log('Contacts data:', res.data.contacts);
                // Data is already sorted and formatted from the API
                const fetched = res.data.contacts || [];
                setAllContacts(fetched);
                setContacts(fetched);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContacts([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle online status updates
    useEffect(() => {
        if (!socket) return;

        // Handle initial online users list
        const handleOnlineUsersList = (userIds) => {
            console.log("ShowContacts: Received online users list:", userIds);
            const onlineSet = new Set(userIds.map(id => String(id)));
            setOnlineUsers(onlineSet);
            // TODO: adding online users into the redux
            dispatch(setActiveUsers(Array.from(onlineSet)));
        };

        const handleUserOnline = (userId) => {
            // console.log("ShowContacts: User online:", userId);
            setOnlineUsers(prev => new Set([...prev, String(userId)]));
        };

        const handleUserOffline = (userId) => {
            // console.log("ShowContacts: User offline:", userId);
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(String(userId));
                return newSet;
            });
        };

        socket.on('online-users-list', handleOnlineUsersList);
        socket.on('user-online', handleUserOnline);
        socket.on('user-offline', handleUserOffline);

        return () => {
            socket.off('online-users-list', handleOnlineUsersList);
            socket.off('user-online', handleUserOnline);
            socket.off('user-offline', handleUserOffline);
        };
    }, [socket]);

    // Check if a contact is online
    const isContactOnline = (contactId) => {
        return onlineUsers.has(String(contactId));
    };

    useEffect(() => {
        loadCurrentUser();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchContacts();
        }
    }, [currentUser]);

    useEffect(() => {
        handleSearchContact(searchContact);
    }, [searchContact, allContacts]);

    // Format last message time for display
    const formatLastMessageTime = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();
        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (isYesterday) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }

    };

    return (
        <div className="w-full h-full flex flex-col justify-start items-center transition-all duration-300 delay-150">
            {loading ? (
                <p className="text-2xl font-semibold justify-self-center text-center">Loading contacts...</p>
            ) : contacts.length === 0 ? (
                <p className="text-2xl font-semibold justify-self-center text-center">No contacts found.</p>
            ) : (
                <ul className="overflow-auto handle-scroll w-full flex flex-col items-start justify-start gap-2">
                    {contacts.map((contact) => {
                        // const isOnline = isContactOnline(contact.contactUser.id || contact.contactUser._id);
                        const isOnline = contact.contactUser.status === 'online' || isContactOnline(contact.contactUser.id || contact.contactUser._id);
                        return (
                            <li
                                key={contact.conversationId}
                                className="w-full rounded-2xl bg-white/20 hover:bg-white/40 cursor-pointer flex justify-start items-center p-2 transition-all duration-200"
                                onClick={() => handleContactClick(contact)}
                            >
                                <div className="relative">
                                    <Image
                                        className="w-10 p-2 border rounded-full hover:bg-white/50"
                                        src={contact.contactUser.profilePic || "/vercel.svg"}
                                        alt={contact.contactUser.name || "contact image"}
                                        width={40}
                                        height={40}
                                    />
                                    {/* Online status indicator */}
                                    {isOnline && !contact.isGroup && (
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <div className="w-full cursor-pointer flex flex-col justify-center items-start ml-2">
                                    <div className="flex justify-between items-center w-full">
                                        <b className="text-left">{contact.isGroup ? contact.groupName : contact.contactUser.name || contact.contactUser.username || "Unnamed"}</b>
                                        {contact.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                                {contact.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center w-full">
                                        <small className="text-left text-red-300">
                                            {/* TODO: */}
                                            {contact.isGroup ? `${contact.lastMessageSender.username} : ` : ``}
                                            {contact.lastMessageContent}
                                        </small>
                                        <small className="text-right text-red-400 text-xs">
                                            {formatLastMessageTime(contact.lastMessageTime)}
                                        </small>
                                    </div>
                                    {contact.isGroup && (
                                        <small className="text-left text-blue-400 text-xs">
                                            Group • {contact.participantCount} members
                                        </small>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default ShowContacts;
