document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken'); // Asegúrate de usar el mismo nombre de clave

    // Función para cargar órdenes de soporte
    const loadSupportOrders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/support/orders', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const orders = await response.json();
                renderSupportOrders(orders);
            } else {
                console.error('Error loading orders:', response.statusText);
                alert('No se pudieron cargar las órdenes. Verifique su conexión y permisos.');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            alert('Error al conectar con el servidor.');
        }
    };

    // Función para renderizar las órdenes de soporte
    const renderSupportOrders = (orders) => {
        const ordersContainer = document.getElementById('supportOrdersContainer');
        ordersContainer.innerHTML = '';

        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p class="text-center">No hay órdenes disponibles.</p>';
            return;
        }

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'card shadow-sm mb-3';

            // Determinar el tipo de transacción y asignar el texto apropiado
            const transactionType = order.type === 'order' ? 'Orden' : 'Apartado';

            orderCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${transactionType} ID: ${order.id}</h5>
                    <p class="card-text">Producto: ${order.product_name}</p>
                    <p class="card-text">Cantidad: ${order.cantidad}</p>
                    <p class="card-text">Total: $${parseFloat(order.total).toFixed(2)}</p> <!-- Asegurando que total es un número -->
                    <button class="btn btn-custom" onclick="viewOrderDetails(${order.id})">Ver Detalles</button>
                </div>
            `;
            ordersContainer.appendChild(orderCard);
        });
    };

    // Función para ver los detalles de la orden
    window.viewOrderDetails = (orderId) => {
        alert(`Mostrar detalles de la orden: ${orderId}`);
        // Aquí podrías implementar la lógica para mostrar un modal con más detalles si lo deseas.
    };

    loadSupportOrders();
});
