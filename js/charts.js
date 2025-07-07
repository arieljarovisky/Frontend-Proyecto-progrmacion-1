let ventasChartInstance = null;
let ingresosChartInstance = null;

// Detecta si está en modo oscuro
function isDarkMode() {
  return document.documentElement.classList.contains('dark');
}

function parsearSemanaLabel(label) {
  if (!label) return null;
  const partes = label.split(" ");
  if (partes.length < 3) return null;
  const rangoDias = partes[0].split("-");
  const dia = parseInt(rangoDias[0]);
  const mesTexto = partes[1].toLowerCase();
  const year = parseInt(partes[2]);
  const meses = {
    "enero": 0, "febrero": 1, "marzo": 2, "abril": 3, "mayo": 4, "junio": 5,
    "julio": 6, "agosto": 7, "septiembre": 8, "octubre": 9, "noviembre": 10, "diciembre": 11
  };
  const mes = meses[mesTexto];
  if (mes === undefined) return null;
  return new Date(year, mes, dia);
}

// --- RENDER GRAFICO VENTAS ---
function renderVentasChart(ventasData, pagosData) {
  pagosData = pagosData || {};

  const ventasLabels = Object.keys(ventasData);
  const pagosLabels = Object.keys(pagosData);
  let labels = Array.from(new Set([...ventasLabels, ...pagosLabels]));

  if (labels.length > 0 && labels[0].match(/^\d+-\d+ /)) {
    labels.sort((a, b) => {
      const fa = parsearSemanaLabel(a);
      const fb = parsearSemanaLabel(b);
      if (!fa || !fb) return 0;
      return fa - fb;
    });
  } else {
    labels.sort();
  }

  const ventasMapeadas = labels.map(lab => ventasData[lab] || 0);
  const pagosMapeados = labels.map(lab => pagosData[lab] || 0);

  // Colores dinámicos según modo
  const colorTexto = isDarkMode() ? "#fff" : "#222";
  const gridColor = isDarkMode() ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  const ctx = document.getElementById("ventasChart").getContext("2d");
  if (ventasChartInstance) ventasChartInstance.destroy();

  ventasChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Ventas",
          data: ventasMapeadas,
          backgroundColor: "rgba(51, 51, 255, 0.2)",
          borderColor: "#3399ff",
          borderWidth: 2,
          tension: 0.3,
        },
        {
          label: "Pagos",
          data: pagosMapeados,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "#ff6384",
          borderWidth: 2,
          tension: 0.3,
        }
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: colorTexto,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: colorTexto,
          },
          grid: {
            color: gridColor,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: colorTexto,
          },
          grid: {
            color: gridColor,
          },
        },
      },
    },
  });
}

// --- RENDER GRAFICO INGRESOS/EGRESOS ---
function renderIngresosVsEgresosChart(ingresos, egresos) {
  const ctx = document.getElementById("ingresosEgresosChart").getContext("2d");
  if (ingresosChartInstance) ingresosChartInstance.destroy();

  const colorTexto = isDarkMode() ? "#fff" : "#222";

  ingresosChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [
        `Ingresos $${ingresos.toFixed(2)}`,
        `Egresos $${egresos.toFixed(2)}`,
      ],
      datasets: [
        {
          data: [ingresos, egresos],
          backgroundColor: ["#10B981", "#EF4444"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: colorTexto,
          },
        },
        tooltip: {
          backgroundColor: isDarkMode() ? "#1f2937" : "#fff",
          titleColor: colorTexto,
          bodyColor: colorTexto,
          callbacks: {
            label: function (context) {
              return `${context.label}: $${context.parsed.toFixed(2)}`;
            },
          },
        },
      },
    },
  });
}

// --- FUNCIÓN AUXILIAR PARA AMBOS GRAFICOS CON FILTRO ---
function renderGraficosConFiltro(data, tipo, rangoSeleccionado) {
  let ventas = {};
  let pagos = {};
  if (tipo === "diario") {
    ventas = data.ventas_por_dia;
    pagos = data.egresos_por_dia;
  } else if (tipo === "semanal") {
    ventas = data.ventas_por_semana;
    pagos = data.egresos_por_semana;
  } else if (tipo === "mensual") {
    ventas = data.ventas_por_mes;
    pagos = data.egresos_por_mes;
  } else if (tipo === "anual") {
    ventas = data.ventas_anuales;
    pagos = data.egresos_anuales;
  }

  renderVentasChart(ventas, pagos);
  renderIngresosVsEgresosChart(
    data.ingresos_por_periodo ? data.ingresos_por_periodo[tipo] : 0,
    data.egresos_por_periodo ? data.egresos_por_periodo[tipo] : 0,
    rangoSeleccionado
  );
}

// --- OPCIONAL: REFRESCAR GRAFICOS AL CAMBIAR MODO ---
document.addEventListener('DOMContentLoaded', () => {
  const themeSwitch = document.getElementById('themeSwitch');
  if (!themeSwitch) return;
  themeSwitch.addEventListener('change', () => {
    // Guardá los datos actuales en una variable global si querés mantener la selección del usuario
    // o simplemente re-renderizá los gráficos con los datos actuales (tendrás que adaptarlo a tu estructura)
    if (typeof initDashboard === "function") {
      initDashboard();
    }
  });
});
