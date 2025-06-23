document.addEventListener("DOMContentLoaded", () => {
  const productosCardsContainer = document.getElementById("productosContainer"); // donde se mostrarán las cards
  const seleccionadosContainer = document.getElementById("productosSeleccionados"); // contenedor para productos seleccionados
  const ventaForm = document.getElementById("ventaForm");
  const mensajeDiv = document.getElementById("mensaje");
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
      mensajeDiv.textContent = err.message;
      mensajeDiv.className = "text-red-500";
    }
  }

  function filtrarProductos() {
    const input = document.getElementById("filtroProductos");

    input.addEventListener("input", () => {
      console.log("Filtrando productos...");
      const texto = input.value.toLowerCase();
      const productosFiltrados = productosDisponibles.filter((producto) =>
        producto.nombre.toLowerCase().includes(texto)
      );
      renderizarCards(productosFiltrados);
    });
  }

  // Renderizar productos como cards
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
      mensajeDiv.textContent = ""; // Limpiar mensaje si existía uno previo
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
    let valido = true;

    seleccionadosContainer.querySelectorAll("div").forEach((div) => {
      const id = parseInt(div.dataset.productoId);
      const cantidad = parseInt(div.querySelector("input")?.value);

      if (!id || !cantidad || cantidad < 1) {
        valido = false;
      } else {
        const producto = productosDisponibles.find((p) => p.id === id);
        if (producto) {
          items.push({ id: producto.id, nombre: producto.nombre, cantidad });
        }
      }
    });

    if (!valido || items.length === 0) {
      mensajeDiv.textContent =
        "Todos los campos deben estar completos y válidos.";
      mensajeDiv.className = "text-red-500";
      return;
    }

    let total = 0;
    items.forEach((item) => {
      const producto = productosDisponibles.find((p) => p.id === item.id);
      if (producto) total += producto.precio * item.cantidad;
    });

    // Obtener método de pago
    const metodoPago = document.getElementById("metodoPago").value;
    if (!metodoPago) {
      mensajeDiv.textContent = "Seleccioná un método de pago.";
      mensajeDiv.className = "text-red-500";
      return;
    }

    // Confirmación con SweetAlert2
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
        // Registro de venta
        const ventaData = { items, total, metodoPago };
        try {
          const res = await fetch(`${API_BASE_URL}/api/ventas/compras`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ventaData),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Error al registrar la venta");

          mensajeDiv.textContent = `✅ Venta registrada correctamente (ID: ${data.venta?.id || "-"})`;
          mensajeDiv.className = "text-green-600";
          seleccionadosContainer.innerHTML = "";
          productosSeleccionados = [];
          actualizarTotal();
          obtenerProductos();
          document.getElementById("metodoPago").value = "";
        } catch (err) {
          mensajeDiv.textContent = `❌ ${err.message}`;
          mensajeDiv.className = "text-red-500";
        }
      } else {
        mensajeDiv.textContent = "Venta no registrada. Debés confirmar el pago para finalizar.";
        mensajeDiv.className = "text-yellow-500";
      }
    });
  });

  // Inicialización
  async function initProductos() {
    try {
      await obtenerProductos(); // esto ya llama a renderizarCards()
      filtrarProductos();
    } catch (error) {
      console.error("Error:", error);
    }
  }
  initProductos();
});
