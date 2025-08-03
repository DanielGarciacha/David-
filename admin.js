document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');

    const loadProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (response.ok) {
                const profileName = document.getElementById('profileName');
                const profileButtonWrapper = document.getElementById('profileButtonWrapper');

                if (profileName && profileButtonWrapper) {
                    profileName.textContent = data.full_name;
                    profileButtonWrapper.style.display = 'block';
                }
            } else {
                console.error('Error loading profile:', data.message);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const loadData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/usuarios', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            const adminTableBody = document.getElementById('adminTableBody');

            if (adminTableBody) {
                adminTableBody.innerHTML = '';
                data.admins.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.full_name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone}</td>
                        <td>${user.gender}</td>
                        <td>${user.role_name}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Eliminar</button>
                        </td>
                    `;
                    adminTableBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    window.deleteUser = (userId) => {
        const deleteUserId = document.getElementById('deleteUserId');
        if (deleteUserId) {
            deleteUserId.value = userId;
            $('#deleteConfirmModal').modal('show');
        }
    };

    window.confirmDeleteUser = async () => {
        const userId = document.getElementById('deleteUserId').value;
        try {
            const response = await fetch(`http://localhost:5000/api/usuarios/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            $('#deleteConfirmModal').modal('hide');
            if (response.ok) {
                showSuccessModal(result.message);
                loadData();
            } else {
                showErrorModal(result.message);
            }
        } catch (error) {
            showErrorModal('Error al eliminar el usuario.');
            console.error('Error deleting user:', error);
        }
    };

    const registerUserForm = document.getElementById('registerUserForm');
    if (registerUserForm) {
        registerUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('registerFullName').value;
            const phone = document.getElementById('registerPhone').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const gender = document.getElementById('registerGender').value;
            const roleId = document.getElementById('registerRole').value;

            try {
                const response = await fetch('http://localhost:5000/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ full_name: fullName, phone, email, password, gender, role_id: roleId })
                });
                const result = await response.json();
                if (response.ok) {
                    showSuccessModal(result.message);
                    registerUserForm.reset();
                    loadData();
                } else {
                    showErrorModal(result.message);
                }
            } catch (error) {
                showErrorModal('Error al registrar el usuario.');
                console.error('Error registering user:', error);
            }
        });
    }

    const showSuccessModal = (message) => {
        const successModalBody = document.getElementById('successModalBody');
        if (successModalBody) {
            successModalBody.textContent = message;
            $('#successModal').modal('show');
        }
    };

    const showErrorModal = (message) => {
        const errorModalBody = document.getElementById('errorModalBody');
        if (errorModalBody) {
            errorModalBody.textContent = message;
            $('#errorModal').modal('show');
        }
    };

    const loadChartData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/statistics', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            renderCharts(data);

        } catch (error) {
            console.error('Error loading chart data:', error);
        }
    };

    const renderCharts = (data) => {
        const ctxNewUsers = document.getElementById('newUsersChart').getContext('2d');
        new Chart(ctxNewUsers, {
            type: 'line',
            data: {
                labels: data.recent_users_by_month.map(item => item.month),
                datasets: [{
                    label: 'Usuarios Nuevos',
                    data: data.recent_users_by_month.map(item => item.count),
                    borderColor: '#dc3545',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        const ctxProducts = document.getElementById('productsChart').getContext('2d');
        new Chart(ctxProducts, {
            type: 'line',
            data: {
                labels: data.recent_products_by_month.map(item => item.month),
                datasets: [{
                    label: 'Productos',
                    data: data.recent_products_by_month.map(item => item.count),
                    borderColor: '#007bff',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        const ctxOrders = document.getElementById('ordersChart').getContext('2d');
        new Chart(ctxOrders, {
            type: 'bar',
            data: {
                labels: data.orders_by_month.map(item => item.month),
                datasets: [{
                    label: 'Órdenes',
                    data: data.orders_by_month.map(item => item.count),
                    backgroundColor: '#ffc107'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        const ctxSales = document.getElementById('salesChart').getContext('2d');
        new Chart(ctxSales, {
            type: 'bar',
            data: {
                labels: data.sales_by_month.map(item => item.month),
                datasets: [{
                    label: 'Ventas',
                    data: data.sales_by_month.map(item => item.total),
                    backgroundColor: '#28a745'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    loadProfile();
    loadData();
    loadChartData();
});
