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
          <div class="text-red-600 font-semibold text-center">
            ❌ Error al cargar métricas: ${data.error || "Desconocido"}
          </div>`;
      return;
    }

    contenedor.innerHTML = `
        <div class="bg-gray-100 p-4 rounded-lg shadow-md">
          <p class="font-semibold">Total de Ventas:</p>
          <p class="text-xl">${data.total_ventas}</p>
        </div>
  
        <div class="bg-gray-100 p-4 rounded-lg shadow-md">
          <p class="font-semibold">Total de Ítems Vendidos:</p>
          <p class="text-xl">${data.total_items}</p>
        </div>
  
        <div class="bg-green-100 p-4 rounded-lg shadow-md">
          <p class="font-semibold">Producto más vendido:</p>
          <p class="text-xl">${data.producto_mas_vendido.nombre}</p>
          <p class="text-xl">Cantidad: ${data.producto_mas_vendido.cantidad}</p>
        </div>
  
        <div class="bg-yellow-100 p-4 rounded-lg shadow-md">
          <p class="font-semibold">Ventas por Día:</p>
          <ul class="list-disc pl-5 space-y-1">
            ${Object.entries(data.ventas_por_dia)
              .map(
                ([fecha, cantidad]) =>
                  `<li>${fecha}: <span class="font-medium">${cantidad} ventas</span></li>`
              )
              .join("")}
          </ul>
        </div>
      `;
  } catch (error) {
    contenedor.innerHTML = `
        <div class="text-red-600 font-semibold text-center">
          ⚠️ Error de conexión: ${error.message}
        </div>`;
  }
}

// Inicializar cuando cargue el documento
window.addEventListener("DOMContentLoaded", () => {
  const ultima = localStorage.getItem("ultimaSeccion") || "inicio";
  showSection(ultima);
  initDashboard(); // Cargar métricas simuladas
});
