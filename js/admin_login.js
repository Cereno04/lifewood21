 document.addEventListener('DOMContentLoaded', () => {
            const CORRECT_USERNAME = 'admin';
            const CORRECT_PASSWORD = 'password123';
            const loginForm = document.getElementById('loginForm');
            const errorMessage = document.getElementById('errorMessage');

            loginForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const username = event.target.username.value;
                const password = event.target.password.value;
                if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
                    // Redirect to the dashboard on successful login
                    window.location.href = 'admin_dashboard.html'; 
                } else {
                    errorMessage.textContent = 'Invalid username or password.';
                    errorMessage.style.display = 'block';
                }
            });
        });