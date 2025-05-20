document.getElementById('calculadoraForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const costo = parseFloat(document.getElementById('costoProducto').value) || 0;
  const envio = parseFloat(document.getElementById('costoEnvio').value) || 0;
  const iva = parseFloat(document.getElementById('iva').value) || 0;
  const ganancia = parseFloat(document.getElementById('ganancia').value) || 0;

  const costoTotal = costo + envio;
  const ivaCalculado = costoTotal * (iva / 100);
  const gananciaCalculada = (costoTotal + ivaCalculado) * (ganancia / 100);
  const precioFinal = costoTotal + ivaCalculado + gananciaCalculada;

  document.getElementById('resultado').textContent = `Precio de venta sugerido: $${precioFinal.toFixed(2)}`;
});