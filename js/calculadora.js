let productos = [];

async function cargarProductos() {
    const response = await fetch('/productos');  // Cambiar si tenés un endpoint distinto
    productos = await response.json();
    const select = document.getElementById('selectProducto');

    productos.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.nombre} - $${p.precio}`;
        select.appendChild(option);
    });
}

function calcularPrecio() {
    const id = document.getElementById('selectProducto').value;
    const envio = parseFloat(document.getElementById('envio').value);
    const ganancia = parseFloat(document.getElementById('ganancia').value);
    const producto = productos.find(p => p.id == id);

    if (!producto) return;

    const base = producto.precio + envio;
    const conIva = base * 1.21;
    const final = conIva * (1 + ganancia / 100);

    const li = document.createElement('li');
    li.innerHTML = `
      Producto: <strong>${producto.nombre}</strong><br>
      Precio base: $${producto.precio.toFixed(2)}<br>
      Envío: $${envio.toFixed(2)}<br>
      Precio + IVA: $${conIva.toFixed(2)}<br>
      Precio final con ganancia del ${ganancia}%: 
      <span class="text-green-700 font-bold">$${final.toFixed(2)}</span>
    `;

    document.getElementById('resultados').appendChild(li);
}

document.addEventListener('DOMContentLoaded', cargarProductos);
