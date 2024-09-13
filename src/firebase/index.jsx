import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "indrawan-project.firebaseapp.com",
    projectId: "indrawan-project",
    storageBucket: "indrawan-project.appspot.com",
    messagingSenderId: "1045542795865",
    appId: "1:1045542795865:web:5ab89f9516528f4385cf48"
  };  

 const firebaseApp = initializeApp(firebaseConfig);

 export default firebaseApp;