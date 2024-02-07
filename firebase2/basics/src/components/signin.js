import React from "react";
import { useState } from "react";
import { app } from './firebaseconfig'
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";


function SignIn(){
    let auth  =getAuth();

    let google_auth = new GoogleAuthProvider();
  
    const [data, setData] = useState({});
    //Initializes a state variable named data with an empty object as its initial value. setData is a function used to update the data state.
    
    const handleInput =(event) => {
      let newInput = { [event.target.name] : event.target.value}; 
      //new object newInput with the key being the name of the input field and the value being the input's value
  
      setData({ ...data, ...newInput});
      // Add new input values to the existing data
      //data ke purane values me aur values add ho rahe hai
    }
  
    const handleSubmit = () => {
      // If email and password are provided, attempt email/password authentication
      if (data.email && data.password) {
        createUserWithEmailAndPassword(auth, data.email, data.password)
        // The createUserWithEmailAndPassword function returns a Promise. A Promise represents the eventual completion or failure of an asynchronous operation.
  
  
  
          // Promise resolves when user creation is successful
          //then Block: This block is executed when the Promise is resolved, meaning the user creation was successful.
          .then((response) => {
            console.log(response.user);
            alert("signup Succesful");
          })
          // Catch and handle errors during email/password authentication
          .catch((err) => {
            alert(err.message);
          });
      } else {
        // If email and password are not provided, attempt Google sign-in
        signInWithPopup(auth, google_auth)
          // Promise resolves when Google sign-in is successful
          .then((response) => {
            console.log(response.user);
          })
          // Catch and handle errors during Google sign-in
          .catch((err) => {
            alert(err.message);
          });
      }
    };
    return (
        <div className="SignIn">
            <input
            type='email'
            name='email'
            placeholder='Email'
            onChange={(event) => handleInput(event)}/>

            <input
            type='password'
            name='password'
            placeholder='Password'
            onChange={(event) => handleInput(event)}/>

          
          <br></br>
    
          <button type='submit' onClick={handleSubmit}>Submit</button>
    
    
        <div class="flex items-center justify-center h-screen dark:bg-gray-800">
          <button onClick={handleSubmit} >
            <img class="google-icon" src="    https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" width="50" height="50"/>
              <span>Login with Google</span>
        </button>
        </div>
    
    
        </div>
        
      );


}

export default SignIn;