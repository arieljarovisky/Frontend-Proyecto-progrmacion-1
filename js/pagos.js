const conceptosPorRol = {
  admin: ["alquiler", "sueldos", "proveedor", "servicios", "otros"],
  empleado: ["proveedor", "servicios", "otros"],
};
function cargarConceptosPorRol(conceptosPorRol) {
  const rol = localStorage.getItem("rol");
  const conceptos = conceptosPorRol[rol] || [];

  const conceptoSelect = document.getElementById("concepto");
  conceptoSelect.innerHTML = '<option value="">Seleccionar</option>'; // Reiniciar

  conceptos.forEach((c) => {
    const opcion = document.createElement("option");
    opcion.value = c;
    opcion.textContent = capitalizar(c);
    conceptoSelect.appendChild(opcion);
  });
}
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
document.addEventListener("DOMContentLoaded", () => {
  const pagoForm = document.getElementById("formPago");
  cargarConceptosPorRol(conceptosPorRol);

  pagoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const destinatario = document.getElementById("destinatario").value.trim();
    const concepto = document.getElementById("concepto").value;
    const monto = parseFloat(document.getElementById("monto").value);
    const descripcion = document.getElementById("descripcion").value.trim();
    const metodo = document.getElementById("metodo").value;
    const fechaInput = document.getElementById("fecha").value;
    // Usar la fecha seleccionada o la actual si está vacío
    const fecha = fechaInput
      ? new Date(fechaInput).toISOString()
      : new Date().toISOString();

    // Validaciones básicas
    if (
      !destinatario ||
      !concepto ||
      !monto ||
      isNaN(monto) ||
      monto <= 0 ||
      !metodo
    ) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Por favor, completá todos los campos correctamente.",
        confirmButtonColor: "#E52020",
        confirmButtonText: "Entendido",
      });
      return;
    }

    // Confirmación con SweetAlert2
    Swal.fire({
      title: "¿Confirmar pago?",
      html: `
        <p><strong>Destinatario:</strong> ${destinatario}</p>
        <p><strong>Concepto:</strong> ${concepto}</p>
        <p><strong>Monto:</strong> $${monto.toFixed(2)}</p>
        <p><strong>Método de pago:</strong> ${metodo}</p>
        <p><strong>Descripción:</strong> ${descripcion || "-"}</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#E52020",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch("http://localhost:5000/api/pagos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              destinatario,
              concepto,
              monto,
              descripcion,
              metodo,
              fecha,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Pago registrado correctamente",
              confirmButtonColor: "#10b981",
            });
            pagoForm.reset();
          } else {
            Swal.fire({
              icon: "error",
              title: "Error al registrar pago",
              text: data.error || "Ocurrió un error inesperado.",
              confirmButtonColor: "#E52020",
            });
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#E52020",
          });
        }
      }
    });
  });
});
