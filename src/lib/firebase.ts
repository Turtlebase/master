// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "imageconpro",
  "appId": "1:240523382970:web:b35cb2b5c3d5c06e48f283",
  "storageBucket": "imageconpro.firebasestorage.app",
  "apiKey": "AIzaSyCp6Xi0W_Tae0YqWBVJthtrd-fz_rsbrJc",
  "authDomain": "imageconpro.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "240523382970"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
