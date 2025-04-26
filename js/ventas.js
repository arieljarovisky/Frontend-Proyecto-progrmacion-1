document.addEventListener("DOMContentLoaded", () => {
  const productosContainer = document.getElementById("productosContainer");
  const agregarProductoBtn = document.getElementById("agregarProducto");
  const ventaForm = document.getElementById("ventaForm");
  const mensajeDiv = document.getElementById("mensaje");
  const nuevaVentaSection = document.getElementById("nuevaVenta");

  let productosDisponibles = [];

  // Mostrar sección
  nuevaVentaSection.classList.remove("hidden");

  // Traer productos del backend
  async function obtenerProductos() {
    try {
      const res = await fetch("http://192.168.1.8:5000/api/productos");
      productosDisponibles = await res.json();
      if (!res.ok) throw new Error("Error al obtener productos");
      agregarProducto(); // Agregar el primer producto al inicio
    } catch (err) {
      mensajeDiv.textContent = err.message;
      mensajeDiv.className = "text-red-500";
    }
  }

  // Crear un selector de producto + cantidad
  function crearProductoSelect() {
    const wrapper = document.createElement("div");
    wrapper.className = "flex items-center gap-4";

    const select = document.createElement("select");
    select.className = "w-full px-3 py-2 border rounded";
    select.name = "producto";
    select.innerHTML =
      `<option value="">Seleccione un producto</option>` +
      productosDisponibles
        .map(
          (p) => `<option value="${p.id}">${p.nombre} - $${p.precio}</option>`
        )
        .join("");

    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.placeholder = "Cantidad";
    input.className = "w-32 px-3 py-2 border rounded";
    input.name = "cantidad";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "🗑️";
    removeBtn.className = "text-red-600 hover:text-red-800 font-bold text-lg";
    removeBtn.onclick = () => wrapper.remove();

    wrapper.appendChild(select);
    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);

    return wrapper;
  }

  // Agregar un nuevo producto al form
  function agregarProducto() {
    productosContainer.appendChild(crearProductoSelect());
  }

  agregarProductoBtn.addEventListener("click", () => agregarProducto());

  // Enviar formulario de venta
  ventaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const items = [];
    let valido = true;

    productosContainer.querySelectorAll("div").forEach((div) => {
      const id = div.querySelector("select")?.value;
      const cantidad = parseInt(div.querySelector("input")?.value);

      if (!id || !cantidad || cantidad < 1) {
        valido = false;
      } else {
        const producto = productosDisponibles.find(
          (p) => p.id === parseInt(id)
        );
        if (producto) {
          items.push({
            id: producto.id,
            nombre: producto.nombre, // 👈 Se agrega el nombre aquí
            cantidad,
          });
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

    items.forEach(item => {
      const producto = productosDisponibles.find(p => p.id === item.id);
      if (producto) {
        total += producto.precio * item.cantidad;
      }
    });
    
    const ventaData = {
      items,
      total
    };

    try {
      const res = await fetch("http://192.168.1.8:5000/api/ventas/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ventaData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al registrar la venta");

      mensajeDiv.textContent = `✅ Venta registrada correctamente (ID: ${data.venta_id})`;
      mensajeDiv.className = "text-green-600";

      productosContainer.innerHTML = "";
      agregarProducto(); // resetear formulario
    } catch (err) {
      mensajeDiv.textContent = `❌ ${err.message}`;
      mensajeDiv.className = "text-red-500";
    }
  });

  obtenerProductos();
});
