function renderVentasChart(ventasPorDia) {
    const ctx = document.getElementById('ventasChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ventasPorDia),
            datasets: [{
                label: 'Ventas',
                data: Object.values(ventasPorDia),
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

function renderIngresosVsEgresosChart(ingresos, egresos) {
    const ctx = document.getElementById('ingresosEgresosChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Ingresos', 'Egresos'],
            datasets: [{
                data: [ingresos, egresos],
                backgroundColor: ['#10B981', '#EF4444']
            }]
        },
        options: { responsive: true }
    });
}