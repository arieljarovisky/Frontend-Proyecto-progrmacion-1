let ventasChartInstance = null;
let ingresosChartInstance = null;

function parsearSemanaLabel(label) {
  // Ejemplo label: "10-16 marzo 2025"
  if (!label) return null;
  const partes = label.split(" ");
  if (partes.length < 3) return null;

  // Primer día de la semana
  const rangoDias = partes[0].split("-");
  const dia = parseInt(rangoDias[0]);
  const mesTexto = partes[1].toLowerCase();
  const year = parseInt(partes[2]);

  // Diccionario de meses en español
  const meses = {
    "enero": 0, "febrero": 1, "marzo": 2, "abril": 3, "mayo": 4, "junio": 5,
    "julio": 6, "agosto": 7, "septiembre": 8, "octubre": 9, "noviembre": 10, "diciembre": 11
  };
  const mes = meses[mesTexto];
  if (mes === undefined) return null;

  // Devuelve un objeto Date
  return new Date(year, mes, dia);
}

function renderVentasChart(ventasData, pagosData) {
  pagosData = pagosData || {};

  // LOG 1: Datos crudos que llegan a la función
  console.log("DEBUG - ventasData recibido:", ventasData);
  console.log("DEBUG - pagosData recibido:", pagosData);

  const ventasLabels = Object.keys(ventasData);
  const pagosLabels = Object.keys(pagosData);
  let labels = Array.from(new Set([...ventasLabels, ...pagosLabels]));

  // LOG 2: Labels por separado
  console.log("DEBUG - ventasLabels:", ventasLabels);
  console.log("DEBUG - pagosLabels:", pagosLabels);

  // Ordenar labels correctamente:
  // Si los labels parecen semanas (formato "10-16 marzo 2025"), ordenar por fecha de inicio
  if (labels.length > 0 && labels[0].match(/^\d+-\d+ /)) {
    labels.sort((a, b) => {
      const fa = parsearSemanaLabel(a);
      const fb = parsearSemanaLabel(b);
      if (!fa || !fb) return 0;
      return fa - fb;
    });
  } else {
    labels.sort(); // alfabéticamente para otros casos
  }

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
          backgroundColor: ["#10B981", "#EF4444"], // verde, rojo, azul balance
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
