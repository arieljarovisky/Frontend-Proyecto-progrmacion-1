document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
  
    const email = document.getElementById("email").value.trim().toLowerCase();
    const contrasena = document.getElementById("contrasena").value.trim();
  
    const respuesta = await fetch("http://192.168.1.8:5000/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, contrasena })
    });
  
    const data = await respuesta.json();
  
    const mensaje = document.getElementById("mensaje");
  
    if (respuesta.ok) {
      mensaje.textContent = "Login exitoso!";
      mensaje.classList.remove("text-red-500");
      mensaje.classList.add("text-green-600");
  
      // Podés guardar el usuario en localStorage y redirigir:
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      localStorage.setItem("logged", "true");
      setTimeout(() => {
        window.location.href = "index.html"; // Cambiá a donde querés redirigir
      }, 1000);
    } else {
      mensaje.textContent = data.error || "Error al iniciar sesión";
      mensaje.classList.remove("text-green-600");
      mensaje.classList.add("text-red-500");
    }
  });
  