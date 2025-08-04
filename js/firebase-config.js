// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOwd8kXjhNQmDKPXH98co_8fxsoaUd2q0",
    authDomain: "lifewood-04.firebaseapp.com",
    projectId: "lifewood-04",
    storageBucket: "lifewood-04.firebasestorage.app",
    messagingSenderId: "709112942157",
    appId: "1:709112942157:web:c0e7239c4a151e885d5604",
    measurementId: "G-Q4BWRSY2VQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export the database instance to be used in other files
export { db, firebaseConfig, app };