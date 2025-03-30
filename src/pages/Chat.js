import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import stats from './stats'
import { jwtDecode } from "jwt-decode";
import match from '../match'


const token = localStorage.getItem("token");
const decodedToken = token ? jwtDecode(token) : null;
const name = decodedToken ? decodedToken.Username : null;
const testUsers = [{user: "Cool", college: "Penn State", major: "Computer Science", hobbies: "Music"}, {user: "Cool2", college: "Penn State", major: "Computer Engineering", hobbies: "Movies"}, {user: "Cool3", college: "Penn State", major: "Biology", hobbies: "Music"}]
// console.log(match("Okay Gemini, I want you to analyze a list of users and their traits. You will consider their college, major, and hobbies, in descending order of importance in your weighting in an attempt to match them with compatible users in an attempt to promote connections and lifelong friends! If you deem them to be over 75% compatible, group them together in an array of arrays and if not, keep them by themselves in the array. Example: [['User1', 'User3'], ['User2']]. Do not respond with any text other than in the form of the example text I provided so we can algorithmically parse through your resultant data." + JSON.stringify(testUsers)))


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
        oldMessages.push({type : name == msg.Username ? 'user' : msg.Username, text: msg.Message, timestamp: msg.Time});
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
    const [isConnected, setIsConnected] = useState(false);

    const modalRef = useRef(null);

  // Create a ref to store the interval ID
  const messagePollingRef = useRef(null);
  
  // Function to fetch new messages since the last one we have
  const fetchNewMessages = async () => {
    try {
        // Get the timestamp of the last message we have
        const lastMessageTime = messages.length > 0 
            ? messages[messages.length - 1].timestamp 
            : 0;


            const response = await fetch(`http://localhost:3003/api/chatrooms/PSUMain`, {
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
            // Filter out messages that are not newer than the last timestamp
            const filteredNewMsgs = newMsgsData.filter(msg => msg.Time > lastMessageTime);

            // Format the new messages
            const formattedNewMsgs = filteredNewMsgs.map(msg => ({
                type: name === msg.Username ? 'user' : msg.Username,
                text: msg.Message,
                timestamp: msg.Time
            }));

            // Update the messages state with only the new messages
            if (formattedNewMsgs.length > 0) {
                setMessages(messages => [...messages, ...formattedNewMsgs]);
            }
        }
    } catch (error) {
        console.error("Error fetching new messages:", error);
    }
};

  // Setup the message polling when component mounts
  useEffect(() => {
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
  }, []); // Empty dependency array means this effect runs once on mount
  
  // Scroll to bottom when new messages arrive
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
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
                    <div ref={messagesEndRef}>
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
