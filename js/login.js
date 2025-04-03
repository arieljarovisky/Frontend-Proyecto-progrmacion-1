// Obtener elementos del formulario
const loginForm = document.getElementById('loginForm');
const registerBtn = document.getElementById('registerBtn');

// Función para manejar el envío del formulario de login
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Aquí puedes agregar la lógica para enviar los datos a un servidor
    console.log("Usuario:", username);
    console.log("Contraseña:", password);
    alert('¡Login exitoso!');

    // Limpiar los campos
    loginForm.reset();
});

// Función para manejar el clic en el botón de registro
registerBtn.addEventListener('click', function() {
    alert('Redirigiendo al formulario de registro...');
    // Aquí podrías redirigir a otra página de registro
    window.location.href = "/registro";  // Cambia la URL de acuerdo a tus necesidades
});
