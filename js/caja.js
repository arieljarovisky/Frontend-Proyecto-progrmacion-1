document.addEventListener("DOMContentLoaded", () => {
  const balanceDia = document.getElementById("balanceDia");
  const filtroCaja = document.getElementById("filtroCaja");
  const cajaSection = document.getElementById("caja");

  const tabla = document.createElement("table");
  tabla.className =
    "min-w-full bg-white rounded-2xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal dark:bg-gray-700 dark:text-gray-300">
      <th class="py-3 px-6 text-left rounded-tl-2xl">Fecha</th>
      <th class="py-3 px-6 text-left">Descripción</th>
      <th class="py-3 px-6 text-left">Tipo</th>
      <th class="py-3 px-6 text-right">Monto</th>
      <th class="py-3 px-6 text-center rounded-tr-2xl">Acciones</th>
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

    // Ordenar DESCENDENTE por fecha (más reciente primero)
    filtrados.sort((a, b) => {
      // Asumimos que mov.fecha es "YYYY-MM-DD HH:mm:ss"
      const fa = new Date(a.fecha);
      const fb = new Date(b.fecha);
      return fb - fa;
    });

    filtrados.forEach((mov) => {
      const tr = document.createElement("tr");
      console.log("movimiento:", mov.factura_id);
      tr.className =
        "border-none border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";

      const id = mov.id || "";

      tr.innerHTML = `
        <td class="py-3 px-6 text-left">${mov.fecha}</td>
        <td class="py-3 px-6 text-left">${mov.descripcion}</td>
        <td class="py-3 px-6 text-left capitalize">${mov.tipo}</td>
        <td class="py-3 px-6 text-right">$${mov.monto.toFixed(2)}</td>
        <td class="py-3 px-6 text-center relative">
          <div class="inline-block text-gray-600 cursor-pointer menu-toggle">⋮</div>
          <div class="absolute right-2 mt-1 hidden bg-white border border-gray-300 rounded shadow-lg z-10 menu-opciones">
            ${mov.tipo === "ingreso" && id
          ? `
        <button class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 generar-factura" data-id="${id}">
         Generar Factura
         </button>
        ${mov.factura_id
            ? `<a href="${API_BASE_URL}/api/facturas/pdf/${mov.factura_id}.pdf" target="_blank" class="block px-4 py-2 text-sm hover:bg-gray-100">
            Descargar Factura
            </a>`
            : ""
          }
       `
          : '<div class="px-4 py-2 text-sm text-gray-400">Sin acciones</div>'
        }
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });

    document.querySelectorAll(".menu-toggle").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const menu = e.target.nextElementSibling;
        document.querySelectorAll(".menu-opciones").forEach((m) => {
          if (m !== menu) m.classList.add("hidden");
        });
        menu.classList.toggle("hidden");
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.classList.contains("menu-toggle")) {
        document.querySelectorAll(".menu-opciones").forEach((menu) => {
          menu.classList.add("hidden");
        });
      }
    });

    document.querySelectorAll(".generar-factura").forEach((btn) => {
      btn.addEventListener("click", () => {
        const ventaId = btn.getAttribute("data-id");
        const cliente = prompt("Nombre del cliente:");
        if (!cliente) return alert("Debe ingresar un cliente");

        fetch(`${API_BASE_URL}/api/facturas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ venta_id: ventaId, cliente }),
        })
          .then((res) => res.json())
          .then((res) => {
            alert("Factura generada correctamente.");
            console.log("Factura generada:", res);
            cargarCaja();
          })
          .catch((err) => {
            console.error("Error al generar la factura:", err);
            alert("Error al generar factura");
          });
      });
    });
  }

  filtroCaja.addEventListener("change", renderizarTabla);
  cargarCaja();
});
