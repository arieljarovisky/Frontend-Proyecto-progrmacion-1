document.addEventListener("DOMContentLoaded", () => {
  const pagoForm = document.getElementById("formPago");

  pagoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const destinatario = document.getElementById("destinatario").value.trim();
    const concepto = document.getElementById("concepto").value;
    const monto = parseFloat(document.getElementById("monto").value);
    const descripcion = document.getElementById("descripcion").value.trim();
    const metodo = document.getElementById("metodo").value;

    // Validaciones básicas
    if (!destinatario || !concepto || !monto || isNaN(monto) || monto <= 0 || !metodo) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor, completá todos los campos correctamente.',
        confirmButtonColor: '#E52020',
        confirmButtonText: 'Entendido'
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
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",   
      cancelButtonColor: "#E52020"  
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevoPago = {
          destinatario,
          concepto,
          monto,
          descripcion,
          metodo,
          fecha: new Date().toISOString()
        };

        const pagos = JSON.parse(localStorage.getItem("pagos")) || [];
        pagos.push(nuevoPago);
        localStorage.setItem("pagos", JSON.stringify(pagos));

        Swal.fire({
          icon: 'success',
          title: 'Pago registrado correctamente',
          confirmButtonColor: '#10b981'
        });
        pagoForm.reset();
      }
    });
  });
});
