document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const formTitle = document.getElementById('formTitle');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const registerSuccess = document.getElementById('registerSuccess');

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
        showRegister.classList.add('d-none');
        showLogin.classList.remove('d-none');
        formTitle.textContent = 'Registrarse';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('d-none');
        loginForm.classList.remove('d-none');
        showLogin.classList.add('d-none');
        showRegister.classList.remove('d-none');
        formTitle.textContent = 'Iniciar Sesión';
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
    
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
    
            if (response.ok) {
                // Asegúrate de almacenar el token con el nombre correcto
                localStorage.setItem('authToken', result.token);
                redirectToDashboard(result.role_name);
            } else {
                loginError.textContent = result.message;
                loginError.classList.remove('d-none');
            }
        } catch (error) {
            console.error('Error during login:', error);
            loginError.textContent = 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
            loginError.classList.remove('d-none');
        }
    });       

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('registerFullName').value;
        const phone = document.getElementById('registerPhone').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const gender = document.getElementById('registerGender').value;

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ full_name: fullName, phone, email, password, gender })
            });
            const result = await response.json();

            if (response.ok) {
                registerSuccess.textContent = 'Usuario registrado exitosamente. Por favor, inicia sesión.';
                registerSuccess.classList.remove('d-none');
                registerError.classList.add('d-none');
                registerForm.reset();
            } else {
                registerError.textContent = result.message;
                registerError.classList.remove('d-none');
                registerSuccess.classList.add('d-none');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            registerError.textContent = 'Error al registrar el usuario. Por favor, inténtalo de nuevo.';
            registerError.classList.remove('d-none');
            registerSuccess.classList.add('d-none');
        }
    });

    const redirectToDashboard = (role) => {
        switch(role) {
            case 'Administrador':
                window.location.href = 'admin.html';
                break;
            case 'Soporte':
                window.location.href = 'soporte-productos.html';
                break;
            case 'Usuario':
                window.location.href = 'ver-productos.html';
                break;
            default:
                console.error('Role desconocido:', role);
        }
    }
});
