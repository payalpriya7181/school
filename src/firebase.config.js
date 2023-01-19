// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClSfvkcfPNqXc0EcVVtDk1knvXbpbkG6k",
  authDomain: "school-2becd.firebaseapp.com",
  projectId: "school-2becd",
  storageBucket: "school-2becd.appspot.com",
  messagingSenderId: "968339403599",
  appId: "1:968339403599:web:811a83bfdb69c10ab4cb3a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db =  getFirestore(app)
export const auth = getAuth(app)