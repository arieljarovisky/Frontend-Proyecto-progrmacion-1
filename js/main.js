// Permisos por rol
const permisosPorRol = {
  admin: [
    "inicio",
    "usuarios",
    "caja",
    "inventario",
    "pagos",
    "nuevaVenta",
    "ventas",
    "productos",
    "historial",
    "calculadora",
  ],
  empleado: ["caja", "nuevaVenta", "pagos"],
};

function filtrarBotonesPorRol(permisosPorRol) {
  const rol = localStorage.getItem("rol");
  const botones = document.querySelectorAll("aside button");

  botones.forEach((btn) => {
    const onclick = btn.getAttribute("onclick") || "";
    const coincide = permisosPorRol[rol]?.some((seccion) =>
      onclick.includes(seccion)
    );
    if (!coincide) {
      btn.classList.add("hidden");
    }
  });
}

function showSection(sectionId) {
  const rol = localStorage.getItem("rol");
  const permisosPorRol = {
    admin: [
      "inicio",
      "usuarios",
      "caja",
      "inventario",
      "pagos",
      "nuevaVenta",
      "ventas",
      "productos",
      "historial",
      "calculadora",
    ],
    empleado: ["caja", "nuevaVenta", "pagos"],
  };

  // Verificamos si el rol tiene permiso
  if (!permisosPorRol[rol]?.includes(sectionId)) {
    Swal.fire({
      icon: "error",
      title: "Acceso denegado",
      text: "No tenés permiso para acceder a esta sección.",
      confirmButtonColor: "#E52020",
    });
    return;
  } else {
    initDashboard();
  }

  const sections = document.querySelectorAll("main > section");
  const buttons = document.querySelectorAll("aside button");

  sections.forEach((section) => {
    if (section.id === sectionId) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  });

  buttons.forEach((button) => {
    if (button.getAttribute("onclick")?.includes(sectionId)) {
      button.classList.add("bg-blue-500", "text-white");
      button.classList.remove("text-gray-700", "hover:bg-blue-100");
    } else {
      button.classList.remove("bg-blue-500", "text-white");
      button.classList.add("text-gray-700", "hover:bg-blue-100");
    }
  });

  localStorage.setItem("ultimaSeccion", sectionId);
}

function updateBalanceDisplay(balance) {
  const balanceCaja = document.getElementById("balanceCaja");
  const balanceValor = document.getElementById("balanceValor");

  balanceValor.textContent = `$${balance}`;

  if (balance >= 0) {
    balanceCaja.classList.remove("bg-red-200", "text-red-800");
    balanceCaja.classList.add("bg-green-200", "text-green-800");
  } else {
    balanceCaja.classList.remove("bg-green-200", "text-green-800");
    balanceCaja.classList.add("bg-red-200", "text-red-800");
  }
}

function formatoFechaDMY(fechaISO) {
  // Convierte "2025-07-01" en "01/07/2025"
  const [yyyy, mm, dd] = fechaISO.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

async function initDashboard() {
  const contenedor = document.getElementById("metricas");
  const filtroTiempo = document.getElementById("filtroTiempo");
  const filtroRango = document.getElementById("filtroRango");

  try {
    const response = await fetch(`${API_BASE_URL}/api/ventas/metricas`);
    const data = await response.json();

    if (!response.ok) {
      contenedor.innerHTML = `
        <div class="text-red-600 font-semibold text-center col-span-4">
          ❌ Error al cargar métricas: ${data.error || "Desconocido"}
        </div>`;
      return;
    }

    // Limpiar contenedor y reestablecer clase
    contenedor.innerHTML = "";
    contenedor.className =
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

    // Tarjeta Balance
    const balance = data.saldo_actual;

    const divBalance = document.createElement("div");
    divBalance.className = "bg-white shadow rounded-2xl p-4 dark:bg-gray-800";
    divBalance.id = "balanceCaja";
    divBalance.innerHTML = `
      <h3 class="text-gray-800 text-sm dark:text-gray-400">Balance</h3>
      <p id="balanceValor" class="text-xl font-bold text-gray-900 dark:text-white">$${balance.toFixed(2)}</p>
    `;

    contenedor.appendChild(divBalance);
    updateBalanceDisplay(balance);

    // Tarjeta Ventas / Pagos
    const ventasPagos = document.createElement("div");
    ventasPagos.className =
      "bg-white shadow rounded-2xl p-4 dark:bg-gray-800";
    ventasPagos.innerHTML = `
      <h3 class="text-gray-800 text-sm dark:text-gray-400">Total Ventas</h3>
      <p class="text-xl font-semibold text-gray-900 dark:text-white">${data.total_ventas}</p>
      <h3 class="text-gray-800 text-sm mt-2 dark:text-gray-400">Total Pagos</h3>
      <p class="text-xl font-semibold text-gray-900 dark:text-white">${data.total_pagos}</p>
    `;
    contenedor.appendChild(ventasPagos);

    // Producto más vendido
    contenedor.appendChild(
      createCard(
        "Producto más vendido",
        `${data.producto_mas_vendido.nombre}<br><span class='text-sm text-gray-500 dark:text-gray-300'>Cantidad: ${data.producto_mas_vendido.cantidad}</span>`
      )
    );

    // Extra dashboard (bajo stock, vencimiento, etc)
    const seccionesAnteriores = document.getElementById("extra-dashboard");
    if (seccionesAnteriores) seccionesAnteriores.remove();

    const extraContent = document.createElement("div");
    extraContent.id = "extra-dashboard";
    extraContent.className = "col-span-full mt-6 space-y-6";

    const respProductos = await fetch(`${API_BASE_URL}/api/productos?per_page=9999`);
    const dataProd = await respProductos.json();
    const productos = dataProd.productos || dataProd;

    const productosBajoStock = productos.filter(
      p => Number(p.stock) <= Number(p.stock_minimo ?? 5)
    );

    const listaBajoStock = productosBajoStock.length
      ? productosBajoStock.map(
        p =>
          `<li>${p.nombre} <span class="text-xs text-gray-600 dark:text-gray-400">(Stock: ${p.stock} / Mínimo: ${p.stock_minimo})</span></li>`
      ).join("")
      : `<li class="text-green-600 dark:text-green-400">Ningún producto está en alerta de stock bajo.</li>`;

    extraContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-white">
        <div class="bg-white shadow rounded-2xl p-4 dark:bg-gray-800 dark:text-gray-200">
          <h4 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Productos con bajo stock</h4>
          <ul class="list-disc list-inside text-sm text-gray-800 dark:text-gray-200">
            ${listaBajoStock}
          </ul>
        </div>
        <div class="bg-white shadow rounded-2xl p-4 dark:bg-gray-800 dark:text-gray-200">
          <h4 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Productos con vencimiento próximo</h4>
          <ul class="list-disc list-inside text-sm text-gray-800 dark:text-gray-200">
            <li>Vacuna Rabia - 2025-06-10</li>
            <li>Desinfectante - 2025-06-15</li>
            <li>Suero Oral - 2025-06-22</li>
          </ul>
        </div>
      </div>
    `;
    contenedor.parentElement.appendChild(extraContent);

    filtroTiempo.addEventListener("change", () => {
      const tipo = filtroTiempo.value;
      filtroRango.innerHTML = "";
      let opciones = [];

      if (tipo === "diario") opciones = Object.keys(data.ventas_por_dia);
      else if (tipo === "semanal") opciones = Object.keys(data.ventas_por_semana);
      else if (tipo === "mensual") opciones = Object.keys(data.ventas_por_mes);
      else if (tipo === "anual") opciones = Object.keys(data.ventas_anuales);

      opciones.sort((a, b) => b.localeCompare(a));
      let defaultValue = opciones[0];

      opciones.forEach((o) => {
        const option = document.createElement("option");
        option.value = o;
        if (tipo === "diario") {
          option.textContent = formatoFechaDMY(o);
        } else if (tipo === "mensual") {
          const [yyyy, mm] = o.split("-");
          option.textContent = `${mm}/${yyyy}`;
        } else {
          option.textContent = o;
        }
        if (o === defaultValue) option.selected = true;
        filtroRango.appendChild(option);
      });

      // Render según tipo para el gráfico de líneas
      if (tipo === "diario") renderVentasChart(data.ingresos_por_dia, data.egresos_por_dia);
      else if (tipo === "semanal") renderVentasChart(data.ingresos_por_semana, data.egresos_por_semana);
      else if (tipo === "mensual") renderVentasChart(data.ingresos_por_mes, data.egresos_por_mes);
      else if (tipo === "anual") renderVentasChart(data.ingresos_anuales, data.egresos_anuales);

      filtroRango.dispatchEvent(new Event("change"));
    });

    filtroRango.addEventListener("change", () => {
      const tipo = filtroTiempo.value;
      const rango = filtroRango.value;

      const ingresosData = {
        diario: data.ingresos_por_dia,
        semanal: data.ingresos_por_semana,
        mensual: data.ingresos_por_mes,
        anual: data.ingresos_anuales,
      };
      const egresosData = {
        diario: data.egresos_por_dia,
        semanal: data.egresos_por_semana,
        mensual: data.egresos_por_mes,
        anual: data.egresos_anuales,
      };
      const ingresos = ingresosData[tipo]?.[rango] || 0;
      const egresos = egresosData[tipo]?.[rango] || 0;

      renderIngresosVsEgresosChart(ingresos, egresos, rango);
    });

    filtroTiempo.dispatchEvent(new Event("change"));
  } catch (error) {
    contenedor.innerHTML = `
      <div class="text-red-600 font-semibold text-center col-span-4">
        ⚠️ Error de conexión: ${error.message}
      </div>`;
  }
}

// Función utilitaria para tarjetas
function createCard(titulo, contenido, extraClass = "") {
  const div = document.createElement("div");
  div.className = "bg-white shadow rounded-2xl p-4 dark:bg-gray-800";
  div.innerHTML = `
    <h3 class="text-gray-800 text-sm dark:text-gray-400">${titulo}</h3>
    <p class="text-xl font-bold text-gray-900 dark:text-white ${extraClass}">${contenido}</p>
  `;
  return div;
}

function modoOscuro() {
  const html = document.documentElement;
  html.classList.toggle("dark");
  if (html.classList.contains("dark")) {
    localStorage.setItem("modo", "oscuro");
  } else {
    localStorage.setItem("modo", "claro");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const themeSwitch = document.getElementById("themeSwitch");
  const html = document.documentElement;

  // Al cargar, setea el estado correcto según preferencia previa
  const modo = localStorage.getItem("modo");
  if (modo === "oscuro") {
    html.classList.add("dark");
    themeSwitch.checked = true;
  } else {
    html.classList.remove("dark");
    themeSwitch.checked = false;
  }

  themeSwitch.addEventListener("change", () => {
    if (themeSwitch.checked) {
      html.classList.add("dark");
      localStorage.setItem("modo", "oscuro");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("modo", "claro");
    }
  });
});

window.addEventListener("DOMContentLoaded", () => {
  // Mostrar usuario logueado en la topbar
  const user = JSON.parse(localStorage.getItem("usuario"));
  const nombre = user?.nombre
    ? user.nombre.charAt(0).toUpperCase() + user.nombre.slice(1)
    : "Invitado";
  const userNameElem = document.getElementById("userName");
  if (userNameElem) userNameElem.textContent = nombre;

  // Modo oscuro según preferencia previa
  const modo = localStorage.getItem("modo");
  if (modo === "oscuro") {
    document.documentElement.classList.add("dark");
  }

  // Botón de cambiar tema (topbar)
  const themeBtn = document.getElementById("toggleThemeBtn");
  if (themeBtn) themeBtn.onclick = modoOscuro;

  // Botón de logout (topbar)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem("usuarioLogueado");
      localStorage.removeItem("rol");
      window.location.href = "login.html";
    };
  }

  // Sidebar: filtrar botones según permisos por rol
  filtrarBotonesPorRol(permisosPorRol);

  // Mostrar la sección guardada o default
  const ultima = localStorage.getItem("ultimaSeccion") || "inicio";
  const rol = localStorage.getItem("rol");
  if (rol == "empleado") {
    showSection("caja");
    return;
  } else {
    showSection(ultima);
  }
});
