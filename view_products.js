document.addEventListener('DOMContentLoaded', () => {
    // Función para cargar productos
    const loadProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'GET',
            });

            if (response.ok) {
                const products = await response.json();
                renderProducts(products);
            } else {
                console.error('Error loading products:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // Función para renderizar productos
    const renderProducts = (products) => {
        const productsContainer = document.getElementById('productsContainer');
        productsContainer.innerHTML = '';

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'col-md-4';

            productCard.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description.substring(0, 100)}...</p>
                        <button class="btn btn-custom" onclick="showProductDetails('${product.id}', '${product.name}', '${product.description}')">Ver Más</button>
                    </div>
                </div>
            `;

            productsContainer.appendChild(productCard);
        });
    };

    // Función para mostrar los detalles del producto en un modal
    window.showProductDetails = (id, name, description) => {
        document.getElementById('modalProductName').textContent = name;
        document.getElementById('modalProductDescription').textContent = description;
        
        const orderButton = document.getElementById('orderButton');
        const apartButton = document.getElementById('apartButton');
        
        orderButton.onclick = () => handleOrderOrApart('order', id);
        apartButton.onclick = () => handleOrderOrApart('apart', id);

        $('#productModal').modal('show');
    };

    // Función para manejar la acción de ordenar o apartar un producto
    const handleOrderOrApart = async (action, productId) => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            alert('Por favor, inicia sesión para realizar esta acción.');
            return;
        }

        const endpoint = action === 'order' ? 'order' : 'apart';

        try {
            const response = await fetch(`http://localhost:5000/api/products/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_id: productId })
            });

            if (response.ok) {
                alert(`Producto ${action === 'order' ? 'ordenado' : 'apartado'} exitosamente`);
            } else {
                console.error(`Error ${action}ing product:`, response.statusText);
                alert(`Error al ${action === 'order' ? 'ordenar' : 'apartar'} el producto`);
            }
        } catch (error) {
            console.error(`Error ${action}ing product:`, error);
            alert(`Error al ${action === 'order' ? 'ordenar' : 'apartar'} el producto`);
        }
    };

    loadProducts();
});