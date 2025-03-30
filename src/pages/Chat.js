import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import stats from './stats';
import { jwtDecode } from "jwt-decode";
import match from '../match';

let chatrooms = [
    { name: "PSUMain", type: "big", subtext: "" },
    { name: "sharknado", type: "big", subtext: "tornado and shark" },
    { name: "lyt1king", type: "small", subtext: "biggest boy you'll ever see" },
    { name: "you", type: "small", subtext: "I want a friend" }
];
function Chat() {
    // Move oldMessages inside the component
    const [messages, setMessages] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [input, setInput] = useState('');
    const [hasStatsFilled, setHasStatsFilled] = useState(true);
    const [roomType, setRoomType] = useState('small');
    const [userModal, setUserModal] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [curRoom, setCurRoom] = useState("PSUMain");
    const [bigHide, setBigHide] = useState("Hidden")
    const [smallHide, setSmallHide] = useState("")
    // console.log(match("Okay Gemini, I want you to analyze a list of users and their traits. You will consider their college, major, and hobbies, in descending order of importance in your weighting in an attempt to match them with compatible users in an attempt to promote connections and lifelong friends! If you deem them to be over 75% compatible, group them together in an array of arrays and if not, keep them by themselves in the array. Example: [['User1', 'User3'], ['User2']]. Do not respond with any text other than in the form of the example text I provided so we can algorithmically parse through your resultant data." + JSON.stringify(testUsers)))
    
    
  let firstCall = true;
  const getUser = async () => {
    try {
      console.log(`Attempting to fetch user with username: ${name}`);

      
      const url = `http://localhost:3003/api/Passwords?username=${name}`;
      console.log(`Fetching from URL: ${url}`);
      
      const response = await fetch(url);
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server responded with status ${response.status}: ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
      }
      
      const userData = await response.json();
      console.log("User data received:", userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      console.error("Error details:", error.message);
      return null;
    }
  }

    const addChatroom = (chatroom) => {
        chatrooms.push(chatroom);
    }
    
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;
    const name = decodedToken ? decodedToken.Username : null;
    
    const modalRef = useRef(null);
    const messagePollingRef = useRef(null);
    const lastMessageTimeRef = useRef(0);
    const chatContainerRef = useRef(null);

    // Initial messages fetch - only run once when component mounts
    useEffect(() => {
        const makeRooms = async () => {
            chatrooms = [];
            const user = await getUser(name);
            if (user.College == "Penn State"){
                addChatroom({name: "PSUMain", type: "big", subtext: ""})
            } else {
                addChatroom({name: `${user.College}Main`})
            }
            if(user.Major){
                addChatroom({name: `${user.Major}`, type: "big", subtext: ""})
            }
            
        }
        console.log(chatrooms);
        const getOldMessages = async () => {
            if (isInitialized) return;
            
            try {
                const response = await fetch(`http://localhost:3003/api/chatrooms/${curRoom}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch messages");
                }

                const data = await response.json();
                const formattedMessages = data.map(msg => ({
                    type: name === msg.Username ? 'user' : msg.Username,
                    text: msg.Message,
                    timestamp: msg.Time,
                    id: `${msg.Username}-${msg.Time}` // Create a unique ID for each message
                }));

                setMessages(formattedMessages);
                
                // Update last message timestamp reference
                if (formattedMessages.length > 0) {
                    lastMessageTimeRef.current = formattedMessages[formattedMessages.length - 1].timestamp;
                }
                
                setIsInitialized(true);
            } catch (error) {
                console.error("Error fetching messages:", error);
                setIsInitialized(true); // Still mark as initialized to prevent infinite retries
            }
            
        };
        makeRooms();
        if (!isInitialized && token) {
            getOldMessages();
        }
    }, [isInitialized, name, token]);

    // Function to fetch new messages
    const fetchNewMessages = async () => {
        if (!token) return;
        
        try {
            const response = await fetch(`http://localhost:3003/api/chatrooms/${curRoom}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch new messages");
            }

            const newMsgsData = await response.json();

            if (newMsgsData && newMsgsData.length > 0) {
                // Filter out messages that we already have
                const filteredNewMsgs = newMsgsData.filter(msg => msg.Time > lastMessageTimeRef.current);

                if (filteredNewMsgs.length > 0) {
                    // Format the new messages
                    const formattedNewMsgs = filteredNewMsgs.map(msg => ({
                        type: name === msg.Username ? 'user' : msg.Username,
                        text: msg.Message,
                        timestamp: msg.Time,
                        id: `${msg.Username}-${msg.Time}` // Create a unique ID for each message
                    }));

                    // Update the last message timestamp
                    const newLastMessageTime = formattedNewMsgs[formattedNewMsgs.length - 1].timestamp;
                    lastMessageTimeRef.current = newLastMessageTime;

                    // Update the messages state with only the new messages
                    setMessages(prevMessages => [...prevMessages, ...formattedNewMsgs]);
                }
            }
        } catch (error) {
            console.error("Error fetching new messages:", error);
        }
    };

    // Setup the message polling
    useEffect(() => {
        if (!token) return;
        
        // Start polling for new messages
        const startMessagePolling = () => {
            setIsConnected(true);
            // Poll for new messages every 3 seconds
            messagePollingRef.current = setInterval(fetchNewMessages, 3000);
        };

        // Stop polling when component unmounts
        const stopMessagePolling = () => {
            setIsConnected(false);
            if (messagePollingRef.current) {
                clearInterval(messagePollingRef.current);
            }
        };

        startMessagePolling();

        // Clean up function to clear the interval when component unmounts
        return () => {
            stopMessagePolling();
        };
    }, [token]); // Only re-run if token changes

    // Background shapes effect
    useEffect(() => {
        const shapes = [];
        const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];
        const container = document.querySelector('.background-shapes');
        
        if (container) container.innerHTML = '';
    
        for (let i = 0; i < 6; i++) {
            const shape = document.createElement('div');
            shape.className = 'shape';
            Object.assign(shape.style, {
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                width: `${Math.random() * 150 + 80}px`,
                height: `${Math.random() * 150 + 80}px`,
                background: `radial-gradient(circle at center, ${colors[i % colors.length]}, transparent 70%)`,
                animationDelay: `${i * 1.5}s`
            });
            container.appendChild(shape);
        }
    }, []);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            const { scrollHeight, clientHeight } = chatContainerRef.current;
            chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
        }
    }, [messages]);

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

    // Redirect if not logged in
    useEffect(() => {
        if (!token) {
            window.location.href = "/";
        }
    }, [token]);

    const postNewMessage = async (messageData) => {
        const { Username, Message, Time } = messageData;
        try {
            const response = await fetch(`http://localhost:3003/api/chatrooms/${curRoom}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Username, Message, Time }),
            });
        
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

        const currentTime = Date.now();
        
        // Add message to UI immediately
        const newMessage = { 
            type: 'user', 
            text: input,
            timestamp: currentTime,
            id: `${name}-${currentTime}`
        };
        
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setInput('');
        
        // Update last message timestamp
        lastMessageTimeRef.current = currentTime;

        const newMessageData = {
            Username: name,
            Message: input,
            Time: currentTime,
        };

        try {
            await postNewMessage(newMessageData);
        } catch (error) {
            console.error('Error sending message to the server:', error);
        }
    };

    return (
        <div className="chat-wrapper">
            <div className="background-shapes"></div>
            <div className="background-shapes"></div>
            <div className="background-shapes"></div>

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
                                    <button onClick={() => {localStorage.removeItem("token"); window.location.href = "/"}}>
                                        Log out
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="chat-layout">
                <div className="chat-sidebar">
                    <h2 className="chat-logo">MajorMatch Chat</h2>
                    <div className="typeChatrooms">
                        <button
                            className={`chatroomType ${roomType === 'small' ? 'selected' : ''}`}
                            onClick={() => {setRoomType('small'); setBigHide("Hidden"); setSmallHide("")}}
                        >
                            Small Rooms
                        </button>
                        <button
                            className={`chatroomType ${roomType === 'big' ? 'selected' : ''}`}
                            onClick={() => {setRoomType('big'); setBigHide(""); setSmallHide("Hidden")}}
                        >
                            Big Rooms
                        </button>
                    </div>

                    {chatrooms
                      .filter(room => room.type === roomType)
                      .map(room => (
                          <div 
                              key={room.name}
                              className={`chat-user ${room.type} ${curRoom === room.name ? 'selected-room' : ''}`}
                              onClick={() => {
                                  setCurRoom(room.name);
                                  setIsInitialized(false); // re-fetch messages for new room
                                  setMessages([]);
                              }}
                          >
                              {room.name}
                              <div className="subtext">{room.subtext}</div>
                          </div>
                  ))}
                </div>

                <div className="chat-main">
                    <div className="chat-main-inner">
                        {hasStatsFilled ? (
                            <>
                                <div 
                                    className="chat-window" 
                                    ref={chatContainerRef}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflowY: 'auto',
                                        height: 'calc(100% - 60px)', // Adjust based on your form height
                                        padding: '10px',
                                    }}
                                >
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`chat-message ${msg.type}`}>
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
                                <button onClick={() => window.location.href = "/info"}>Fill out info</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;