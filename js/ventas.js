document.addEventListener("DOMContentLoaded", () => {
  const productosCardsContainer = document.getElementById("productosContainer");
  const seleccionadosContainer = document.getElementById("productosSeleccionados");
  const ventaForm = document.getElementById("ventaForm");
  const nuevaVentaSection = document.getElementById("nuevaVenta");

  // Estas variables controlan estado global
  let productosDisponibles = [];
  let productosSeleccionados = [];
  let paginaActual = 1;
  let totalPaginas = 1;
  const porPagina = 8;
  let ultimoFiltro = "";

  nuevaVentaSection.classList.remove("hidden");

  async function obtenerProductos(page = 1, search = "") {
    // Actualizar el estado global SIEMPRE que se pide algo
    paginaActual = page;
    ultimoFiltro = search;
    try {
      let url = `${API_BASE_URL}/api/productos?page=${page}&per_page=${porPagina}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error("Error al obtener productos");

      productosDisponibles = data.productos;
      totalPaginas = data.total_pages;

      renderizarCards(productosDisponibles);
      renderizarPaginadorProductos();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  }

  function renderizarPaginadorProductos() {
    const paginador = document.getElementById("paginadorProductosVenta");
    if (!paginador) return;
    paginador.innerHTML = "";
    if (totalPaginas <= 1) return;

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className =
        "px-3 py-1 rounded mx-1 " +
        (i === paginaActual
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700");
      btn.onclick = () => {
        if (i !== paginaActual) {
          obtenerProductos(i, ultimoFiltro);
        }
      };
      paginador.appendChild(btn);
    }
  }

  function filtrarProductos() {
    const input = document.getElementById("filtroProductos");
    input.addEventListener("input", () => {
      const texto = input.value.trim();
      // Pedimos SIEMPRE página 1 al filtrar
      obtenerProductos(1, texto);
    });
  }

  // Renderizar productos como Cards
  function renderizarCards(lista = productosDisponibles) {
    productosCardsContainer.innerHTML = "";
    productosCardsContainer.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

    lista.forEach((producto) => {
      const card = document.createElement("div");
      card.className = `
        bg-white border border-gray-200 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-transform duration-300 flex flex-col justify-between dark:bg-gray-800 dark:border-gray-700
      `;

      card.innerHTML = `
      <div class="mb-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">${producto.nombre}</h3>
        <div class="text-xs text-gray-500 mb-2">ID: <span class="font-semibold">${producto.id}</span></div>
        <div class="flex flex-wrap text-sm text-gray-700 dark:text-gray-300">
          <div class="mr-4">Talle: <b>${producto.talle}</b></div>
          <div>Stock: <b>${producto.stock}</b></div>
        </div>
        <div class="mt-2 text-2xl font-bold text-green-600">$${producto.precio}</div>
      </div>
      <button type="button" class="mt-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold text-base transition">Agregar</button>
    `;

      card.querySelector("button").onclick = () => agregarProducto(producto);
      productosCardsContainer.appendChild(card);
    });
  }

  function actualizarTotal() {
    let total = 0;
    seleccionadosContainer.querySelectorAll("div").forEach((div) => {
      const id = parseInt(div.dataset.productoId);
      const cantidad = parseInt(div.querySelector("input")?.value);
      const producto = productosDisponibles.find((p) => p.id === id);
      if (producto && cantidad > 0) {
        total += producto.precio * cantidad;
      }
    });
    document.getElementById("totalCompra").textContent = total.toFixed(2);
  }

  // Agregar producto seleccionado
  function agregarProducto(producto) {
    const yaAgregado = productosSeleccionados.find((p) => p.id === producto.id);
    if (yaAgregado) {
      const wrapperExistente = seleccionadosContainer.querySelector(
        `div[data-producto-id="${producto.id}"]`
      );
      const inputCantidad = wrapperExistente.querySelector("input");
      inputCantidad.value = parseInt(inputCantidad.value) + 1;
      actualizarTotal();
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "flex items-center gap-4 my-2 dark:bg-gray-800 dark:border-gray-700";
    wrapper.dataset.productoId = producto.id;

    const label = document.createElement("span");
    label.textContent = `${producto.nombre} - $${producto.precio}`;
    label.className = "w-64";

    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.value = "1";
    input.placeholder = "Cantidad";
    input.className = "w-24 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300";
    input.addEventListener("input", actualizarTotal);
    input.name = "cantidad";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "🗑️";
    removeBtn.className = "text-red-600 hover:text-red-800 font-bold text-lg";
    removeBtn.onclick = () => {
      wrapper.remove();
      productosSeleccionados = productosSeleccionados.filter(
        (p) => p.id !== producto.id
      );
      actualizarTotal();
    };

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);

    seleccionadosContainer.appendChild(wrapper);
    productosSeleccionados.push(producto);
    actualizarTotal();
  }

  // Enviar formulario de venta
  ventaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const items = [];
    seleccionadosContainer.querySelectorAll("div").forEach((div) => {
      const id = parseInt(div.dataset.productoId);
      const cantidad = parseInt(div.querySelector("input")?.value);
      if (id && cantidad && cantidad > 0) {
        items.push({ id, cantidad });
      }
    });

    // Validación mínima: debe haber al menos un producto y un método de pago
    const metodoPago = document.getElementById("metodoPago").value;
    if (items.length === 0 || !metodoPago) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Seleccioná al menos un producto y el método de pago.",
        confirmButtonColor: "#E52020",
      });
      return;
    }

    let total = 0;
    items.forEach((item) => {
      const producto = productosDisponibles.find((p) => p.id === item.id);
      if (producto) total += producto.precio * item.cantidad;
    });

    Swal.fire({
      title: "¿Confirmar venta?",
      html: `<b>Monto total:</b> $${total.toFixed(2)}<br><b>Método de pago:</b> ${metodoPago}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Recibí el pago",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#E52020",
      allowOutsideClick: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        const ventaData = { items, total, metodoPago };
        try {
          const res = await fetch(`${API_BASE_URL}/api/ventas/compras`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ventaData),
          });
          const data = await res.json();
          if (res.ok) {
            Swal.fire({
              icon: "success",
              title: "Venta registrada correctamente",
              text: `ID: ${data.venta?.id || "-"}`,
              confirmButtonColor: "#10b981"
            });
            seleccionadosContainer.innerHTML = "";
            productosSeleccionados = [];
            actualizarTotal();
            obtenerProductos(1, ""); // Volver a la primera página y sin filtro
            document.getElementById("metodoPago").value = "";
          } else {
            Swal.fire({
              icon: "error",
              title: "Error al registrar venta",
              text: data.error || "Ocurrió un error inesperado.",
              confirmButtonColor: "#E52020"
            });
          }
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#E52020"
          });
        }
      }
    });
  });

  // Inicialización
  async function initProductos() {
    await obtenerProductos(1, "");
    filtrarProductos();
  }
  initProductos();
});
