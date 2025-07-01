document.addEventListener("DOMContentLoaded", () => {
  const productosCardsContainer = document.getElementById("productosContainer"); // donde se mostrarán las cards
  const seleccionadosContainer = document.getElementById("productosSeleccionados"); // contenedor para productos seleccionados
  const ventaForm = document.getElementById("ventaForm");
  const nuevaVentaSection = document.getElementById("nuevaVenta");

  let productosDisponibles = [];
  let productosSeleccionados = [];

  nuevaVentaSection.classList.remove("hidden");

  async function obtenerProductos() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/productos`);
      productosDisponibles = await res.json();
      if (!res.ok) throw new Error("Error al obtener productos");
      renderizarCards();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  }

  function filtrarProductos() {
    const input = document.getElementById("filtroProductos");

    input.addEventListener("input", () => {
      const texto = input.value.toLowerCase();
      const productosFiltrados = productosDisponibles.filter((producto) =>
        producto.nombre.toLowerCase().includes(texto)
      );
      renderizarCards(productosFiltrados);
    });
  }

  // Renderizar productos como Cards
  function renderizarCards(lista = productosDisponibles) {
    productosCardsContainer.innerHTML = "";

    lista.forEach((producto) => {
      const card = document.createElement("div");
      card.className = `
      w-40 h-60 bg-white border border-gray-200 rounded-xl shadow-md p-4 m-2 
      hover:shadow-lg hover:scale-105 transition-transform duration-300
      flex flex-col justify-between dark:bg-gray-800 dark:border-gray-700
      `;

      card.innerHTML = `
      <div>
        <h3 class="text-md font-semibold text-gray-800 dark:text-white">${producto.nombre}</h3>
        <p class="text-gray-600 mt-1 mb-2 dark:text-gray-400">Talle: <span class="font-medium text-black-600">${producto.talle}</span></p>
        <p class="text-gray-600 mt-1 mb-2 dark:text-gray-400">Precio: <span class="font-medium text-green-600">$${producto.precio}</span></p>
        <p class="text-gray-600 mt-1 mb-2 dark:text-gray-400">Stock: <span class="font-medium text-black-600">${producto.stock}</span></p>
      </div>
      <button type="button" class="mt-auto bg-blue-600 rounded-2xl hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium dark:bg-blue-500">
       Agregar
      </button>
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
        // Enviamos la venta al backend
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
            obtenerProductos();
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
    try {
      await obtenerProductos();
      filtrarProductos();
    } catch (error) {
      console.error("Error:", error);
    }
  }
  initProductos();
});