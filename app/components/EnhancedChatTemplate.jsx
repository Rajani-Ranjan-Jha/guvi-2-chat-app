"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import RealTimeChat from './RealTimeChat';

const EnhancedChatTemplate = ({ conversationIdProp, contactData,active, onBack }) => {
  const [conversationData, setConversationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (!conversationIdProp) {
      return;
    }

    // If we have contactData, use it directly
    if (contactData) {
      // Ensure we have the required fields
      if (!contactData.conversationId && !contactData._id) {
        return;
      }

      const formattedData = {
        id: conversationIdProp,
        isGroup: contactData.isGroup,
        name: contactData.isGroup ? contactData.groupName : contactData.contactUser?.name || contactData.contactUser?.username || 'Chat',
        participantCount: contactData.participantCount || 1,
        participants: contactData.participantCount > 2 ? contactData.participants : [contactData.contactUser?.id || contactData.contactUser?._id],
        lastMessage: contactData.lastMessageContent,
        lastMessageTime: contactData.lastMessageTime
      };
      setConversationData(formattedData);
      return;
    }

    // Fallback: try to fetch conversation data if no contactData provided
    const fetchConversationData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/conversation/${conversationIdProp}`);
        if (response.ok) {
          const data = await response.json();
          setConversationData(data.conversation);
        } else {
          // If API fails, create basic conversation data
          setConversationData({
            id: conversationIdProp,
            name: 'Chat',
            participants: [],
            isGroup: false,
            participantCount: 1
          });
        }
      } catch (error) {
        // Create basic conversation data on error
        setConversationData({
          id: conversationIdProp,
          name: 'Chat',
          participants: [],
          isGroup: false,
          participantCount: 1
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversationData();
  }, [conversationIdProp, contactData]);

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversationData) {
    return (
      <div className="h-full flex-1 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Conversation not found</p>
          <p className="text-sm text-gray-500 mb-4">ID: {conversationIdProp}</p>
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
    <div className='w-full h-full'>
      <RealTimeChat
        conversationId={conversationIdProp}
        conversationData={conversationData}
        activex = {active}
        onBack={onBack}
      />
    </div>
  );
};

export default EnhancedChatTemplate;
