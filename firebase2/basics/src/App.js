import logo from './logo.svg';
import './App.css';
import { useState } from "react";
import { app } from './components/firebaseconfig'
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import SignIn from './components/signin';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Admin from './components/data'
import Clothes from './components/clothes';

function App() {


  return (
    <Router>
      <div className='my-3'>
        

        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route path="/data" element={<Admin />} />
          <Route path="/clothes" element={<Clothes />} />

        </Routes>
        {/*<BestSeller />*/}
      </div>
    </Router>
  );
}

export default App;
