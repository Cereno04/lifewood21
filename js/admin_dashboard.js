import { db } from './firebase-config.js';
import {collection,getDocs,addDoc,doc,getDoc,updateDoc,deleteDoc,query,where,Timestamp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
const applicantsCollection = collection(db, 'applications');
const postingsCollection = collection(db, 'jobPostings');

// NEW: EmailJS Configuration Constants
const EMAILJS_PUBLIC_KEY = 'gdW8Xt3OykGWQWkQg';
const EMAILJS_SERVICE_ID = 'service_0tat6rp';
const EMAILJS_TEMPLATE_ID = 'template_07g8coy';


document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS SDK on page load
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // --- DOM ELEMENTS FOR ALL MODALS ---
    const applicantModal = document.getElementById('applicantModal');
    const applicantForm = document.getElementById('applicantForm');
    const applicantIdField = document.getElementById('applicantId');
    const modalTitle = document.getElementById('modalTitle');

    const postingModal = document.getElementById('postingModal');
    const postingForm = document.getElementById('postingForm');
    const postingIdField = document.getElementById('postingId');
    const postingModalTitle = document.getElementById('postingModalTitle');
    
    const customAlertModal = document.getElementById('customAlertModal');
    const customAlertTitle = document.getElementById('customAlertTitle');
    const customAlertMessage = document.getElementById('customAlertMessage');
    const customAlertIcon = document.getElementById('customAlertIcon');

    const confirmModal = document.getElementById('confirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmModalIcon = document.getElementById('confirmModalIcon');
    const confirmModalYesBtn = document.getElementById('confirmModalYesBtn');

    // Other DOM elements
    const tableBody = document.getElementById('applicantsTableBody');
    const postingsTableBody = document.getElementById('postingsTableBody');
    const interviewsTableBody = document.getElementById('interviewsTableBody');
    const totalApplicantsCountElement = document.getElementById('total-applicants-count');
    const jobPostingsCountElement = document.getElementById('job-postings-count');
    const interviewsTodayCountElement = document.getElementById('interviews-today-count');
    const newApplicantsCountElement = document.getElementById('new-applicants-count');
    const addPostingBtn = document.getElementById('addPostingBtn');
    
    let onConfirmCallback = null;

    // --- GENERIC MODAL & ALERT FUNCTIONS ---
    const openModal = (modalElement) => modalElement.classList.add('is-visible');
    const closeModal = (modalElement) => modalElement.classList.remove('is-visible');
    
    const showCustomAlert = (message, title = 'Notification', icon = 'fa-check-circle', iconColor = 'icon-success') => {
        customAlertTitle.textContent = title;
        customAlertMessage.textContent = message;
        customAlertIcon.className = `fas ${icon} modal-icon ${iconColor}`;
        openModal(customAlertModal);
    };

    const showConfirmation = (title, message, icon, confirmText, onConfirm) => {
        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;
        confirmModalIcon.className = `fas ${icon} modal-icon icon-error`;
        confirmModalYesBtn.textContent = confirmText;
        onConfirmCallback = onConfirm;
        openModal(confirmModal);
    };

    // --- EVENT LISTENERS FOR MODALS ---
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
        const closeButton = modal.querySelector('.close-btn');
        if (closeButton) closeButton.addEventListener('click', () => closeModal(modal));
    });

    document.getElementById('customAlertCloseBtn').addEventListener('click', () => closeModal(customAlertModal));
    document.getElementById('confirmModalNoBtn').addEventListener('click', () => closeModal(confirmModal));
    confirmModalYesBtn.addEventListener('click', () => {
        if (typeof onConfirmCallback === 'function') onConfirmCallback();
        closeModal(confirmModal);
    });
    
    // ==============================================
    //     EMAIL NOTIFICATION LOGIC
    // ==============================================
   const sendNotificationEmail = (applicantData) => {
    // --- MASTER EMAIL TEMPLATE BUILDER ---
    const createEmailHtml = (options) => {
        const { heading, content, button } = options;
        const lifewoodGreen = '#2f6b5b';
        const lifewoodOrange = '#f5b85d';
        const backgroundColor = '#f9f6f0';
        const textColor = '#3d3d3d';

        let buttonHtml = '';
        if (button && button.text && button.link) {
            buttonHtml = `
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" style="border-radius: 5px; background-color: ${lifewoodOrange};">
                                    <a href="${button.link}" target="_blank" style="font-size: 16px; font-weight: bold; color: #333333; text-decoration: none; border-radius: 5px; padding: 14px 28px; border: 1px solid ${lifewoodOrange}; display: inline-block;">
                                        ${button.text}
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>`;
        }

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width">
            <style>body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }</style>
        </head>
        <body style="margin: 0; padding: 0; background-color: ${backgroundColor};">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="padding: 40px 15px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            <tr><td align="center" style="padding: 40px 0 20px 0;"><img src="https://i.imgur.com/MnBaOoH.png" alt="Lifewood Logo" width="140" style="display: block;"></td></tr>
                            <tr><td align="center" style="padding: 10px 40px; color: ${lifewoodGreen}; font-size: 24px; font-weight: bold;">${heading}</td></tr>
                            <tr><td style="padding: 20px 40px 10px 40px; color: ${textColor}; font-size: 16px; line-height: 1.7;">${content}</td></tr>
                            ${buttonHtml}
                            <tr><td style="padding: 20px 40px 40px 40px; color: ${textColor}; font-size: 16px; line-height: 1.7;">Best regards,<br>The Lifewood Hiring Team</td></tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>`;
    };

    const status = applicantData.status;
    let subject = '';
    let emailOptions = {};

    switch (status) {
        case 'Interview for Schedule':
            if (!applicantData.interviewDate) {
                console.error("Cannot send interview email: No date was set.");
                showCustomAlert("Applicant saved, but email not sent. Please set an interview date first.", "Email Error", "fa-exclamation-triangle", "icon-warning");
                return;
            }
            const dateObj = applicantData.interviewDate.toDate();
            const interviewDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const interviewTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            subject = 'Invitation to Interview with Lifewood';
            emailOptions = {
                heading: 'Interview Invitation',
                content: `Dear ${applicantData.firstName},<br><br>Following up on your application, we would like to invite you for an interview to discuss your qualifications and the position in more detail.<br><br>Your interview is scheduled for:<br><div style="padding: 15px; margin: 15px 0; border-left: 3px solid #f5b85d;"><strong>Date:</strong> ${interviewDate}<br><strong>Time:</strong> ${interviewTime}</div>Please let us know if this time works for you. We look forward to speaking with you.`,
                button: { text: 'Contact Us', link: 'mailto:hr@lifewood.com?subject=Re: Interview Invitation' }
            };
            break;

        case 'Hired':
            subject = 'Welcome to the Lifewood Team!';
            emailOptions = {
                heading: 'Congratulations! You’re Hired at Lifewood!',
                content: `Dear ${applicantData.firstName},<br><br>We’re excited to let you know that you’ve been <strong>officially hired</strong> for the <strong>${applicantData.projectName || 'the position'}</strong> role at Lifewood! Your skills, background, and enthusiasm stood out, and we’re confident you’ll make a great addition to our team.<br><br>Our HR team will be in touch within the next two working days to walk you through the offer details, potential start date, and onboarding steps. Please watch your inbox for further instructions.`,
                button: { text: 'Contact HR', link: 'mailto:hr@lifewood.com?subject=Regarding My Offer' }
            };

            break;

        case 'Rejected':
            subject = 'Update on Your Application with Lifewood';
                emailOptions = {
                    heading: 'Your Application with Lifewood',
                    content: `Dear ${applicantData.firstName},<br><br>
                    Thank you for your interest in a position at Lifewood and for the time you invested in our application process.<br><br>
                    After careful consideration of all candidates, we have decided to move forward with another applicant at this time. The selection process was highly competitive, and we had to make some difficult decisions.<br><br>
                    We sincerely appreciate you considering a career with us and wish you the very best in your job search.`,
                    button: null
                };

            break;
        
        default:
            console.log(`Email trigger skipped: status is "${status}".`);
            return;
    }

    const finalEmailHtml = createEmailHtml(emailOptions);
    const templateParams = {
        to_name: `${applicantData.firstName} ${applicantData.lastName}`,
        to_email: applicantData.email,
        subject: subject,
        email_body: finalEmailHtml, 
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(response => console.log('SUCCESS! Email sent.', response.status, response.text))
        .catch(error => {
            console.error('FAILED to send email:', error);
            showCustomAlert(`Applicant data saved, but the notification email failed to send. Error: ${error.text || 'Unknown'}.`, "Email Sending Failed", 'fa-exclamation-triangle', 'icon-warning');
        });
};

    const fetchApplicants = async () => {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading applicants...</td></tr>';
        totalApplicantsCountElement.textContent = '...';
        try {
            const querySnapshot = await getDocs(applicantsCollection);
            totalApplicantsCountElement.textContent = querySnapshot.size;
            tableBody.innerHTML = '';
            if (querySnapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No applicants found.</td></tr>';
                return;
            }
            querySnapshot.forEach(doc => {
                const applicant = doc.data();
                const status = applicant.status || 'Pending';
                const statusClass = status.replace(/\s+/g, '-').toLowerCase();
                const statusBadge = `<span class="status-badge status-${statusClass}">${status}</span>`;
                const actionButtons = `<button class="btn-action btn-edit" data-id="${doc.id}" title="Edit"><i class="fas fa-pencil-alt"></i></button><button class="btn-action btn-delete" data-id="${doc.id}" title="Delete"><i class="fas fa-trash-alt"></i></button><button class="btn-action btn-delete" data-id="${doc.id}" title="View Resume"><i class="fas fa-file-alt"></i></button>`;
                tableBody.innerHTML += `<tr data-id="${doc.id}"><td>${applicant.firstName || ''} ${applicant.lastName || ''}</td><td>${applicant.email || ''}</td><td>${statusBadge}</td><td>${applicant.projectName || ''}</td><td class="actions">${actionButtons}</td></tr>`;
            });
        } catch (error) {
            console.error("Error fetching applicants: ", error);
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: red;">Error loading applicants.</td></tr>';
            totalApplicantsCountElement.textContent = 'Error';
        }
    };
    
    applicantForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const applicantId = applicantIdField.value;
        const interviewDateValue = document.getElementById('interviewDate').value;
        const applicantData = {
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
            status: document.getElementById('status').value,
            interviewDate: interviewDateValue ? Timestamp.fromDate(new Date(interviewDateValue)) : null
        };
        if (!applicantId) {
            showCustomAlert("Error: Could not find an applicant ID to update.", "Save Error", 'fa-times-circle', 'icon-error');
            return;
        }
        try {
            await updateDoc(doc(db, 'applications', applicantId), applicantData);
            sendNotificationEmail(applicantData);
            showCustomAlert('Applicant updated successfully!', 'Success');
            closeModal(applicantModal);
            fetchAllData();
        } catch (error) {
            console.error("Error saving applicant: ", error);
            showCustomAlert("Failed to save applicant data.", "Database Error", 'fa-times-circle', 'icon-error');
        }
    });

    tableBody.addEventListener('click', async (e) => {
        const target = e.target.closest('.btn-action');
        if (!target) return;
        const id = target.dataset.id;
        if (target.classList.contains('btn-delete')) {
            showConfirmation('Confirm Deletion', 'Are you sure you want to permanently delete this applicant?', 'fa-trash-alt', 'Delete', async () => {
                try {
                    await deleteDoc(doc(db, 'applications', id));
                    showCustomAlert('Applicant deleted successfully!', 'Deleted');
                    fetchAllData();
                } catch (error) {
                    showCustomAlert("Failed to delete applicant.", "Deletion Error", 'fa-times-circle', 'icon-error');
                }
            });
        } else if (target.classList.contains('btn-edit')) {
            try {
                const docSnap = await getDoc(doc(db, 'applications', id));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    applicantForm.querySelector('#firstName').value = data.firstName || '';
                    applicantForm.querySelector('#lastName').value = data.lastName || '';
                    applicantForm.querySelector('#email').value = data.email || '';
                    applicantForm.querySelector('#age').value = data.age || '';
                    applicantForm.querySelector('#degree').value = data.degree || '';
                    applicantForm.querySelector('#projectName').value = data.projectName || '';
                    applicantForm.querySelector('#resumeLink').value = data.resumeLink || '';
                    applicantForm.querySelector('#experience').value = data.experience || '';
                    applicantForm.querySelector('#status').value = data.status || 'Pending';
                    applicantForm.querySelector('#startTime').value = data.availableTimeStart || ''; 
                    applicantForm.querySelector('#endTime').value = data.availableTimeEnd || '';     
                    if (data.interviewDate?.toDate) {
                       const date = data.interviewDate.toDate();
                       const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                       applicantForm.querySelector('#interviewDate').value = localDate.toISOString().slice(0, 16);
                    } else {
                       applicantForm.querySelector('#interviewDate').value = '';
                    }
                    applicantIdField.value = id;
                    modalTitle.textContent = 'Edit Applicant';
                    openModal(applicantModal);
                }
            } catch (error) {
                showCustomAlert("Could not load applicant data.", "Load Error", 'fa-times-circle', 'icon-error');
            }
        }
    });

    const fetchJobPostings = async () => {
        postingsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading job postings...</td></tr>';
        try {
            const querySnapshot = await getDocs(postingsCollection);
            postingsTableBody.innerHTML = '';
            if (querySnapshot.empty) {
                postingsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No job postings found.</td></tr>';
                return;
            }
            querySnapshot.forEach(doc => {
                const posting = doc.data();
                const statusClass = (posting.status || 'draft').toLowerCase();
                const statusTag = `<span class="tag tag-${statusClass}">${posting.status}</span>`;
                const actionButtons = `<button class="btn-action btn-edit" data-id="${doc.id}" title="Edit"><i class="fas fa-pencil-alt"></i></button><button class="btn-action btn-delete" data-id="${doc.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>`;
                postingsTableBody.innerHTML += `<tr data-id="${doc.id}"><td>${posting.jobTitle || ''}</td><td>${posting.department || ''}</td><td>${statusTag}</td><td class="actions">${actionButtons}</td></tr>`;
            });
        } catch (error) {
            console.error("Error fetching job postings: ", error);
            postingsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: red;">Error loading job postings.</td></tr>';
        }
    };
    
    // --- START: CORRECTED FORM SUBMISSION FOR JOB POSTINGS ---
    postingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const postingId = postingIdField.value;
        // Gather all fields from the form
        const postingData = {
            jobTitle: document.getElementById('jobTitle').value,
            department: document.getElementById('department').value,
            location: document.getElementById('location').value,
            jobType: document.getElementById('jobType').value,
            applicationDeadline: document.getElementById('applicationDeadline').value,
            salaryMin: document.getElementById('salaryMin').value,
            salaryMax: document.getElementById('salaryMax').value,
            description: document.getElementById('description').value,
            requiredSkills: document.getElementById('requiredSkills').value,
            hiringManager: document.getElementById('hiringManager').value,
            status: document.getElementById('postingStatus').value,
        };

        try {
            if (postingId) { // If there's an ID, update the existing document
                await updateDoc(doc(db, 'jobPostings', postingId), postingData);
                showCustomAlert('Job posting updated successfully!', 'Success');
            } else { // Otherwise, create a new document
                postingData.createdAt = Timestamp.fromDate(new Date());
                await addDoc(postingsCollection, postingData);
                showCustomAlert('Job posting added successfully!', 'Success');
            }
            closeModal(postingModal);
            fetchAllData();
        } catch (error) {
            console.error("Error saving job posting: ", error);
            showCustomAlert("Failed to save job posting.", "Save Error", 'fa-times-circle', 'icon-error');
        }
    });
    
    // --- START: CORRECTED EDIT FUNCTIONALITY FOR JOB POSTINGS ---
    postingsTableBody.addEventListener('click', async (e) => {
        const target = e.target.closest('.btn-action');
        if (!target) return;
        const id = target.dataset.id;

        if (target.classList.contains('btn-delete')) {
            showConfirmation('Confirm Deletion', 'Are you sure you want to permanently delete this job posting?', 'fa-trash-alt', 'Delete', async () => {
                try {
                    await deleteDoc(doc(db, 'jobPostings', id));
                    showCustomAlert('Job posting deleted!', 'Deleted');
                    fetchAllData();
                } catch (error) {
                    showCustomAlert("Failed to delete job posting.", "Deletion Error", 'fa-times-circle', 'icon-error');
                }
            });
        } else if (target.classList.contains('btn-edit')) {
            try {
                const docSnap = await getDoc(doc(db, 'jobPostings', id));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Populate ALL fields in the modal
                    postingForm.querySelector('#jobTitle').value = data.jobTitle || '';
                    postingForm.querySelector('#department').value = data.department || '';
                    postingForm.querySelector('#location').value = data.location || '';
                    postingForm.querySelector('#jobType').value = data.jobType || 'Full-time';
                    postingForm.querySelector('#applicationDeadline').value = data.applicationDeadline || '';
                    postingForm.querySelector('#salaryMin').value = data.salaryMin || '';
                    postingForm.querySelector('#salaryMax').value = data.salaryMax || '';
                    postingForm.querySelector('#description').value = data.description || '';
                    postingForm.querySelector('#requiredSkills').value = data.requiredSkills || '';
                    postingForm.querySelector('#hiringManager').value = data.hiringManager || '';
                    postingForm.querySelector('#postingStatus').value = data.status || 'Open';
                    
                    postingIdField.value = id;
                    postingModalTitle.textContent = 'Edit Job Posting';
                    openModal(postingModal);
                }
            } catch (error) {
                console.error("Error fetching posting for edit:", error);
                showCustomAlert("Could not load job posting data.", "Load Error", 'fa-times-circle', 'icon-error');
            }
        }
    });
    
    addPostingBtn.addEventListener('click', () => {
        postingForm.reset();
        postingIdField.value = '';
        postingModalTitle.textContent = 'Add New Job Posting';
        openModal(postingModal);
    });

    const fetchInterviews = async () => {
        interviewsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading interviews...</td></tr>';
        try {
            const q = query(applicantsCollection, where("interviewDate", "!=", null));
            const querySnapshot = await getDocs(q);
            interviewsTableBody.innerHTML = '';
            if (querySnapshot.empty) {
                interviewsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No interviews scheduled or completed.</td></tr>';
                return;
            }
            querySnapshot.forEach(doc => {
                const applicant = doc.data();
                const interviewDate = applicant.interviewDate?.toDate().toLocaleString() || 'Not Set';
                const status = applicant.status || 'Pending';
                const statusClass = status.replace(/\s+/g, '-').toLowerCase();
                const statusBadge = `<span class="status-badge status-${statusClass}">${status}</span>`;
                interviewsTableBody.innerHTML += `<tr><td>${applicant.firstName} ${applicant.lastName}</td><td>${applicant.projectName}</td><td>${interviewDate}</td><td>HR Department</td><td>${statusBadge}</td></tr>`;
            });
        } catch (error) {
            console.error("Error fetching interviews: ", error);
            interviewsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: red;">Error loading interviews.</td></tr>';
        }
    };

    const fetchAdditionalStats = async () => {
    // Set initial text to loading
    jobPostingsCountElement.textContent = '...';
    interviewsTodayCountElement.textContent = '...';
    newApplicantsCountElement.textContent = '...';

    try {
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const endOfToday = new Date(now.setHours(23, 59, 59, 999));
        const twentyFourHoursAgo = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);

        // --- Fetch All Applications ---
        const applicantsSnapshot = await getDocs(applicantsCollection);
        
        let interviewsToday = 0;
        let newApplicants = 0;
        
        applicantsSnapshot.forEach(docSnap => {
            const data = docSnap.data();

            // Check for new applicants
            // IMPORTANT: Make sure your application documents have a 'submittedAt' timestamp field!
            if (data.submittedAt && data.submittedAt >= twentyFourHoursAgo) {
                newApplicants++;
            }

            // Check for interviews scheduled for today
            if (data.interviewDate?.toDate) {
                const interviewDate = data.interviewDate.toDate();
                if (interviewDate >= startOfToday && interviewDate <= endOfToday) {
                    interviewsToday++;
                }
            }
        });
        
        // --- Fetch ONLY Active Job Postings ---
        const postingsQuery = query(postingsCollection, where("status", "==", "Open"));
        const postingsSnapshot = await getDocs(postingsQuery);
        
        // --- Update the UI with the final counts ---
        jobPostingsCountElement.textContent = postingsSnapshot.size;
        interviewsTodayCountElement.textContent = interviewsToday;
        newApplicantsCountElement.textContent = newApplicants;
        
        // Also update the interview count badge in the sidebar
        const interviewBadge = document.getElementById('interview-count-badge');
        if(interviewBadge) {
            const interviewQuery = query(applicantsCollection, where("interviewDate", "!=", null));
            const interviewSnapshot = await getDocs(interviewQuery);
            interviewBadge.textContent = interviewSnapshot.size;
        }


    } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        jobPostingsCountElement.textContent = 'Err';
        interviewsTodayCountElement.textContent = 'Err';
        newApplicantsCountElement.textContent = 'Err';
    }
};
    
    const fetchAllData = () => {
        fetchApplicants();
        fetchJobPostings();
        fetchInterviews();
        fetchAdditionalStats();
    };

    fetchAllData();
});