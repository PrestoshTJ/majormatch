import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import stats from './stats'
import { jwtDecode } from "jwt-decode";
import match from '../match'


const token = localStorage.getItem("token");
const decodedToken = token ? jwtDecode(token) : null;
const name = decodedToken ? decodedToken.Username : null;


let oldMessages = []
const getOldMessages = async () => {
  try {
      const response = await fetch(`http://localhost:3003/api/chatrooms/PSUMain`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
          }
      });
      
        
      if (!response.ok) {
          throw new Error("Failed to fetch messages");
      }
      
      const data = await response.json();

      data.forEach(msg => {
        oldMessages.push({type : name == msg.Username ? 'user' : msg.Username, text: msg.Message});
      });

  } catch (error) {
      console.error("Error fetching messages:", error);
  }
      
};

let updatedMessages = false;
await getOldMessages()
function Chat() {
    const [messages, setMessages] = useState(oldMessages);

    const [input, setInput] = useState('');
    const [hasStatsFilled, setHasStatsFilled] = useState(true)
    const [roomType, setRoomType] = useState('small');
    const [userModal, setUserModal] = useState(false);

    const modalRef = useRef(null);

    useEffect(() => {
    function handleClickOutside(event) {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
        setUserModal(false);
        }
    }
    
    if (userModal) {
        document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
    }, [userModal]);
    // console.log(match("cool"))


  if (!token) {
    window.location.href = "/"
  }

  
  if(!updatedMessages){
    setMessages(oldMessages);
    updatedMessages = true;
  }
  
  const postNewMessage = async (e) => {
    const { Username, Message, Time } = e; // Assuming 'e' contains the required data
    try {
      // Send a POST request to the API to add a new message
      const response = await fetch("http://localhost:3003/api/chatrooms/PSUMain", {
        method: "POST", // Corrected method to POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Username, Message, Time }), // Send the data in the body as JSON
      });
  
      // Check if the request was successful
      if (response.ok) {
        const data = await response.json();
        console.log('Message added:', data);
      } else {
        console.error('Failed to add message', await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { type: 'user', text: input }]);
    setInput('');

    const newMessageData = {
      Username: name, // Replace with actual username (e.g., from state)
      Message: input,
      Time: Date.now(),
    };

    try {
      await postNewMessage(newMessageData); // Send the message to the server
    } catch (error) {
      console.error('Error sending message to the server:', error);
    }
  };

  return (
    <div className="chat-wrapper">
        <div className="top-bar">
            <div className="homeButton" onClick={() => window.location.href = "/"}>
            🏠
            </div>

            <div className="userProfile" onClick={() => setUserModal(!userModal)} ref={modalRef}>
                <span className="user-icon">👤</span>
                {userModal && (
                    <div className="modal">
                    <h2>Hello, {token ? name : 'Guest'}</h2>
                    {!token ? (
                        <button className="auth-button" onClick={() => window.location.href = "/authenticate"}>
                        Sign In / Sign Up
                        </button>
                    ) : (
                        <>
                            <p>Welcome back!</p>
                            <button className="edit-button" onClick={() => window.location.href = "/info"}>
                                Edit Info
                            </button>
                            <button onClick = {() => {localStorage.removeItem("token"); window.location.href = "/"}}> Log out </button>
                        </>
                    )}
                    </div>
                )}
            </div>

        </div>

        {/* Existing chat layout below */}
        <div className="chat-layout">
        <div className="chat-sidebar">
        <h2 className="chat-logo">MajorMatch Chat</h2>
        <div className="typeChatrooms">
            <button
                className={`chatroomType ${roomType === 'small' ? 'selected' : ''}`}
                onClick={() => setRoomType('small')}
            >
                Small Rooms
            </button>
            <button
                className={`chatroomType ${roomType === 'big' ? 'selected' : ''}`}
                onClick={() => setRoomType('big')}
            >
                Big Rooms
            </button>
        </div>

        <div className="chat-user">Birdman <div className="subtext">What can I say? I love birds and I’m a man</div></div>
        <div className="chat-user">sharknado <div className="subtext">tornado and shark</div></div>
        <div className="chat-user">lyt1king <div className="subtext">biggest boy you’ll ever see</div></div>
        <div className="chat-user">you <div className="subtext">I want a friend</div></div>
      </div>

        <div className="chat-main">
            <div className="chat-main-inner">
                {hasStatsFilled ? (
                <>
                    <div className="chat-window">
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.type}`}>
                        {msg.text}
                        </div>
                    ))}
                    </div>
                    <div className="formWrapper">
                    <form onSubmit={handleSubmit} className="chat-form">
                        <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="chat-input"
                        />
                        <button type="submit" className="chat-submit">Send</button>
                    </form>
                    </div>
                </>
                ) : (
                <div style={{ margin: 'auto', color: '#666', fontSize: '16px' }}>
                    <p>Please complete your stats to join the chatroom.</p>
                    <button onClick = {() => window.location.href = "/info"}> Fill out info </button>
                </div>
                )}
            </div>
        </div>
        </div>
    </div>
  );
}

export default Chat;
