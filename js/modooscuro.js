function ModoOscuro() {
  const html = document.documentElement; // <html>
  html.classList.toggle('dark');

  // Guardar la preferencia
  if (html.classList.contains('dark')) {
    localStorage.setItem('modo', 'oscuro');
  } else {
    localStorage.setItem('modo', 'claro');
  }
}

// Al cargar la página, usar la preferencia guardada
document.addEventListener('DOMContentLoaded', () => {
  const modo = localStorage.getItem('modo');
  if (modo === 'oscuro') {
    document.documentElement.classList.add('dark');
  }
});

