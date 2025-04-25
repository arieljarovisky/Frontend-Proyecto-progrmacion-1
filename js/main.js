// Función para mostrar la sección seleccionada y ocultar las demás
function showSection(sectionId) {
    const sections = document.querySelectorAll('main > section');
    const buttons = document.querySelectorAll('aside button');

    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });

    buttons.forEach(button => {
        if (button.getAttribute('onclick')?.includes(sectionId)) {
            button.classList.add('bg-blue-500', 'text-white');
            button.classList.remove('text-gray-700', 'hover:bg-blue-100');
        } else {
            button.classList.remove('bg-blue-500', 'text-white');
            button.classList.add('text-gray-700', 'hover:bg-blue-100');
        }
    });
}

// Función para actualizar el color del balance
function updateBalanceDisplay(balance) {
    const balanceCaja = document.getElementById('balanceCaja');
    const balanceValor = document.getElementById('balanceValor');

    balanceValor.textContent = `$${balance}`;

    if (balance >= 0) {
        balanceCaja.classList.remove('bg-red-200', 'text-red-800');
        balanceCaja.classList.add('bg-green-200', 'text-green-800');
    } else {
        balanceCaja.classList.remove('bg-green-200', 'text-green-800');
        balanceCaja.classList.add('bg-red-200', 'text-red-800');
    }
}

// Función para cargar métricas simuladas en el dashboard
function initDashboard() {
    // Datos simulados
    const ventasCantidad = 8;
    const ventasTotal = 25000;
    const pagosCantidad = 3;
    const pagosTotal = 70000;
    const balance = ventasTotal - pagosTotal;

    // Actualizar métricas
    document.getElementById('ventasResumen').textContent = `${ventasCantidad} ventas / $${ventasTotal}`;
    document.getElementById('pagosResumen').textContent = `${pagosCantidad} pagos / $${pagosTotal}`;

    updateBalanceDisplay(balance);

    // Stock bajo simulado
    const stockBajoProductos = ['Producto A', 'Producto B', 'Producto C'];
    const stockBajoUl = document.getElementById('stockBajo');
    stockBajoUl.innerHTML = '';
    stockBajoProductos.forEach(producto => {
        const li = document.createElement('li');
        li.textContent = producto;
        stockBajoUl.appendChild(li);
    });
}

// Inicializar cuando cargue el documento
window.addEventListener('DOMContentLoaded', () => {
    showSection('inicio'); // Mostrar panel de control al iniciar
    initDashboard();       // Cargar métricas simuladas
});
