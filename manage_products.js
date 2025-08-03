document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');

    // Cargar productos al iniciar
    const loadProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const products = await response.json();
            if (response.ok) {
                renderProducts(products);
            } else {
                console.error('Error al cargar productos:', products.message);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // Función para renderizar productos
    const renderProducts = (products) => {
        const productList = document.getElementById('productList');
        productList.innerHTML = ''; // Limpiar lista actual
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('card', 'shadow-sm', 'mt-3');
            productCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text"><strong>Precio: </strong>$${product.price}</p>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct(${product.id})">Eliminar</button>
                    <button class="btn btn-outline-secondary btn-sm" data-toggle="modal" data-target="#editProductModal" onclick="prepareEditProduct(${product.id}, '${product.name}', '${product.description}', ${product.price})">Editar</button>
                </div>
            `;
            productList.appendChild(productCard);
        });
    };

    // Función para añadir producto
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('productName').value;
            const description = document.getElementById('productDescription').value;
            const price = document.getElementById('productPrice').value;

            try {
                const response = await fetch('http://localhost:5000/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name, description, price })
                });
                const result = await response.json();
                if (response.ok) {
                    addProductForm.reset();
                    loadProducts();
                } else {
                    console.error('Error adding product:', result.message);
                }
            } catch (error) {
                console.error('Error adding product:', error);
            }
        });
    }

    // Función para eliminar producto
    window.deleteProduct = async (productId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (response.ok) {
                loadProducts();
            } else {
                console.error('Error deleting product:', result.message);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    // Preparar producto para edición
    window.prepareEditProduct = (id, name, description, price) => {
        document.getElementById('editProductName').value = name;
        document.getElementById('editProductDescription').value = description;
        document.getElementById('editProductPrice').value = price;
        document.getElementById('editProductForm').dataset.productId = id;
    };

    // Función para editar producto
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = editProductForm.dataset.productId;
            const name = document.getElementById('editProductName').value;
            const description = document.getElementById('editProductDescription').value;
            const price = document.getElementById('editProductPrice').value;

            try {
                const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name, description, price })
                });
                const result = await response.json();
                if (response.ok) {
                    $('#editProductModal').modal('hide');
                    loadProducts();
                } else {
                    console.error('Error editing product:', result.message);
                }
            } catch (error) {
                console.error('Error editing product:', error);
            }
        });
    }

    loadProducts();
});
