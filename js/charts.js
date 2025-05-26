let ventasChartInstance = null;
let ingresosChartInstance = null;

function renderVentasChart(ventasData) {
    const ctx = document.getElementById('ventasChart').getContext('2d');

    if (ventasChartInstance) {
        ventasChartInstance.destroy();
    }

    ventasChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ventasData),
            datasets: [{
                label: 'Ventas',
                data: Object.values(ventasData),
                backgroundColor: 'rgba(59, 130, 246, 0.7)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderIngresosVsEgresosChart(ingresos, egresos, rango) {
    const ctx = document.getElementById('ingresosEgresosChart').getContext('2d');

    if (ingresosChartInstance) {
        ingresosChartInstance.destroy();
    }

    ingresosChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [
                `Ingresos $${ingresos.toFixed(2)}`,
                `Egresos $${egresos.toFixed(2)}`,
                `Balance $${(ingresos - egresos).toFixed(2)}`
            ],
            datasets: [{
                data: [ingresos, egresos],
                backgroundColor: ['#10B981', '#EF4444']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top', 
                    labels: {
                        color: '#374151'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: $${context.parsed.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}


// Nueva función para invocar ambas con filtro seleccionado
function renderGraficosConFiltro(data, tipo, rangoSeleccionado) {
    let ventas = {};
    if (tipo === 'diario') ventas = data.ventas_por_dia;
    else if (tipo === 'semanal') ventas = data.ventas_por_semana;
    else if (tipo === 'mensual') ventas = data.ventas_por_mes;
    else if (tipo === 'anual') ventas = data.ventas_anuales;

    renderVentasChart(ventas);
    renderIngresosVsEgresosChart(data.ingresos_por_periodo[tipo], data.egresos_por_periodo[tipo], rangoSeleccionado);
} 