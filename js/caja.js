document.addEventListener("DOMContentLoaded", () => {
  const balanceDia = document.getElementById("balanceDia");
  const filtroCaja = document.getElementById("filtroCaja");
  const cajaSection = document.getElementById("caja");

  // Contenedor de la tabla
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

  // PAGINADOR
  const paginadorCaja = document.createElement("div");
  paginadorCaja.className = "flex justify-center mt-4";
  cajaSection.appendChild(paginadorCaja);

  // Variables globales para paginación y movimientos
  let movimientos = [];
  let paginaActualCaja = 1;
  let totalPaginasCaja = 1;
  const porPaginaCaja = 10;

  function cargarCaja(pagina = 1) {
    // Filtrado por tipo
    const filtro = filtroCaja.value;
    let url = `${API_BASE_URL}/api/caja?page=${pagina}&per_page=${porPaginaCaja}`;
    if (filtro === "ventas") url += "&tipo=ingreso";
    else if (filtro === "pagos") url += "&tipo=egreso";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        movimientos = data.movimientos || [];
        balanceDia.textContent = `Balance: $${data.saldo ?? 0}`;
        paginaActualCaja = data.page || 1;
        totalPaginasCaja = data.total_pages || 1;
        renderizarTabla();
        renderizarPaginadorCaja();
      })
      .catch((error) => {
        console.error("Error al cargar la caja:", error);
      });
  }

  function renderizarTabla() {
    tbody.innerHTML = "";

    let movimientosOrdenados = [...movimientos].sort((a, b) => {
      return new Date(b.fecha) - new Date(a.fecha);
    });

    movimientosOrdenados.forEach((mov) => {
      const tr = document.createElement("tr");
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
          <div class="absolute right-2 mt-1 hidden bg-white border border-gray-300 rounded shadow-lg z-10 menu-opciones dark:bg-gray-800">
  ${mov.tipo === "ingreso" && id
          ? `
      <button class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-100 generar-factura" data-id="${id}">
        Generar Factura
      </button>
      ${mov.factura_id
            ? `<a href="${API_BASE_URL}/api/facturas/pdf/${mov.factura_id}.pdf" target="_blank" class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-100">
              Descargar Factura
            </a>`
            : ""
          }
      <button class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700 eliminar-movimiento" data-id="${id}">
        Eliminar Movimiento
      </button>
      `
          : `
      <button class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700 eliminar-movimiento" data-id="${id}">
        Eliminar Movimiento
      </button>
      <div class="px-4 py-2 text-sm text-gray-400 dark:text-gray-500">Sin acciones</div>
      `
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

    // Event listener para eliminar movimiento con SweetAlert
    document.querySelectorAll(".eliminar-movimiento").forEach((btn) => {
      btn.addEventListener("click", () => {
        const movimientoId = btn.getAttribute("data-id");
        Swal.fire({
          title: "¿Eliminar movimiento?",
          text: "Esta acción no se puede deshacer.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#e53e3e",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar"
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(`${API_BASE_URL}/api/caja/movimiento/${movimientoId}`, {
              method: "DELETE",
            })
              .then((res) => res.json())
              .then((data) => {
                Swal.fire(
                  data.error ? "Error" : "Eliminado",
                  data.message || data.error || "Movimiento eliminado.",
                  data.error ? "error" : "success"
                );
                cargarCaja(paginaActualCaja);
              })
              .catch((err) => {
                Swal.fire("Error", "No se pudo eliminar el movimiento", "error");
                console.error(err);
              });
          }
        });
      });
    });

    // Factura
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
            cargarCaja(paginaActualCaja);
          })
          .catch((err) => {
            console.error("Error al generar la factura:", err);
            alert("Error al generar factura");
          });
      });
    });
  }

  function renderizarPaginadorCaja() {
    paginadorCaja.innerHTML = "";
    if (totalPaginasCaja <= 1) return;

    for (let i = 1; i <= totalPaginasCaja; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className =
        "px-3 py-1 rounded mx-1 " +
        (i === paginaActualCaja
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700");
      btn.onclick = () => {
        if (i !== paginaActualCaja) cargarCaja(i);
      };
      paginadorCaja.appendChild(btn);
    }
  }

  filtroCaja.addEventListener("change", () => cargarCaja(1));
  cargarCaja(1);
});
