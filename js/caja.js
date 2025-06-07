document.addEventListener("DOMContentLoaded", () => {
    const balanceDia = document.getElementById("balanceDia");
    const filtroCaja = document.getElementById("filtroCaja");
    const cajaSection = document.getElementById("caja");
  
    // Crear tabla
    const tabla = document.createElement("table");
    tabla.className = "min-w-full bg-white  rounded-2xl dark:bg-gray-800  dark:border-gray-700 dark:text-gray-300";
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal dark:bg-gray-700 dark:text-gray-300">
        <th class="py-3 px-6 text-left rounded-tl-2xl">Fecha</th>
        <th class="py-3 px-6 text-left">Descripción</th>
        <th class="py-3 px-6 text-left">Tipo</th>
        <th class="py-3 px-6 text-right rounded-tr-2xl">Monto</th>
      </tr>
    `;
    tabla.appendChild(thead);
  
    const tbody = document.createElement("tbody");
    tabla.appendChild(tbody);
  
    cajaSection.appendChild(tabla);
  
    let movimientos = [];
  
    function cargarCaja() {
      fetch(`${API_BASE_URL}/api/caja`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Datos de caja:", data);
          movimientos = data.movimientos || [];
          balanceDia.textContent = `Balance: $${data.saldo}`;
          renderizarTabla();
        })
        .catch((error) => {
          console.error("Error al cargar la caja:", error);
        });
    }
  

    function renderizarTabla() {
      const filtro = filtroCaja.value;
      tbody.innerHTML = "";
  
      let filtrados = movimientos;
  
      if (filtro === "ventas") {
        filtrados = movimientos.filter((m) => m.tipo === "ingreso");
      } else if (filtro === "pagos") {
        filtrados = movimientos.filter((m) => m.tipo === "egreso");
      }
  
      filtrados.forEach((mov) => {
        const tr = document.createElement("tr");
        tr.className = "border-none border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";
        tr.innerHTML = `
          <td class="py-3 px-6 text-left ">${mov.fecha}</td>
          <td class="py-3 px-6 text-left">${mov.descripcion}</td>
          <td class="py-3 px-6 text-left capitalize">${mov.tipo}</td>
          <td class="py-3 px-6 text-right">$${mov.monto.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  
    filtroCaja.addEventListener("change", renderizarTabla);
  
    cargarCaja();
  });
  