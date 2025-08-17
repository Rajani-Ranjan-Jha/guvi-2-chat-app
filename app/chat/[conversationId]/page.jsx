"use client";
import Image from "next/image";
import {
  ArrowLeftIcon,
  LucideVideo,
  MessageSquarePlus,
  MoreVertical,
  Phone,
  Plus,
  SendHorizonal,
  Settings,
  LucideBell,
  LucideBellDot,
  MessagesSquare,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import AddContacts from "@/app/components/AddContacts";
import DefaultTemplate from "@/app/components/DefaultTemplate";
import ShowContacts from "@/app/components/ShowContacts";
import ChatTemplate from "@/app/components/ChatTemplate";
import EnhancedChatTemplate from "@/app/components/EnhancedChatTemplate";
import { useParams, useRouter } from "next/navigation";

export default function Home() {
  const [addbtn, setAddbtn] = useState(false);
  const [isOpen, setisOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  let { conversationId } = useParams();
  const router = useRouter();

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (!conversationId || conversationId == null) {
      console.error("Unable to get the ID in the chat/lorem92992");
      return;
    }
  }, [conversationId]);

  const toggleAddContact = () => {
    setAddbtn(!addbtn);
  };

  const closeAddContact = () => {
    setAddbtn(false);
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    // Navigate to the conversation
    router.push(`/chat/${contact.conversationId}`);
  };

  return (
    <div className="relative w-screen h-screen bg-transparent text-white flex gradient-blue">
      {/* Fixed Sidebar - always visible except auth routes */}
      <aside className="flex fixed left-0 top-0 h-full z-10">
        {/* nav bar */}
        <nav className="min-w-15 py-5 flex flex-col justify-start items-center bg-blue-600">
          <button></button>
          <button>
            <MessagesSquare />
          </button>
        </nav>
        <div className="w-84 h-full border p-4 gap-2 flex flex-col justify-between items-center bg-gray-800">
          {/* search bar, add contact, app name, etc */}
          <div className="w-full h-1/5 flex flex-col justify-center items-center space-y-3">
            <div className="w-full flex justify-between items-center">
              <h1 className="text-3xl">Chat Z</h1>
              <div className="space-x-2">
                <button
                  onClick={toggleAddContact}
                  className="p-2 rounded-full hover:bg-white/50 cursor-pointer"
                >
                  <MessageSquarePlus />
                </button>
                <button className="p-2 rounded-full hover:bg-white/50 cursor-pointer">
                  <MoreVertical />
                </button>
              </div>
            </div>
            <div className="w-full flex justify-between items-center border rounded-lg">
              <input
                className="w-full focus:outline-blue-600 p-2 pl-10"
                type="text"
                placeholder="Search a contact"
              />
            </div>
          </div>

          {/* contact list */}
          <div className="w-full flex-1 overflow-y-auto">
            <ShowContacts onContactSelect={handleContactSelect} />
          </div>

          {/* profile and settings */}
          <div className="w-full h-16 p-2 bg-white/20 rounded-lg flex justify-around items-center gap-2">
            <Image
              className="w-5"
              src={"/vercel.svg"}
              alt="image"
              width="5"
              height="5"
            />
            <h2>{`${user ? user.name : "NOT AVAILABLE!"}`}</h2>
            <button className="w-5">
              <Settings />
            </button>
            <button className="w-5">
              <LucideBell />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - with left margin to account for fixed sidebar */}
      <main id="main" className="flex-1 h-full ml-99">
        {conversationId && conversationId.length > 0 ? (
          <EnhancedChatTemplate 
            conversationIdProp={conversationId} 
            contactData={selectedContact}
            onBack={() => router.back()}
          />
        ) : (
          <DefaultTemplate />
        )}
      </main>

      {addbtn && (
        <div
          className="fixed inset-0 bg-black/25 bg-opacity-10 flex justify-center items-center z-20"
          onClick={closeAddContact}
        >
          <div
            className="min-h-50 w-100 blur-2 p-2 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <AddContacts />
          </div>
        </div>
      )}
    </div>
  );
}
