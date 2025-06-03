(function verificarLogin() {
  const estaLogueado = localStorage.getItem("logged");

  if (!estaLogueado) {
    window.location.href = "login.html";
  }
})();

function cerrarSesion() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("logged");
  localStorage.removeItem("rol");
  window.location.href = "login.html";
}
