// Obtener elementos del formulario
const loginForm = document.getElementById('loginForm');
const registerBtn = document.getElementById('registerBtn');

// Función para manejar el envío del formulario de login
loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('username').value;
    const contrasena = document.getElementById('password').value;

    // Enviar los datos al backend usando fetch
    try {
        const response = await fetch('http://192.168.1.8:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, contrasena })
        });

        const data = await response.json();
        if (response.ok) {
            // Guardar estado de login en localStorage
            localStorage.setItem('logueado', 'true');
            localStorage.setItem('email', email); // si querés guardar también el mail

            alert('¡Login exitoso!');
            window.location.href = '../index.html';  // Redirige a la página principal
        } else {
            alert(data.mensaje || 'Error en el inicio de sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error, intenta de nuevo.');
    }

    // Limpiar los campos
    loginForm.reset();
});

// Función para manejar el clic en el botón de registro
registerBtn.addEventListener('click', function() {
    alert('Redirigiendo al formulario de registro...');
    window.location.href = "/registro";  // Cambia la URL de acuerdo a tus necesidades
});
