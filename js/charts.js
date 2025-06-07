let ventasChartInstance = null;
let ingresosChartInstance = null;

function renderVentasChart(ventasData) {
  const ctx = document.getElementById("ventasChart").getContext("2d");

  if (ventasChartInstance) {
    ventasChartInstance.destroy();
  }

  ventasChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: Object.keys(ventasData),
      datasets: [
        {
          label: "Ventas",
          data: Object.values(ventasData),
          backgroundColor: "rgba(51, 51, 255, 0.2)", // línea de relleno más suave
          borderColor: "#3399ff", // azul claro para la línea
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#ffffff", // color del texto de la leyenda
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#ffffff", // color del texto del eje X
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)", // líneas de cuadrícula suaves
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#ffffff", // color del texto del eje Y
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)", // líneas de cuadrícula suaves
          },
        },
      },
    },
  });
}

function renderIngresosVsEgresosChart(ingresos, egresos) {
  const ctx = document.getElementById("ingresosEgresosChart").getContext("2d");

  if (ingresosChartInstance) {
    ingresosChartInstance.destroy();
  }

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
          backgroundColor: ["#10B981", "#EF4444",], // verde, rojo, azul balance
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#ffffff", // texto blanco
          },
        },
        tooltip: {
          backgroundColor: "#1f2937", // gris oscuro para fondo del tooltip
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
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
// Nueva función para invocar ambas con filtro seleccionado
function renderGraficosConFiltro(data, tipo, rangoSeleccionado) {
  let ventas = {};
  if (tipo === "diario") ventas = data.ventas_por_dia;
  else if (tipo === "semanal") ventas = data.ventas_por_semana;
  else if (tipo === "mensual") ventas = data.ventas_por_mes;
  else if (tipo === "anual") ventas = data.ventas_anuales;

  renderVentasChart(ventas);
  renderIngresosVsEgresosChart(
    data.ingresos_por_periodo[tipo],
    data.egresos_por_periodo[tipo],
    rangoSeleccionado
  );
}
