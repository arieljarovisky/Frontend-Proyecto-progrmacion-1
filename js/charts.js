// let ventasChartInstance = null;
// let ingresosChartInstance = null;


// function renderVentasChart(ventasData, pagosData) {
//   pagosData = pagosData || {};
//   const ctx = document.getElementById("ventasChart").getContext("2d");

//   if (ventasChartInstance) {
//     ventasChartInstance.destroy();
//   }

//   const ventasLabels = Object.keys(ventasData);
//   const pagosLabels = pagosData ? Object.keys(pagosData) : [];
//   const labels = Array.from(new Set([...ventasLabels, ...pagosLabels])).sort();

//   const datasets = [
//     {
//       label: "Ventas",
//       data: labels.map(lab => ventasData[lab] || 0),
//       backgroundColor: "rgba(51, 51, 255, 0.2)", // línea de relleno más suave
//       borderColor: "#3399ff", // azul claro para la línea
//       borderWidth: 2,
//       tension: 0.3,
//     }
//   ]

//   if (pagosData) {
//     datasets.push({
//       label: "Pagos",
//       data: labels.map(lab => pagosData[lab] || 0),
//       backgroundColor: "rgba(255, 99, 132, 0.2)", // línea de relleno más suave
//       borderColor: "#ff6384", // rojo claro para la línea
//       borderWidth: 2,
//       tension: 0.3,
//     });
//   }

//   ventasChartInstance = new Chart(ctx, {
//     type: "line",
//     data: {
//       labels: labels,
//       datasets: datasets,
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: {
//           labels: {
//             color: "#ffffff", // color del texto de la leyenda
//           },
//         },
//       },
//       scales: {
//         x: {
//           ticks: {
//             color: "#ffffff", // color del texto del eje X
//           },
//           grid: {
//             color: "rgba(255, 255, 255, 0.1)", // líneas de cuadrícula suaves
//           },
//         },
//         y: {
//           beginAtZero: true,
//           ticks: {
//             color: "#ffffff", // color del texto del eje Y
//           },
//           grid: {
//             color: "rgba(255, 255, 255, 0.1)", // líneas de cuadrícula suaves
//           },
//         },
//       },
//     },
//   });
// }

// function renderIngresosVsEgresosChart(ingresos, egresos) {
//   const ctx = document.getElementById("ingresosEgresosChart").getContext("2d");

//   if (ingresosChartInstance) {
//     ingresosChartInstance.destroy();
//   }

//   ingresosChartInstance = new Chart(ctx, {
//     type: "doughnut",
//     data: {
//       labels: [
//         `Ingresos $${ingresos.toFixed(2)}`,
//         `Egresos $${egresos.toFixed(2)}`,
//       ],
//       datasets: [
//         {
//           data: [ingresos, egresos],
//           backgroundColor: ["#10B981", "#EF4444",], // verde, rojo, azul balance
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: {
//           position: "top",
//           labels: {
//             color: "#ffffff", // texto blanco
//           },
//         },
//         tooltip: {
//           backgroundColor: "#1f2937", // gris oscuro para fondo del tooltip
//           titleColor: "#ffffff",
//           bodyColor: "#ffffff",
//           callbacks: {
//             label: function (context) {
//               return `${context.label}: $${context.parsed.toFixed(2)}`;
//             },
//           },
//         },
//       },
//     },
//   });
// }
// // Nueva función para invocar ambas con filtro seleccionado
// function renderGraficosConFiltro(data, tipo, rangoSeleccionado) {
//   let ventas = {};
//   let pagos = {};
//   if (tipo === "diario") {
//     ventas = data.ventas_por_dia;
//     pagos = data.egresos_por_dia;
//   }
//   else if (tipo === "semanal") {
//     ventas = data.ventas_por_semana;
//     pagos = data.egresos_por_semana;
//   }
//   else if (tipo === "mensual") {
//     ventas = data.ventas_por_mes;
//     pagos = data.egresos_por_mes;
//   }
//   else if (tipo === "anual") {
//     ventas = data.ventas_anuales;
//     pagos = data.egresos_anuales;
//   }

//   renderVentasChart(ventas, pagos);
//   renderIngresosVsEgresosChart(
//     data.ingresos_por_periodo[tipo],
//     data.egresos_por_periodo[tipo],
//     rangoSeleccionado
//   );
// }

let ventasChartInstance = null;
let ingresosChartInstance = null;

function renderVentasChart(ventasData, pagosData) {
  pagosData = pagosData || {};
  
  // LOG 1: Datos crudos que llegan a la función
  console.log("DEBUG - ventasData recibido:", ventasData);
  console.log("DEBUG - pagosData recibido:", pagosData);

  const ventasLabels = Object.keys(ventasData);
  const pagosLabels = Object.keys(pagosData);
  
  // LOG 2: Labels por separado
  console.log("DEBUG - ventasLabels:", ventasLabels);
  console.log("DEBUG - pagosLabels:", pagosLabels);

  const labels = Array.from(new Set([...ventasLabels, ...pagosLabels])).sort();

  // LOG 3: Labels finales alineados (eje X del gráfico)
  console.log("DEBUG - Labels (eje X):", labels);

  const ventasMapeadas = labels.map(lab => ventasData[lab] || 0);
  const pagosMapeados = labels.map(lab => pagosData[lab] || 0);

  // LOG 4: Arrays alineados a graficar (¿hay valores ≠ 0?)
  console.log("DEBUG - ventas mapeadas:", ventasMapeadas);
  console.log("DEBUG - pagos mapeadas:", pagosMapeados);

  const datasets = [
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
  ];

  const ctx = document.getElementById("ventasChart").getContext("2d");

  if (ventasChartInstance) {
    ventasChartInstance.destroy();
  }

  ventasChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasets,
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
            color: "#ffffff",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#ffffff",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
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
            color: "#ffffff",
          },
        },
        tooltip: {
          backgroundColor: "#1f2937",
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
  let pagos = {};
  if (tipo === "diario") {
    ventas = data.ventas_por_dia;
    pagos = data.egresos_por_dia;
  }
  else if (tipo === "semanal") {
    ventas = data.ventas_por_semana;
    pagos = data.egresos_por_semana;
  }
  else if (tipo === "mensual") {
    ventas = data.ventas_por_mes;
    pagos = data.egresos_por_mes;
  }
  else if (tipo === "anual") {
    ventas = data.ventas_anuales;
    pagos = data.egresos_anuales;
  }

  // LOG 5: Qué datos le pasan a la función final
  console.log("DEBUG - renderGraficosConFiltro > ventas:", ventas);
  console.log("DEBUG - renderGraficosConFiltro > pagos:", pagos);

  renderVentasChart(ventas, pagos);
  renderIngresosVsEgresosChart(
    data.ingresos_por_periodo ? data.ingresos_por_periodo[tipo] : 0,
    data.egresos_por_periodo ? data.egresos_por_periodo[tipo] : 0,
    rangoSeleccionado
  );
}
