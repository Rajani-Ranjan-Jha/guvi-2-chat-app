"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from './SocketProvider';
import RealTimeMessageList from './RealTimeMessageList';
import RealTimeMessageInput from './RealTimeMessageInput';
import { Phone, Video, MoreVertical, Search, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const RealTimeChat = ({
  conversationId,
  conversationData,
  activex,
  onBack
}) => {

  const { socket,
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessageAsDelivered,
 } = useSocket();

  const router = useRouter();


  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit
  const [messageToEdit, setMessageToEdit] = useState(null);
  const [haveToEdit, setHaveToEdit] = useState(false);




  const user = useSelector((state) => state.user.user);

  const active = useSelector((state) => state.user.ActiveUsers);
  // console.warn("Active users in RealTimeChat:", active);




  // Join conversation when component mounts
  useEffect(() => {



    if (conversationId && socket) {
      joinConversation(conversationId);
    }



    return () => {
      if (conversationId && socket) {
        leaveConversation(conversationId);
      }


    };
  }, [conversationId, socket, joinConversation, leaveConversation]);

  // Fetch initial messages
  useEffect(() => {
    if (!conversationId) {
      console.log('No conversationId provided to RealTimeChat');
      return;
    }

    setMessageToEdit(null);

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        // const response = await fetch(`/api/conversations/${conversationId}/messages`);
        const response = await fetch(`/api/conversation/messages?id=${conversationId}` );

        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err.message);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);


  //  sending messages
  const handleSendMessage = async (messageData) => {
    if (!conversationId || !user) return;
    try {

      const tempMessage = {
        _id: `temp-${Date.now()}`,
        conversation: conversationId,
        sender: user.id,
        content: messageData.content,
        attachments: messageData.attachments,
        timestamp: messageData.timestamp,
        senderName: user.name || user.username,
        readBy: [],
        metadata: {
          isDelivered: false,
          isRead: false
        }
      };

      // socket provider's function to send message
      sendMessage(conversationId, tempMessage);


      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content: messageData.content,
          messageType: 'text',
          attachments: messageData.attachments
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();


      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempMessage._id ? result.data : msg
        )
      );

      markMessageAsDelivered(conversationId, result.data._id);

    } catch (error) {
      console.error('Error sending message:', error);


      setMessages(prev =>
        prev.filter(msg => msg._id !== tempMessage._id)
      );


      alert('Failed to send message. Please try again!');
    }
  };

  //  editing messages
  const handleEditMessage = async (newContent) => {
    if (!conversationId || !user || !messageToEdit) return;

    const messageId = messageToEdit._id || messageToEdit.id;
    console.warn("Editing message:", messageId, "with content:", newContent);

    try {
      // Optimistically update message in local state
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, content: newContent } : msg
        )
      );

      // Send edit request to API
      const response = await fetch('/api/messages/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit', messageId: messageId, content: newContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit message');
      }

      const result = await response.json();

      // Update the message with the result from the server
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, ...result.data } : msg
        )
      );

      // Reset editing state
      setMessageToEdit(null);
      setHaveToEdit(false);

    } catch (error) {
      console.error('Error editing message:', error);
      // Show error notification
      alert('Failed to edit message. Please try again!');

      // Revert optimistic update
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, content: messageToEdit.content } : msg
        )
      );
    }
  };

  // taking message to edit
  const TakeMessageToEdit = (message) => {
    // console.warn("Taking message to edit:", message);
    setMessageToEdit(message);
    setHaveToEdit(true);
  }

  //  back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {conversationData?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="font-semibold">
                {/* {conversationData.isGroup ? conversationData.groupName : conversationData?.name || 'Chat'} */}
                {conversationData?.name || 'Chat'}
              </h2>
              <p className="text-sm">
                {conversationData?.participants?.length > 1 ? `${conversationData?.participants?.length} members` :
                  `${active.includes(conversationData?.participants[0]) ? 'Online' : 'Offline'}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          {/* <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Video className="w-5 h-5" />
          </button> */}
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto handle-scroll border-orange-500">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-gray-300">Loading messages...</p>
            </div>
          </div>
        ) : (
          <RealTimeMessageList
            conversationId={conversationId}
            initialMessages={messages}
            ProvideMessageToEdit={TakeMessageToEdit}
            isAGroup={conversationData?.isGroup}
          />
        )}
      </div>

      {/* Message Input */}
      <div className="">
        <RealTimeMessageInput
          conversationId={conversationId}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          placeholder="Type a message..."
          disabled={isLoading}
          haveToEdit={haveToEdit}
          initialMessage={haveToEdit && messageToEdit ? messageToEdit.content : ''}
        />
      </div>
    </div>
  );
};

export default RealTimeChat;
