// compras.js

document.addEventListener("DOMContentLoaded", () => {
  const productosCompraContainer = document.getElementById("productosCompraContainer");
  const productosCompraSeleccionados = document.getElementById("productosCompraSeleccionados");
  const totalCompraCosto = document.getElementById("totalCompraCosto");
  const filtroCompraProductos = document.getElementById("filtroCompraProductos");
  const compraForm = document.getElementById("compraForm");
  const mensajeCompra = document.getElementById("mensajeCompra");

  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  let compras = [];

  let seleccionados = [];

  function renderProductosCompra(lista) {
    productosCompraContainer.innerHTML = "";
    lista.forEach(producto => {
      const card = document.createElement("div");
      card.className = "border rounded p-2 bg-white shadow";

      card.innerHTML = `
        <h5 class="font-bold text-gray-700">${producto.nombre}</h5>
        <p class="text-sm">Stock actual: ${producto.stock}</p>
        <p class="text-sm">Costo unitario: $${producto.precio}</p>
        <input type="number" placeholder="Cantidad" min="1" class="mt-2 w-full border rounded p-1 cantidadCompraInput" />
        <button class="mt-2 bg-blue-500 text-white px-2 py-1 rounded w-full agregarCompraBtn">Agregar</button>
      `;

      const input = card.querySelector(".cantidadCompraInput");
      const btn = card.querySelector(".agregarCompraBtn");

      btn.addEventListener("click", () => {
        const cantidad = parseInt(input.value);
        if (!cantidad || cantidad <= 0) return;

        const existe = seleccionados.find(p => p.id === producto.id);
        if (existe) {
          existe.cantidad += cantidad;
        } else {
          seleccionados.push({ ...producto, cantidad });
        }
        actualizarSeleccionados();
      });

      productosCompraContainer.appendChild(card);
    });
  }

  function actualizarSeleccionados() {
    productosCompraSeleccionados.innerHTML = "";
    let total = 0;

    seleccionados.forEach(p => {
      const item = document.createElement("div");
      item.className = "flex justify-between items-center border-b py-1";
      item.innerHTML = `
        <span>${p.nombre} x${p.cantidad}</span>
        <span>$${p.precio * p.cantidad}</span>
      `;
      productosCompraSeleccionados.appendChild(item);
      total += p.precio * p.cantidad;
    });

    totalCompraCosto.textContent = total;
  }

  filtroCompraProductos.addEventListener("input", e => {
    const filtro = e.target.value.toLowerCase();
    const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(filtro));
    renderProductosCompra(filtrados);
  });

  compraForm.addEventListener("submit", e => {
    e.preventDefault();
    if (seleccionados.length === 0) return;

    const descripcion = document.getElementById("descripcionCompra").value || "Compra de productos";
    const total = seleccionados.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

    // Actualizar productos en stock
    seleccionados.forEach(sel => {
      const prod = productos.find(p => p.id === sel.id);
      if (prod) prod.stock += sel.cantidad;
    });

    localStorage.setItem("productos", JSON.stringify(productos));

    // Registrar egreso en caja
    const caja = JSON.parse(localStorage.getItem("caja")) || [];
    caja.push({ tipo: "egreso", monto: total, descripcion, fecha: new Date().toISOString() });
    localStorage.setItem("caja", JSON.stringify(caja));

    mensajeCompra.textContent = "Compra registrada con éxito.";
    mensajeCompra.className = "text-green-600 font-bold mt-4";

    // Reset
    seleccionados = [];
    actualizarSeleccionados();
    compraForm.reset();
    renderProductosCompra(productos);
  });

  renderProductosCompra(productos);
});
