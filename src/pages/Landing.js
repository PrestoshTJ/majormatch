import React, { useState, useEffect, useRef } from 'react';
import './Landing.css';
import { jwtDecode } from "jwt-decode";

function Landing() {
  const [userModal, setUserModal] = useState(false);
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const name = decodedToken ? decodedToken.Username : null;

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
  
  // Generate random positions for elements within viewport
  const generateRandomPosition = () => {
    return {
      top: `${Math.random() * 70 + 15}%`,
      left: `${Math.random() * 70 + 15}%`,
    };
  };
  
  // Major bubbles data - reduced count
  const majors = [
    { name: "Computer Science", icon: "💻", color: "rgba(59, 130, 246, 0.1)" },
    { name: "Psychology", icon: "🧠", color: "rgba(139, 92, 246, 0.1)" },
    { name: "Business", icon: "📊", color: "rgba(16, 185, 129, 0.1)" },
    { name: "Engineering", icon: "⚙️", color: "rgba(245, 158, 11, 0.1)" },
    { name: "Medicine", icon: "🩺", color: "rgba(239, 68, 68, 0.1)" }
  ];
  
  // Personality traits data - reduced count
  const traits = [
    { name: "Analytical", color: "#3b82f6" },
    { name: "Creative", color: "#ec4899" },
    { name: "Ambitious", color: "#f59e0b" },
    { name: "Collaborative", color: "#10b981" },
    { name: "Empathetic", color: "#06b6d4" }
  ];
  
  // Generate connection lines
  const generateConnectionLines = () => {
    const lines = [];
    for (let i = 0; i < 8; i++) {
      const startPos = generateRandomPosition();
      const endPos = generateRandomPosition();
      
      // Calculate line length and angle
      const dx = parseInt(endPos.left) - parseInt(startPos.left);
      const dy = parseInt(endPos.top) - parseInt(startPos.top);
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      lines.push({
        top: startPos.top,
        left: startPos.left,
        width: `${length}px`,
        transform: `rotate(${angle}deg)`,
        animationDelay: `${i * 0.5}s`
      });
    }
    return lines;
  };
  
  // Generate background shapes
  const generateShapes = () => {
    const shapes = [];
    const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];
    
    for (let i = 0; i < 6; i++) {
      shapes.push({
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 80 + 10}%`,
        width: `${Math.random() * 150 + 80}px`,
        height: `${Math.random() * 150 + 80}px`,
        background: `radial-gradient(circle at center, ${colors[i % colors.length]}, transparent 70%)`,
        animationDelay: `${i * 1.5}s`
      });
    }
    return shapes;
  };


  // Check if element is outside viewport bounds and adjust if needed
  const ensureInViewport = (position, size = { width: 120, height: 40 }) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Convert percentage to pixels
    let topPx = (parseInt(position.top) / 100) * viewportHeight;
    let leftPx = (parseInt(position.left) / 100) * viewportWidth;
    
    // Define center content area to avoid (approximately)
    const contentArea = {
      top: viewportHeight * 0.3,
      left: viewportWidth * 0.3,
      bottom: viewportHeight * 0.7,
      right: viewportWidth * 0.7
    };
    
    // Ensure elements stay within viewport
    topPx = Math.max(10, Math.min(viewportHeight - size.height - 10, topPx));
    leftPx = Math.max(10, Math.min(viewportWidth - size.width - 10, leftPx));
    
    // Avoid center content area
    if (topPx > contentArea.top - size.height && topPx < contentArea.bottom &&
        leftPx > contentArea.left - size.width && leftPx < contentArea.right) {
      // Decide which edge to move to based on closest edge
      const distToTop = Math.abs(topPx - (contentArea.top - size.height));
      const distToBottom = Math.abs(topPx - contentArea.bottom);
      const distToLeft = Math.abs(leftPx - (contentArea.left - size.width));
      const distToRight = Math.abs(leftPx - contentArea.right);
      
      const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);
      
      if (minDist === distToTop) {
        topPx = contentArea.top - size.height - 10;
      } else if (minDist === distToBottom) {
        topPx = contentArea.bottom + 10;
      } else if (minDist === distToLeft) {
        leftPx = contentArea.left - size.width - 10;
      } else {
        leftPx = contentArea.right + 10;
      }
    }
    
    return {
      top: `${(topPx / viewportHeight) * 100}%`,
      left: `${(leftPx / viewportWidth) * 100}%`
    };
  };
  
  // Check for collisions between elements
  const checkCollision = (pos1, size1, positions) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Convert percentage to pixels
    const top1 = (parseInt(pos1.top) / 100) * viewportHeight;
    const left1 = (parseInt(pos1.left) / 100) * viewportWidth;
    
    for (const pos2 of positions) {
      const top2 = (parseInt(pos2.top) / 100) * viewportHeight;
      const left2 = (parseInt(pos2.left) / 100) * viewportWidth;
      
      // Check for collision (simple rectangular collision)
      if (left1 < left2 + size1.width &&
          left1 + size1.width > left2 &&
          top1 < top2 + size1.height &&
          top1 + size1.height > top2) {
        return true; // Collision detected
      }
    }
    
    return false; // No collision
  };

  useEffect(() => {
    // Create dynamic elements when component mounts
    const shapes = generateShapes();
    const connectionLines = generateConnectionLines();
    
    // Clear any previous dynamic content
    const backgroundShapes = document.querySelector('.background-shapes');
    const connectionLinesEl = document.querySelector('.connection-lines');
    const majorBubbles = document.querySelector('.major-bubbles');
    const traitTags = document.querySelector('.trait-tags');
    
    if (backgroundShapes) backgroundShapes.innerHTML = '';
    if (connectionLinesEl) connectionLinesEl.innerHTML = '';
    if (majorBubbles) majorBubbles.innerHTML = '';
    if (traitTags) traitTags.innerHTML = '';
    
    // Append shapes
    shapes.forEach((shape, index) => {
      if (backgroundShapes) {
        const shapeEl = document.createElement('div');
        shapeEl.className = 'shape';
        Object.assign(shapeEl.style, shape);
        backgroundShapes.appendChild(shapeEl);
      }
    });
    
    // Append connection lines
    connectionLines.forEach((line, index) => {
      if (connectionLinesEl) {
        const lineEl = document.createElement('div');
        lineEl.className = 'connection-line';
        Object.assign(lineEl.style, line);
        connectionLinesEl.appendChild(lineEl);
      }
    });
    
    // Track positions to avoid overlaps
    const usedPositions = [];
    
    // Append major bubbles
    majors.forEach((major, index) => {
      if (majorBubbles) {
        // Estimated size of the bubble
        const bubbleSize = { width: 140, height: 40 };
        
        // Try to find a non-colliding position
        let position;
        let attempts = 0;
        const maxAttempts = 20;
        
        do {
          position = generateRandomPosition();
          position = ensureInViewport(position, bubbleSize);
          attempts++;
        } while (checkCollision(position, bubbleSize, usedPositions) && attempts < maxAttempts);
        
        // Store this position to avoid future collisions
        usedPositions.push(position);
        
        const bubbleEl = document.createElement('div');
        bubbleEl.className = 'major-bubble';
        bubbleEl.innerHTML = `<span class="icon">${major.icon}</span> ${major.name}`;
        bubbleEl.style.top = position.top;
        bubbleEl.style.left = position.left;
        bubbleEl.style.backgroundColor = major.color;
        bubbleEl.style.animationDelay = `${index * 0.7}s`;
        majorBubbles.appendChild(bubbleEl);
      }
    });
    
    // Append personality trait tags
    traits.forEach((trait, index) => {
      if (traitTags) {
        // Estimated size of the tag
        const tagSize = { width: 100, height: 30 };
        
        // Try to find a non-colliding position
        let position;
        let attempts = 0;
        const maxAttempts = 20;
        
        do {
          position = generateRandomPosition();
          position = ensureInViewport(position, tagSize);
          attempts++;
        } while (checkCollision(position, tagSize, usedPositions) && attempts < maxAttempts);
        
        // Store this position to avoid future collisions
        usedPositions.push(position);
        
        const tagEl = document.createElement('div');
        tagEl.className = 'trait-tag';
        tagEl.textContent = trait.name;
        tagEl.style.top = position.top;
        tagEl.style.left = position.left;
        tagEl.style.backgroundColor = `${trait.color}20`; // 20 = 12% opacity in hex
        tagEl.style.color = trait.color;
        tagEl.style.animationDelay = `${index * 0.9}s`;
        traitTags.appendChild(tagEl);
      }
    });
  }, []);

  return (
    <div className="landing">
      <div className="background-shapes"></div>
      <div className="major-bubbles"></div>
      <div className="trait-tags"></div>
      
      <div className="content">
        <h1 className="title">MajorMatch</h1>
        <p className="subtitle">Connect with like-minded students who share your academic interests and personality traits.</p>
        <div className="button-container">
          <button className="primary-button" onClick={() => {token ? window.location.href = "/message" : window.location.href = "/authenticate" }}>
            Find Your Match
          </button>
          <button onClick = {() => window.location.href = "/survey"} className="primary-button" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
            Explore Majors
          </button>
        </div>
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
  );
}

export default Landing;