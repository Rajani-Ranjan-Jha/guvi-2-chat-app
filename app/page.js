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
  MessageCirclePlusIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Tooltip } from "react-tooltip";


import { setUserInfo } from "./redux/authSlice";

import CreateNewContact from "./components/CreateNewContact";
import ShowContacts from "./components/ShowContacts";
import DefaultTemplate from "./components/DefaultTemplate";
import MainChatTemplate from "./components/MainChatTemplate";
import UserProfile from "./components/UserProfile";

export default function Home() {

  const [addbtn, setAddbtn] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);


  const [OpenProfile, setOpenProfile] = useState(false);

  const [isSidebarOpen, setisSidebarOpen] = useState(true);
  const [ShowDropDown, setShowDropDown] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setsearchTerm] = useState("");


  const currentUser = useSelector((state) => state.user.user) || {};
  // console.warn("Current user", currentUser)

  const [onlineUsers, setOnlineUsers] = useState([]);

  const dispatch = useDispatch();


  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const res1 = await axios.get("/api/auth/session");
        const ID = await res1.data?.user?.id;
        if (!ID) return;
        // console.warn("Fetching with ID",ID)
        const res2 = await axios.get(`/api/user/info?id=${ID}`);
        // console.log("INFO:",res2.data)
        if (res2.data) {
          dispatch(setUserInfo(res2.data));
        }
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };

    loadCurrentUser();
  }, [dispatch]);

  const toggleAddContact = (creatingAGroup = false) => {
    setAddbtn(!addbtn);
    setIsCreatingGroup(creatingAGroup);
  };

  const toggleUserProfile = () => {
    setOpenProfile(!OpenProfile);
  };

  const closeAddContact = () => {
    setAddbtn(false);
  };

  const closeUserProfile = () => {
    setOpenProfile(false);
  };

  const toggleSidebar = () => {
    setisSidebarOpen(!isSidebarOpen);
  };

  const handleContactSelect = (contact, onlineUsers) => {
    setOnlineUsers(onlineUsers);
    setSelectedChat(contact);
  };

  const handleNewConversationCreate = (conversation) => {
    conversation.conversationId = conversation._id;
    setSelectedChat(conversation);
    closeAddContact();
  };

  const handleBackToContacts = () => {
    setSelectedChat(null);
  };

 
  const NAV_WIDTH = 64; 
  const SIDEBAR_WIDTH = 320;
  const leftRailWidth = isSidebarOpen ? NAV_WIDTH + SIDEBAR_WIDTH : NAV_WIDTH;

  return (
    <div className="relative w-screen h-screen bg-transparent text-white flex justify-start items-center gradient-dark-blue">
      <Tooltip id="page-tooltip" />

      {/* Fixed Sidebar - always visible except auth routes */}
      <aside
        className="flex fixed left-0 top-0 h-full"
        style={{ width: `${leftRailWidth}px` }}
      >
        {/* nav bar */}
        <nav
          className="py-10 flex flex-col justify-between items-center border-r"
          style={{ width: `${NAV_WIDTH}px` }}
        >
          <button
            className={`w-full py-4 rounded-lg flex justify-center items-center ${
              isSidebarOpen ? "bg-white/20" : "bg-transparent"
            } cursor-pointer hover:bg-white/40`}
            onClick={toggleSidebar}
          >
            <MessagesSquare />
          </button>
          <div className="w-full flex flex-col gap-5 justify-center items-center">
            <button className="w-5">
              <Settings />
            </button>
            <button
              className="w-10 h-10  cursor-pointer"
              onClick={() => {
                toggleUserProfile();
              }}
            >
              {currentUser && currentUser.profilePic ? (
                <Image
                  className="w-10 h10 rounded-full hover:bg-white/20"
                  src={currentUser.profilePic}
                  alt={`${currentUser.name || currentUser.username}`}
                  width="10"
                  height="10"
                />
              ) : (
                <div className="w-10 h-10 gradient-profile rounded-full flex items-center justify-center text-white font-semibold hover:bg-white/20">
                  {currentUser.name?.charAt(0) ||
                    currentUser.username?.charAt(0) ||
                    "?"}
                </div>
              )}
            </button>
          </div>
        </nav>

        {/* sidebar */}
        <div
          className={`h-full border-r p-4 gap-2 flex flex-col justify-between items-center`}
          style={{
            width: `${SIDEBAR_WIDTH}px`,
            display: isSidebarOpen ? "flex" : "none",
          }}
        >
          {/* search bar, add contact, app name, etc */}
          <div className="w-full h-1/5 flex flex-col justify-center items-center space-y-3">
            <div className="w-full flex justify-between items-center">
              <h1 className="text-3xl text-left font-semibold">
                Chat Z
              </h1>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowDropDown(!ShowDropDown);
                    }}
                    className="p-2 rounded-full hover:bg-white/50 cursor-pointer flex items-center justify-center"
                    data-tooltip-id="page-tooltip"
                    data-tooltip-content="New"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  {ShowDropDown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropDown(false)}
                      />
                      <ul className="absolute top-full -right-0 mt-2 w-48 blur-1 border border-gray-100 rounded-lg shadow-lg z-20 py-2">
                        <li>
                          <button
                            onClick={() => {
                              toggleAddContact(false);
                              setShowDropDown(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-white/50 cursor-pointer flex items-center space-x-2"
                          >
                            <MessageSquarePlus className="w-4 h-4" />
                            <span>New Contact</span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              toggleAddContact(true);
                              setShowDropDown(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-white/50 cursor-pointer flex items-center space-x-2"
                          >
                            <MessageCirclePlusIcon className="w-4 h-4" />
                            <span>New Group</span>
                          </button>
                        </li>
                      </ul>
                    </>
                  )}
                </div>
                <button className="p-2 rounded-full hover:bg-white/50 cursor-pointer">
                  <MoreVertical />
                </button>
              </div>
            </div>
            <div className="w-full flex justify-between items-center border rounded-lg">
              <input
                className="w-full focus:outline-white/50 p-2 pl-10"
                type="text"
                placeholder="Search chat"
                value={searchTerm}
                onChange={(e) => setsearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* contact list */}
          <div className="w-full flex-1 overflow-y-auto">
            <ShowContacts
              onContactSelect={handleContactSelect}
              searchContact={searchTerm}
            />
          </div>

          
        </div>
      </aside>

      {/* Main Content Area - takes remaining width automatically */}
      <main
        id="main"
        className="h-full"
        style={{
          marginLeft: `${leftRailWidth}px`,
          width: `calc(100% - ${leftRailWidth}px)`,
        }}
      >
        {selectedChat ? (
          <>
            <MainChatTemplate
              conversationIdProp={
                selectedChat.conversationId ||
                selectedChat._id ||
                selectedChat.id
              }
              contactData={selectedChat}
              active={onlineUsers}
              onBack={handleBackToContacts}
            />
          </>
        ) : (
          <DefaultTemplate />
        )}
      </main>

      {/* for add contact */}
      {addbtn && (
        <div
          className="fixed inset-0 bg-black/25 bg-opacity-10 flex justify-center items-center z-20"
          onClick={closeAddContact}
        >
          <div
            className="min-h-50 w-100 blur-2 p-2 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <CreateNewContact
              creatingAGroup={isCreatingGroup}
              onConversationCreate={handleNewConversationCreate}
            />
          </div>
        </div>
      )}

      {/* for user profile */}
      {OpenProfile && (
        <div
          className="fixed inset-0 bg-black/20 flex justify-center items-center z-20"
          onClick={closeUserProfile}
        >
          <UserProfile toClose={closeUserProfile} />
        </div>
      )}
    </div>
  );
}
