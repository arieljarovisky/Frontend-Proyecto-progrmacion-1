document.addEventListener("DOMContentLoaded", () => {
  const logueado = localStorage.getItem("logueado");
  if (logueado !== "true") {
    alert("Acceso denegado. Iniciá sesión primero.");
    window.location.href = "../pages/login.html"; // Ruta al login
  }
});

function showSection(sectionId) {
  // Verificar si el usuario está logueado
  const logueado = localStorage.getItem("logueado");
  if (logueado !== "true") {
    alert("Necesitás iniciar sesión primero");
    window.location.href = "../pages/login.html"; // Cambiá esto si tu ruta es distinta
    return;
  }

  const sections = ["inicio", "caja", "empleados", "inventario"];
  sections.forEach((sec) => {
    document.getElementById(sec).classList.add("hidden");
  });
  document.getElementById(sectionId).classList.remove("hidden");

  // Si se muestra la sección "Caja", renderizamos los productos y el carrito
  if (sectionId === "caja") {
    renderProducts();
    renderCart();
  }
}

// ---------------------
// Gestión de Productos y Carrito (Sección Caja)
// ---------------------

// Base de datos de productos en JSON
let products = [
  {
    id: 1,
    name: "Producto 1",
    price: 10.0,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "Producto 2",
    price: 20.0,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "Producto 3",
    price: 15.5,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 4,
    name: "Producto 4",
    price: 8.75,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 5,
    name: "Producto 5",
    price: 12.3,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 6,
    name: "Producto 6",
    price: 25.0,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 7,
    name: "Producto 7",
    price: 18.2,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 8,
    name: "Producto 8",
    price: 22.1,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 9,
    name: "Producto 9",
    price: 9.99,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 10,
    name: "Producto 10",
    price: 30.0,
    image: "https://via.placeholder.com/150",
  },
];

// Array que funcionará como carrito
let cart = [];

// Renderiza la lista de productos en la sección "Caja"
function renderProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  products.forEach((product) => {
    // Creamos la tarjeta del producto
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow flex flex-col items-center";
    card.innerHTML = `
        <img src="${product.image}" alt="${
      product.name
    }" class="w-full h-40 object-cover mb-2" />
        <h2 class="text-gray-700 font-semibold text-center">${product.name}</h2>
        <p class="text-blue-600 font-bold mt-1">$${product.price.toFixed(2)}</p>
        <select id="quantity-${
          product.id
        }" class="border border-gray-300 rounded p-1 mt-2">
          ${[...Array(10).keys()]
            .map((i) => `<option value="${i + 1}">${i + 1}</option>`)
            .join("")}
        </select>
        <button onclick="addToCart(${
          product.id
        })" class="mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded">
          Agregar al carrito
        </button>
      `;
    productList.appendChild(card);
  });
}

// Agrega un producto al carrito según la cantidad seleccionada
function addToCart(productId) {
  const select = document.getElementById(`quantity-${productId}`);
  const quantity = parseInt(select.value);
  const product = products.find((p) => p.id === productId);

  // Si el producto ya existe en el carrito, se suma la cantidad
  const cartItem = cart.find((item) => item.product.id === productId);
  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  renderCart();
}

// Renderiza el resumen del carrito, mostrando cada ítem y el total
function renderCart() {
  const cartSummary = document.getElementById("cartSummary");
  cartSummary.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    total += itemTotal;
    const div = document.createElement("div");
    div.className = "border-b py-2";
    div.innerHTML = `
        <div class="flex justify-between">
          <span>${item.product.name} x${item.quantity}</span>
          <span>$${itemTotal.toFixed(2)}</span>
        </div>
        <button onclick="removeFromCart(${index})" class="text-red-500 text-sm">Eliminar</button>
      `;
    cartSummary.appendChild(div);
  });
  document.getElementById("cartTotal").innerText = `$${total.toFixed(2)}`;
}

// Elimina un ítem del carrito
function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function finalizeSale() {
  if (cart.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  const sale = {
    total: 0,
    items: [],
  };

  cart.forEach((item) => {
    sale.items.push(item);
    sale.total += item.product.price * item.quantity;
  });

  fetch("http://192.168.1.8:5000/compras", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sale),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al guardar la venta");
      }
      return response.json();
    })
    .then((data) => {
      alert("Venta guardada correctamente");
      console.log("Respuesta del servidor:", data);
      cart = [];
      renderCart();
    })
    .catch((error) => {
      console.error("Error al enviar la venta:", error);
      alert("Hubo un error al guardar la venta");
    });
}
// ---------------------
// Gestión de Empleados (Sección Empleados)
// ---------------------

// Array de empleados iniciales (base de datos en JSON)
let employees = [
  { firstName: "Juan", lastName: "Pérez", id: "1", document: "12345678" },
  { firstName: "María", lastName: "González", id: "2", document: "87654321" },
  { firstName: "Carlos", lastName: "Ramírez", id: "3", document: "11223344" },
  { firstName: "Ana", lastName: "López", id: "4", document: "44332211" },
  { firstName: "Luis", lastName: "Martínez", id: "5", document: "99887766" },
];

// Renderiza la tabla de empleados
function renderEmployees() {
  const tableBody = document.getElementById("employeeTable");
  tableBody.innerHTML = "";
  employees.forEach((emp, index) => {
    const tr = document.createElement("tr");
    tr.classList.add("border-b");
    tr.innerHTML = `
        <td class="py-2 px-4" contenteditable="true" onblur="updateEmployee(${index}, 'firstName', this.innerText)">${emp.firstName}</td>
        <td class="py-2 px-4" contenteditable="true" onblur="updateEmployee(${index}, 'lastName', this.innerText)">${emp.lastName}</td>
        <td class="py-2 px-4" contenteditable="true" onblur="updateEmployee(${index}, 'id', this.innerText)">${emp.id}</td>
        <td class="py-2 px-4" contenteditable="true" onblur="updateEmployee(${index}, 'document', this.innerText)">${emp.document}</td>
        <td class="py-2 px-4">
          <button onclick="deleteEmployee(${index})" class="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded">
            Eliminar
          </button>
        </td>
      `;
    tableBody.appendChild(tr);
  });
}

// Actualiza el dato del empleado al editar una celda
function updateEmployee(index, field, value) {
  employees[index][field] = value;
}

// Elimina un empleado del arreglo
function deleteEmployee(index) {
  employees.splice(index, 1);
  renderEmployees();
}

// Manejo del formulario para agregar un nuevo empleado
document
  .getElementById("employeeForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const id = document.getElementById("employeeID").value;
    const documentValue = document.getElementById("document").value;

    employees.push({ firstName, lastName, id, document: documentValue });
    this.reset();
    renderEmployees();
  });

// Renderizamos la tabla de empleados al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  renderEmployees();
});
