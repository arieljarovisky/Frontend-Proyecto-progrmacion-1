(function verificarLogin() {
    const estaLogueado = localStorage.getItem("logged");
  
    if (!estaLogueado) {
      window.location.href = "login.html";
    }
  })();