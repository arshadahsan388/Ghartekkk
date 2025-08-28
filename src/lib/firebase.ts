// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "pak-delivers",
  "appId": "1:484314845717:web:6675b63d65974fe22af41c",
  "storageBucket": "pak-delivers.firebasestorage.app",
  "apiKey": "AIzaSyApV5GC7kCh8aBId6WuqSHYIulqLhnO-x8",
  "authDomain": "pak-delivers.firebaseapp.com",
  "messagingSenderId": "484314845717"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
