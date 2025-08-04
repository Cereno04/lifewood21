// Import the configuration from the separate file
// Note the path is './firebase-config.js' because they are in the same 'js' folder
import { firebaseConfig } from './firebase-config.js';

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Initialize Firebase using the imported config
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// --- All Modal and Form Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Get references to modal and form elements
    const modal = document.getElementById('applicationModal');
    const applyBtn = document.getElementById('applyNowBtn');
    const closeBtn = document.querySelector('.modal-close-btn');
    const applicationForm = document.getElementById('applicationForm');

    // --- Modal Open/Close Logic ---
    const openModal = () => modal.classList.add('show');
    const closeModal = () => modal.classList.remove('show');

    applyBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop the link from trying to navigate
        openModal();
    });

    closeBtn.addEventListener('click', closeModal);
    // Close modal if user clicks on the dark overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- Firebase Form Submission Logic ---
    applicationForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default page reload on submit

        const submitBtn = applicationForm.querySelector('button.submit-btn');
        const btnText = submitBtn.querySelector('.btnText');
        
        btnText.textContent = 'Submitting...';
        submitBtn.disabled = true;

        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            age: Number(document.getElementById('age').value),
            degree: document.getElementById('degree').value,
            projectName: document.getElementById('projectName').value,
            availableTimeStart: document.getElementById('startTime').value,
            availableTimeEnd: document.getElementById('endTime').value,
            resumeLink: document.getElementById('resumeLink').value,
            experience: document.getElementById('experience').value,
            submittedAt: new Date()
        };

        try {
            const docRef = await addDoc(collection(db, "applications"), formData);
            console.log("Document written with ID: ", docRef.id);
            alert("Application submitted successfully!");
            
            applicationForm.reset();
            closeModal();

        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error submitting application. Please check the console and try again.");
        } finally {
            btnText.textContent = 'Submit';
            submitBtn.disabled = false;
        }
    });
});