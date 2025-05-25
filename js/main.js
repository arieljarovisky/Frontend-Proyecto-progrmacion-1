// Función para mostrar la sección seleccionada y ocultar las demás
function showSection(sectionId) {
  const sections = document.querySelectorAll("main > section");
  const buttons = document.querySelectorAll("aside button");

  sections.forEach((section) => {
    if (section.id === sectionId) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  });

  buttons.forEach((button) => {
    if (button.getAttribute("onclick")?.includes(sectionId)) {
      button.classList.add("bg-blue-500", "text-white");
      button.classList.remove("text-gray-700", "hover:bg-blue-100");
    } else {
      button.classList.remove("bg-blue-500", "text-white");
      button.classList.add("text-gray-700", "hover:bg-blue-100");
    }
  });

  localStorage.setItem("ultimaSeccion", sectionId); // ✅ Guardar la última sección
  initDashboard();
}
// Función para actualizar el color del balance
function updateBalanceDisplay(balance) {
  const balanceCaja = document.getElementById("balanceCaja");
  const balanceValor = document.getElementById("balanceValor");

  balanceValor.textContent = `$${balance}`;

  if (balance >= 0) {
    balanceCaja.classList.remove("bg-red-200", "text-red-800");
    balanceCaja.classList.add("bg-green-200", "text-green-800");
  } else {
    balanceCaja.classList.remove("bg-green-200", "text-green-800");
    balanceCaja.classList.add("bg-red-200", "text-red-800");
  }
}

async function initDashboard() {
  const contenedor = document.getElementById("metricas");

  try {
    const response = await fetch(`${API_BASE_URL}/api/ventas/metricas`);
    const data = await response.json();

    if (!response.ok) {
      contenedor.innerHTML = `
        <div class="text-red-600 font-semibold text-center col-span-4">
          ❌ Error al cargar métricas: ${data.error || "Desconocido"}
        </div>`;
      return;
    }

    // Limpiar contenedor y reestablecer clase
    contenedor.innerHTML = "";
    contenedor.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6";

    // Tarjeta Balance
    // Balance real usando ingresos y pagos
    const balance = data.total_ingresos - data.total_egresos;

    const divBalance = document.createElement("div");
    divBalance.className = "bg-white shadow rounded p-4";
    divBalance.id = "balanceCaja"; // <- necesario para aplicar color dinámico
    divBalance.innerHTML = `
  <h3 class="text-gray-600 text-sm">Balance</h3>
  <p id="balanceValor" class="text-xl font-bold">$${balance.toFixed(2)}</p>
`;

    contenedor.appendChild(divBalance);
    updateBalanceDisplay(balance); // <-  color rojo o verde dependiendo del balance


    // Tarjeta Ventas / Pagos
    const ventasPagos = document.createElement("div");
    ventasPagos.className = "bg-white shadow rounded p-4";
    ventasPagos.innerHTML = `
      <h3 class="text-gray-600 text-sm">Total Ventas</h3>
      <p class="text-xl font-semibold">${data.total_ventas}</p>
      <h3 class="text-gray-600 text-sm mt-2">Total Pagos</h3>
      <p class="text-xl font-semibold">${data.total_pagos}</p>
    `;
    contenedor.appendChild(ventasPagos);

    // Producto más vendido
    contenedor.appendChild(createCard(
      "Producto más vendido",
      `${data.producto_mas_vendido.nombre}<br><span class='text-sm text-gray-500'>Cantidad: ${data.producto_mas_vendido.cantidad}</span>`
    ));

    // Borrar secciones extra anteriores si existen
    const seccionesAnteriores = document.getElementById("extra-dashboard");
    if (seccionesAnteriores) seccionesAnteriores.remove();

    // Crear secciones extra
    const extraContent = document.createElement("div");
    extraContent.id = "extra-dashboard";
    extraContent.className = "col-span-full mt-6 space-y-6";

    extraContent.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white shadow rounded p-4">
          <h4 class="text-lg font-semibold mb-2">Ventas Semanales</h4>
          <canvas id="ventasChart" height="180"></canvas>
        </div>
        <div class="bg-white shadow rounded p-4">
          <h4 class="text-lg font-semibold mb-2">Ingresos vs Egresos ($)</h4>
          <canvas id="ingresosEgresosChart" height="180"></canvas>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white shadow rounded p-4">
          <h4 class="text-lg font-semibold mb-2">Productos con bajo stock</h4>
          <ul class="list-disc list-inside text-sm text-gray-700">
            <li>Alcohol en gel - Cant: 4</li>
            <li>Guantes - Cant: 3</li>
            <li>Mascarillas - Cant: 6</li>
          </ul>
        </div>
        <div class="bg-white shadow rounded p-4">
          <h4 class="text-lg font-semibold mb-2">Productos con vencimiento próximo</h4>
          <ul class="list-disc list-inside text-sm text-gray-700">
            <li>Vacuna Rabia - 2025-06-10</li>
            <li>Desinfectante - 2025-06-15</li>
            <li>Suero Oral - 2025-06-22</li>
          </ul>
        </div>
      </div>
    `;
    contenedor.parentElement.appendChild(extraContent);

    renderVentasChart(data.ventas_por_dia);
    renderIngresosVsEgresosChart(data.total_ventas * 1000, 200); // simulado

  } catch (error) {
    contenedor.innerHTML = `
      <div class="text-red-600 font-semibold text-center col-span-4">
        ⚠️ Error de conexión: ${error.message}
      </div>`;
  }
}

// Función utilitaria
function createCard(titulo, contenido, extraClass = "") {
  const div = document.createElement("div");
  div.className = "bg-white shadow rounded p-4";
  div.innerHTML = `
    <h3 class="text-gray-600 text-sm">${titulo}</h3>
    <p class="text-xl font-bold ${extraClass}">${contenido}</p>
  `;
  return div;
}

window.addEventListener("DOMContentLoaded", () => {
  const ultima = localStorage.getItem("ultimaSeccion") || "inicio";
  showSection(ultima);
  initDashboard();
});

