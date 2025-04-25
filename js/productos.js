// Función para renderizar tarjetas de productos
function renderizarProductos(productos) {
    const contenedor = document.getElementById('contenedorProductos');
    contenedor.innerHTML = ''; // Limpiar contenido anterior

    productos.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'bg-white p-4 rounded shadow-md';

        tarjeta.innerHTML = `
            <h3 class="text-lg font-bold mb-2">${producto.nombre}</h3>
            <p class="text-sm mb-1"><strong>ID:</strong> ${producto.id}</p>
            <p class="text-sm mb-1"><strong>Descripción:</strong> ${producto.descripcion || 'Sin descripción'}</p>
            <p class="text-sm mb-1"><strong>Precio:</strong> $${producto.precio}</p>
            <p class="text-sm mb-3"><strong>Stock:</strong> ${producto.stock} unidades</p>
            <button class="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600">Editar</button>
        `;

        contenedor.appendChild(tarjeta);
    });
}

// Función para filtrar productos
function filtrarProductos(productos) {
    const input = document.getElementById('filtroProductos');
    input.addEventListener('input', () => {
        const texto = input.value.toLowerCase();
        const productosFiltrados = productos.filter(producto =>
            producto.nombre.toLowerCase().includes(texto)
        );
        renderizarProductos(productosFiltrados);
    });
}

// Función para inicializar todo
async function initProductos() {
    try {
        const response = await fetch('http://localhost:5000/api/productos');
        if (!response.ok) {
            throw new Error('Error al cargar los productos');
        }
        const productos = await response.json();
        renderizarProductos(productos);
        filtrarProductos(productos);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', initProductos);
