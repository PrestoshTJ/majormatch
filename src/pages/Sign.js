import React, {useState, useRef, useEffect} from 'react'
import sha256 from 'js-sha256';
import './Sign.css';
import { jwtDecode } from "jwt-decode";


function Sign() {
    const [userState, setUserState] = useState("")
    const [passState, setPassState] = useState("")
    const [rePassState, setRePassState] = useState("")
  
    const [signInState, setSignInState] = useState(true)
    const [warningText, setWarningText] = useState("")
    const [successText, setSuccessText] = useState("")
    
  
    const signInSubmit = async (e) => {
      e.preventDefault();
      setWarningText("");

          
      let passHash = sha256(passState).toString();
    
      const token = await validateUser(userState, passHash);

      if (token) {
        localStorage.setItem('token', token);
        window.location.href = "/message"
      } else {
        setWarningText("Either the username or password is not correct");
      }
    };
    
  
    const signUpSubmit = async (e) => {
      e.preventDefault()
      setWarningText("")
      setSuccessText("")
      if (passState == rePassState) {
        let passHash = passState ? sha256(passState) : ""
        await addUser(userState, passHash)
        
      } else {
        setWarningText("Passwords do not match")
        return
      }
    }

    const validateUser = async (user, pass) => {
      try {
        const response = await fetch("http://localhost:3003/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Username: user, Password: pass }), 
        });
    
        if (!response.ok) {
          throw new Error("Invalid credentials");
        }
    
        const data = await response.json(); 
        
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          return data.token; 
        }
    
        return null; // Invalid credentials
      } catch (error) {
        console.error("Login error:", error);
        return null;
      }
    };
    
    

    const addUser = async (user, pass) => {
      let formData = {"Username": user, "Password": pass};
      try {
        const response = await fetch("http://localhost:3003/api/Passwords", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        
        // Parse the response body as JSON
        const data = await response.json();
        
        if (response.ok) {
          setSuccessText("Successfully signed up!")
          console.log("Form submitted successfully:", data.message);
        } else {
          console.log("Form submission failed:", data.message);
          setWarningText(data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

  return (
    <div className="App">
      {signInState ? (
        <>
          <h1> Sign in</h1>
          <form className = "signInForm" onSubmit = {signInSubmit}>
            <label htmlFor = "username"> Username: </label>
            <input className = "username" type = "text" name = "username" placeholder = "Type in your username..." onChange = {(e) => setUserState(e.target.value)}></input>
            <label htmlFor = "password"> Password: </label>
            <input className = "password" type = "text" name = "password" placeholder = "Type in your password..." onChange = {(e) => setPassState(e.target.value)}></input>
            <button type = "submit"> Submit </button>
            <h3>{warningText}</h3>
            <h3>{successText}</h3>
          </form>
        </>
        ) : (
          <>
            <h1> Sign up </h1>
            <form className = "signUpForm" onSubmit = {signUpSubmit}>
              <label htmlFor = "username"> Username: </label>
              <input className = "username" type = "text" name = "username" placeholder = "Type in your username..." onChange = {(e) => setUserState(e.target.value)}></input>
              <label htmlFor = "password"> Password: </label>
              <input className = "password" type = "text" name = "password" placeholder = "Type in your password..." onChange = {(e) => setPassState(e.target.value)}></input>
              <label htmlFor = "password2"> Verify Password: </label>
              <input className = "password2" type = "text" name = "password2" placeholder = "Retype your password..." onChange = {(e) => setRePassState(e.target.value)}></input>
              <button type = "submit"> Submit </button>
              <h3>{warningText}</h3>
              <h3 className = "success">{successText}</h3>
            </form>
          </>
        )
      }
      <button onClick = {() => {setSignInState(!signInState); setWarningText(""); setSuccessText("")}}> {signInState ? "Sign Up" : "Sign in"} </button>

    </div>
  );
}

export default Sign