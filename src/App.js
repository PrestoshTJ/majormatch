import logo from './logo.svg';
import './App.css';

import React, {useRef, useState} from 'react'

import Sign from './pages/Sign'
import Landing from './pages/Landing'
import Chat from './pages/Chat'
import Undecided from './pages/Undecided'
import Stats from './pages/stats'

function App() {

  let component
  switch (window.location.pathname) {
    case "/":
      component = <Landing/>
      break
    case "/landing":
      component = <Landing/>
      break
    case "/authenticate":
      component = <Sign/>
      break
    case "/message":
      component = <Chat/>
      break
    case "/survey":
      component = <Undecided/>
      break
    case "/info":
      component = <Stats/>
      break
    default:
      break
  }


  
  return (
    <div className = "lowerApp">
      {component}
    </div>
  );
}

export default App;
