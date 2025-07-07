let productosGlobal = [];
let paginaActual = 1;
let totalPaginas = 1;
const porPagina = 9;
let ultimoFiltro = "";


// Función para renderizar tarjetas de productos
function renderizarProductos(productos) {
    const contenedor = document.getElementById('contenedorProductos');
    contenedor.innerHTML = ''; // Limpia contenido anterior

    productos.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'bg-white p-4 rounded-2xl shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300';

        tarjeta.innerHTML = `
            <h3 class="text-lg font-bold mb-2">${producto.nombre}</h3>
            <p class="text-sm mb-1"><strong>ID:</strong> ${producto.id}</p>
            <p class="text-sm mb-1"><strong>Descripción:</strong> ${producto.descripcion || 'Sin descripción'}</p>
            <p class="text-sm mb-1"><strong>Precio:</strong> $${producto.precio}</p>
            <p class="text-sm mb-3"><strong>Stock:</strong> ${producto.stock} unidades</p>
            <button class="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 mr-2 editar-btn">Editar</button>
            <button class="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 eliminar-btn">Eliminar</button>
        `;

        const btnEliminar = tarjeta.querySelector('.eliminar-btn');
        btnEliminar.addEventListener('click', async () => {
            // Confirmación con SweetAlert (opcional)
            const resultado = await Swal.fire({
                title: '¿Estás seguro?',
                text: "¡Esta acción eliminará el producto permanentemente!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });
            if (resultado.isConfirmed) {
                await eliminarProducto(producto.id);
            }
        });

        const btnEditar = tarjeta.querySelector('.editar-btn');
        btnEditar.addEventListener('click', () => {
            editarProductoPopup(producto);
        });

        contenedor.appendChild(tarjeta);
    });
}

// Función para agregar productos
function agregarProductoPopup() {
    Swal.fire({
        title: 'Agregar Producto',
        html: `
            <div style="text-align:left">
                <label for="swal-nombre">Nombre:</label>
                <input id="swal-nombre" class="swal2-input" placeholder="Nombre del producto">
                <label for="swal-descripcion">Descripción:</label>
                <input id="swal-descripcion" class="swal2-input" placeholder="Descripción del producto">
                <label for="swal-precio">Precio:</label>
                <input id="swal-precio" type="number" class="swal2-input" placeholder="Precio ($)">
                <label for="swal-stock">Stock:</label>
                <input id="swal-stock" type="number" class="swal2-input" placeholder="Stock (unidades)">
                <label for="swal-stock-minimo">Stock Mínimo de Alerta:</label>
                <input id="swal-stock-minimo" type="number" min="0" class="swal2-input" placeholder="Ej: 5">
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nombre = document.getElementById('swal-nombre').value;
            const descripcion = document.getElementById('swal-descripcion').value;
            const precio = parseFloat(document.getElementById('swal-precio').value);
            const stock = parseInt(document.getElementById('swal-stock').value);
            const stockMinimo = parseInt(document.getElementById('swal-stock-minimo').value) || 5;
            if (!nombre || isNaN(precio) || isNaN(stock)) {
                Swal.showValidationMessage('Todos los campos obligatorios deben estar completos.');
                return false;
            }
            return { nombre, descripcion, precio, stock, stockMinimo };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            agregarProducto(result.value);
        }
    });
}

// Función para filtrar productos
function filtrarProductos(productos) {
    const input = document.getElementById('filtroProductosVista');
    input.addEventListener('input', () => {
        const texto = input.value.toLowerCase();
        const productosFiltrados = productosGlobal.filter(producto =>
            producto.nombre.toLowerCase().includes(texto)
        );
        renderizarProductos(productosFiltrados);
    });
}

// Función para eliminar productos
async function eliminarProducto(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/productos/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar producto');
        // Actualizá la lista de productos
        productosGlobal = productosGlobal.filter(prod => prod.id !== id);
        renderizarProductos(productosGlobal);
        Swal.fire('Eliminado', 'El producto fue eliminado correctamente.', 'success');
    } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
    }
}

// popup para editar productos
function editarProductoPopup(producto) {
    Swal.fire({
        title: 'Editar Producto',
        html: `
            <div style="text-align:left">
                <label for="swal-input-nombre">Nombre:</label>
                <input id="swal-input-nombre" class="swal2-input" value="${producto.nombre}">
                <label for="swal-input-descripcion">Descripción:</label>
                <input id="swal-input-descripcion" class="swal2-input" value="${producto.descripcion}">
                <label for="swal-input-precio">Precio:</label>
                <input id="swal-input-precio" type="number" class="swal2-input" value="${producto.precio}">
                <label for="swal-input-stock">Stock:</label>
                <input id="swal-input-stock" type="number" class="swal2-input" value="${producto.stock}"><br>
                <label for="swal-input-stock-minimo">Stock Mínimo de Alerta:</label>
                <input id="swal-input-stock-minimo" type="number" min="0" class="swal2-input" value="${producto.stock_minimo || 5}">
            </div>
        `,

        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                nombre: document.getElementById('swal-input-nombre').value,
                descripcion: document.getElementById('swal-input-descripcion').value,
                precio: parseFloat(document.getElementById('swal-input-precio').value),
                stock: parseInt(document.getElementById('swal-input-stock').value),
                stock_minimo: parseInt(document.getElementById('swal-input-stock-minimo').value) || 5
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            editarProducto(producto.id, result.value);
        }
    });
}


// Función para editar productos
async function editarProducto(id, datos) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/productos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (!response.ok) {
            Swal.fire('Error', data.error || 'No se pudo editar el producto', 'error');
            return;
        }
        // Actualizá productosGlobal y la vista (idealmente, pedí de nuevo la lista al back)
        await refrescarProductos();
        Swal.fire('Guardado', 'El producto fue editado correctamente.', 'success');
    } catch (error) {
        Swal.fire('Error', 'No se pudo editar el producto.', 'error');
    }
}

async function agregarProducto(datos) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (!response.ok) {
            Swal.fire('Error', data.error || 'No se pudo agregar el producto', 'error');
            return;
        }
        await refrescarProductos();
        Swal.fire('Agregado', 'El producto fue creado correctamente.', 'success');
    } catch (error) {
        Swal.fire('Error', 'No se pudo agregar el producto.', 'error');
    }
}

function renderizarPaginadorProductos() {
    const paginador = document.getElementById("paginadorProductosVista");
    if (!paginador) return;

    paginador.innerHTML = "";
    if (totalPaginas <= 1) return;

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "px-3 py-1 rounded mx-1 " + (i === paginaActual ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700");
        btn.onclick = () => {
            if (i !== paginaActual) {
                initProductos(i, ultimoFiltro);
            }
        };
        paginador.appendChild(btn);
    }
}


// Función para inicializar todo
async function initProductos(pagina = 1, filtro = "") {
    try {
        let url = `${API_BASE_URL}/api/productos?page=${pagina}&per_page=${porPagina}`;
        if (filtro) url += `&search=${encodeURIComponent(filtro)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) throw new Error('Error al cargar los productos');
        productosGlobal = data.productos;
        paginaActual = data.page;
        totalPaginas = data.total_pages;

        renderizarProductos(productosGlobal);
        renderizarPaginadorProductos();
    } catch (error) {
        console.error('Error:', error);
    }
}

function setFiltroListener() {
    const input = document.getElementById('filtroProductosVista');
    if (!input) return;
    input.addEventListener('input', () => {
        ultimoFiltro = input.value.trim();
        initProductos(1, ultimoFiltro); // Siempre vuelve a página 1 cuando se filtra
    });
}


// Función para refrescar productos
async function refrescarProductos() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/productos`);
        productosGlobal = await response.json();
        renderizarProductos(productosGlobal);
    } catch (error) {
        console.error('Error al refrescar productos:', error);
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    initProductos();
    setFiltroListener();
    const btnAgregar = document.getElementById('btnAgregarProducto');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', agregarProductoPopup);
    }
});

