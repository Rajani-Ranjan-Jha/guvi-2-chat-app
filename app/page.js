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

import { useSocket } from "./components/SocketProvider";
import { setAuth, setUserInfo, setActiveUsers } from "./redux/authSlice";

import AddContacts from "./components/AddContacts";
import ShowContacts from "./components/ShowContacts";
import DefaultTemplate from "./components/DefaultTemplate";
import EnhancedChatTemplate from "./components/EnhancedChatTemplate";
import { useRealTimeMessaging } from "./hooks/useRealTimeMessaging";
import UserProfile from "./components/UserProfile";

export default function Home() {
  // for addContact.jsx
  const [addbtn, setAddbtn] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // for profile
  const [OpenProfile, setOpenProfile] = useState(false);



  const [isSidebarOpen, setisSidebarOpen] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setsearchTerm] = useState("");

  // Current user from Redux
  const currentUser = useSelector((state) => state.user.user) || {};
  // console.warn("Current user", currentUser)
  const [Onlineuser, setOnlineUser] = useState([]);

  // TODO: using socket
  const { socket, isConnected, joinConversation, leaveConversation } =
    useSocket();

  const {} = useRealTimeMessaging();

  const dispatch = useDispatch();
  const userX = useSelector((state) => state.user);
  // console.warn("user data", userX)

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const res1 = await axios.get("/api/auth/session");
        const ID = await res1.data?.user?.id
        if(!ID) return
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

  useEffect(() => {
    const setUserStatusOnline = async () => {
      console.warn("setting status online");
      try {
        const res = await axios.post("/api/user/status", {
          status: "online",
        });
        if (res.status != 200) {
          // console.error("something went wrong!")
          return;
        }
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };

    const getUserInfoById = async() => {
      try {
        const res2 = await axios.get(`/api/user/info?id=${user.id}`);
        console.log("INFO:",res2.data)
      }  catch (error) {
        console.error("Error loading current user:", error);
      }
    }
    // getUserInfoById()
  }, [currentUser]);

  const toggleAddContact = (creatingAGroup=false) => {
    setAddbtn(!addbtn);
    setIsCreatingGroup(creatingAGroup)
  };

  const toggleUserProfile = () => {
    setOpenProfile(!OpenProfile)
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

  const handleContactSelect = (contact) => {
    // console.log('Contact selected:', contact);
    // console.log('Contact conversationId:', contact.conversationId);
    // console.log('Contact _id:', contact._id);
    setSelectedChat(contact);
  };

  const handleConversationSelect = (conversation) => {
    conversation.conversationId = conversation._id;
    setSelectedChat(conversation);
    closeAddContact();
    // console.warn("CONVERSATION FORM ADDCONTACT:",conversation)
  };

  const handleBackToContacts = () => {
    setSelectedChat(null);
  };

  // Layout constants for left rail widths (in pixels)
  const NAV_WIDTH = 64; // fixed nav bar width
  const SIDEBAR_WIDTH = 320; // collapsible sidebar width
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
              isSidebarOpen ? "bg-white/50" : "bg-transparent"
            } cursor-pointer hover:bg-white/20`}
            onClick={toggleSidebar}
          >
            <MessagesSquare />
          </button>
          <div className="w-full flex flex-col gap-5 justify-center items-center">
            <button className="w-5">
              <Settings />
            </button>
            <button className="w-5"
            onClick={()=>{toggleUserProfile()}}>
              
              <Image
                className="w-5"
                src={`${
                  currentUser && currentUser.profilePic ? currentUser.profilePic : "/vercel.svg"
                }`}
                alt={`${currentUser && currentUser.name ? currentUser.name : "User"}`}
                width="5"
                height="5"
              />
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
              <h1 className="text-3xl">Chat Z</h1>
              <div className="space-x-2">
                <button
                  onClick={() => {toggleAddContact(false)}}
                  className="p-2 rounded-full hover:bg-white/50 cursor-pointer"
                  data-tooltip-id="page-tooltip"
                  data-tooltip-content="Create new contact"
                >
                  <MessageSquarePlus />
                </button>
                <button
                  onClick={() => {toggleAddContact(true)}}
                  className="p-2 rounded-full hover:bg-white/50 cursor-pointer"
                  data-tooltip-id="page-tooltip"
                  data-tooltip-content="Create new group"
                >
                  <MessageCirclePlusIcon />
                </button>
                <button className="p-2 rounded-full hover:bg-white/50 cursor-pointer">
                  <MoreVertical />
                </button>
              </div>
            </div>
            <div className="w-full flex justify-between items-center border rounded-lg">
              <input
                className="w-full focus:outline-white/50 p-2 pl-10"
                type="text"
                placeholder="Search a contact"
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

          {/* profile and settings */}
          <div className="w-full h-16 p-2 bg-white/20 rounded-lg flex justify-around items-center gap-2">
            <Image
              className="w-5"
              src={"/vercel.svg"}
              alt="image"
              width="5"
              height="5"
            />
            <h2>{`${currentUser && currentUser.name ? currentUser.name : "Loading.."}`}</h2>
            <button className="w-5">
              <Settings />
            </button>
            <button className="w-5">
              <LucideBell />
            </button>
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
            {/* {console.log('Rendering EnhancedChatTemplate with:', selectedChat)} */}
            <EnhancedChatTemplate
              conversationIdProp={
                selectedChat.conversationId ||
                selectedChat._id ||
                selectedChat.id
              }
              contactData={selectedChat}
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
            <AddContacts creatingAGroup={isCreatingGroup} onConversationCreate={handleConversationSelect} />
          </div>
        </div>
      )}

      {/* for user profile */}
      {OpenProfile && (
        <div
          className="fixed inset-0 bg-black/20 flex justify-center items-center z-20"
          onClick={closeUserProfile}
        >
          <UserProfile/>
        </div>
      )}
    </div>
  );
}
