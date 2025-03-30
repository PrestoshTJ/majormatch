import React, { useState, useRef, useEffect } from 'react'
import './Undecided.css'
import { jwtDecode } from "jwt-decode";

let firstPass = true;
function Stats() {
    const [formData, setFormData] = useState({
        college: '',
        otherCollege: '',
        major: '',
        otherMajor: '',
        hobbies: ''
      });
      
      const isOtherMajor = formData.major === 'Other';
      const isUndecided = formData.major === 'Undecided';
      const token = localStorage.getItem("token");
      const decodedToken = token ? jwtDecode(token) : null;
      const name = decodedToken ? decodedToken.Username : null;

      useEffect(() => {
        const firstTime = async () => {
          const user = await getUser(name);
          if (user) {
            setFormData({
              college: user.College === "Penn State" ? "Penn State" : "Other",
              otherCollege: user.College === "Penn State" ? "" : user.College || "",
              major: ["Computer Science", "Psychology", "Mechanical Engineering", "Finance", "Biology", "Undecided"].includes(user.Major) ? user.Major : "Other",
              otherMajor: ["Computer Science", "Psychology", "Mechanical Engineering", "Finance", "Biology", "Undecided"].includes(user.Major) ? "" : user.Major || "",
              hobbies: user.Hobbies || ""
            });
          }
        };
      
        if (name) {
          firstTime();
        }
      }, [name]);
      

      const editUser = async () => {
        try {
          console.log(FormData)
          const response = await fetch("http://localhost:3003/api/Passwords", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ Username: name, College: formData.college !== "Other" ? formData.college : formData.otherCollege, Major: formData.major !== "Other" ? formData.major : formData.otherMajor, Hobbies: formData.hobbies}), 
          });
      
          
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      };

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
      
      // Call the function with a valid username
      // getUser("testuser").then(data => console.log("Result:", data));


  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalMajor = formData.major === 'Other' ? formData.otherMajor : formData.major;
    editUser();
    console.log({ ...formData, major: finalMajor });
  };

  if (firstPass){
    
    firstTime()
  }

  async function firstTime() {
    const user = await getUser(name);
    console.log(user)
    setFormData({
      College: user.College,
      Major: user.Major,
      Hobbies: user.Hobbies
    });
    firstPass = false;
    console.log(formData)
  }

  return (
    <div className="survey-container">
      <h1 className="survey-title">Tell Us About Yourself, {name} </h1>
      <p className="survey-description">
        Help us get to know you better by answering the questions below.
      </p>

      <form onSubmit={handleSubmit}>
        {/* College Dropdown */}
        <div className="slider-container">
        <label className="slider-label" htmlFor="college">Which college are you from?</label>
        <select
            id="college"
            name="college"
            value={formData.college}
            onChange={handleChange}
            className="slider"
        >
            <option value="">Select your college</option>
            <option value="Penn State">Penn State</option>
            <option value="Other">Other</option>
        </select>

        {/* Show input if college is anything other than Penn State */}
        {formData.college && formData.college !== 'Penn State' && (
            <input
            type="text"
            name="otherCollege"
            placeholder="Please specify your college or university"
            value={formData.otherCollege}
            onChange={handleChange}
            className="slider"
            style={{ marginTop: '1rem' }}
            />
        )}
        </div>


        {/* Major Dropdown */}
        <div className="slider-container">
          <label className="slider-label" htmlFor="major">What is your current or intended major?</label>
          <select
            id="major"
            name="major"
            value={formData.major}
            onChange={handleChange}
            className="slider"
          >
            <option value="">Select your major</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Psychology">Psychology</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Finance">Finance</option>
            <option value="Biology">Biology</option>
            <option value="Undecided">Undecided</option>
            <option value="Other">Other</option>
          </select>

          {isOtherMajor && (
            <input
              type="text"
              name="otherMajor"
              placeholder="Please specify your major"
              value={formData.otherMajor}
              onChange={handleChange}
              className="slider"
              style={{ marginTop: '1rem' }}
            />
          )}

          {isUndecided && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: '#475569', fontWeight: 500 }}>
                Not sure yet? We offer a survey that can help you discover a suitable major!
              </p>
              <a
                href="/survey" // Adjust this path to match your routing setup
                target="_blank"
                rel="noopener noreferrer"
                className="submit-button"
              >
                Take the Major Survey
              </a>
            </div>
          )}
        </div>

        {/* Hobbies Input */}
        <div className="slider-container">
          <label className="slider-label" htmlFor="hobbies">List a few of your hobbies</label>
          <textarea
            id="hobbies"
            name="hobbies"
            rows="4"
            value={formData.hobbies}
            onChange={handleChange}
            className="slider"
            placeholder="E.g. Drawing, Coding, Hiking..."
          ></textarea>
        </div>

        <button onClick = {() => window.location.href = "/message"} type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
}

export default Stats;
