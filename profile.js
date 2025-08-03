document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');

    // Función para obtener los datos del usuario autenticado
    const fetchUserData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('User not logged in');
            }
            const userData = await response.json();
            return userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    };

    // Función para actualizar la interfaz de usuario del perfil
    const updateProfileUI = (userData) => {
        const profileName = document.getElementById('profileName');
        const profileModalName = document.getElementById('profileModalName');
        const profileModalEmail = document.getElementById('profileModalEmail');
        const profileModalRole = document.getElementById('profileModalRole');
        const adminPanelLink = document.getElementById('adminPanelLink');
        const userPanelLink = document.getElementById('userPanelLink');
        const supportPanelLink = document.getElementById('supportPanelLink');
        const logoutLink = document.getElementById('logoutLink');
        const loginButton = document.getElementById('loginButton');
        const profileButtonWrapper = document.getElementById('profileButtonWrapper');

        if (userData) {
            if (profileName) profileName.textContent = userData.full_name;
            if (profileModalName) profileModalName.textContent = userData.full_name;
            if (profileModalEmail) profileModalEmail.textContent = userData.email;
            if (profileModalRole) profileModalRole.textContent = userData.role_name;

            // Mostrar enlaces de panel según el rol del usuario
            if (userData.role_name === 'Administrador') {
                if (adminPanelLink) adminPanelLink.classList.remove('d-none');
                if (userPanelLink) userPanelLink.classList.remove('d-none');
                if (supportPanelLink) supportPanelLink.classList.remove('d-none');
            } else if (userData.role_name === 'Soporte') {
                if (supportPanelLink) supportPanelLink.classList.remove('d-none');
                if (userPanelLink) userPanelLink.classList.remove('d-none');
            } else {
                if (userPanelLink) userPanelLink.classList.remove('d-none');
            }

            if (logoutLink) logoutLink.classList.remove('d-none');
            if (loginButton) loginButton.classList.add('d-none');
            if (profileButtonWrapper) profileButtonWrapper.style.display = 'block';
        } else {
            if (profileName) profileName.textContent = '';
            if (profileModalName) profileModalName.textContent = '';
            if (profileModalEmail) profileModalEmail.textContent = '';
            if (profileModalRole) profileModalRole.textContent = '';
            if (adminPanelLink) adminPanelLink.classList.add('d-none');
            if (supportPanelLink) supportPanelLink.classList.add('d-none');
            if (userPanelLink) userPanelLink.classList.add('d-none');
            if (logoutLink) logoutLink.classList.add('d-none');
            if (loginButton) loginButton.classList.remove('d-none');
            if (profileButtonWrapper) profileButtonWrapper.style.display = 'none';
        }
    };

    // Función para mostrar el modal de perfil
    const showProfileModal = async () => {
        const userData = await fetchUserData();
        updateProfileUI(userData);
        if (userData) {
            $('#profileModal').modal('show');
        }
    };

    // Función para cerrar sesión
    const logout = async () => {
        localStorage.removeItem('authToken'); // Remover el token JWT al cerrar sesión
        await fetch('http://localhost:5000/api/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        window.location.href = '../html/login.html';
    };

    const profileButton = document.getElementById('profileButton');
    const logoutLinkElement = document.getElementById('logoutLink');
    
    if (profileButton) {
        profileButton.addEventListener('click', showProfileModal);
    }
    
    if (logoutLinkElement) {
        logoutLinkElement.addEventListener('click', logout);
    }

    (async () => {
        const userData = await fetchUserData();
        updateProfileUI(userData);
    })();
});
