document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("metricas");
  
    try {
      const response = await fetch("http://192.168.1.8:5000/api/ventas/metricas");
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
              .map(([fecha, cantidad]) => `<li>${fecha}: <span class="font-medium">${cantidad} ventas</span></li>`)
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
  });
  