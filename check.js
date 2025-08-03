document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken'); // Cambia esto según cómo almacenes el token

    if (!token) {
        mostrarAccesoDenegado();
        return;
    }

    try {
        const decodedToken = parseJwt(token); // Función para decodificar el token JWT
        const userRole = decodedToken.role_name; // Asumiendo que el rol está en el token como role_name
        const currentPage = window.location.pathname.split('/').pop();

        if (!verificarAcceso(currentPage, userRole)) {
            mostrarAccesoDenegado();
        }
    } catch (error) {
        console.error('Error decodificando el token:', error);
        mostrarAccesoDenegado();
    }

    function mostrarAccesoDenegado() {
        document.body.innerHTML = ''; // Borra el contenido de la página
        const deniedMessage = document.createElement('div');
        deniedMessage.style.display = 'flex';
        deniedMessage.style.justifyContent = 'center';
        deniedMessage.style.alignItems = 'center';
        deniedMessage.style.height = '100vh';
        deniedMessage.style.fontSize = '24px';
        deniedMessage.style.color = '#ff0000';
        deniedMessage.innerHTML = 'Acceso Denegado: No tienes permisos para acceder a esta página.';
        document.body.appendChild(deniedMessage);
    }

    function verificarAcceso(pagina, rol) {
        const rolesPermitidos = {
            'ver-productos.html': ['Administrador', 'Soporte', 'Usuario', null],
            'admin.html': ['Administrador'],
            'gestionar-productos.html': ['Administrador', 'Soporte'],
            'soporte-productos.html': ['Administrador', 'Soporte']
        };

        return rolesPermitidos[pagina].includes(rol);
    }

    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }
});
