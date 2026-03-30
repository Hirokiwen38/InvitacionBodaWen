document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. ANIMACIÓN DE APARICIÓN AL HACER SCROLL
    // ==========================================
    function activateReveals() {
        const reveals = document.querySelectorAll('.reveal');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    // AGREGAMOS ESTO: Quita la clase cuando ya no se ve
                    // Así la animación se repite al volver a hacer scroll
                    entry.target.classList.remove('active');
                }
            });
        }, {
            threshold: 0.1
        });

        reveals.forEach(element => {
            observer.observe(element);
        });
    }

    // ==========================================
    // 2. EFECTO DE PROFUNDIDAD EN LA GALERÍA 
    // ==========================================
    function activatePhotoSwiperEffect() {
        const swiperContainer = document.querySelector('.photo-swiper-container');
        const cards = document.querySelectorAll('.photo-card');

        if (!swiperContainer || cards.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Quitamos la clase 'center' de todos y se la ponemos al que está en pantalla
                    cards.forEach(card => card.classList.remove('center'));
                    entry.target.classList.add('center');
                }
            });
        }, {
            root: swiperContainer,
            threshold: 0.6 // El card debe estar al 60% visible para centrarse
        });

        cards.forEach(card => observer.observe(card));
    }

    // Ejecutar funciones visuales
    activateReveals();
    activatePhotoSwiperEffect();

    // ==========================================
    // 3. CONEXIÓN BACKEND (GUARDAR EN SHEETS)
    // ==========================================
    const rsvpForm = document.getElementById('rsvp-form');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita que la página se recargue

            // UX: Cambiar el texto del botón mientras carga
            const submitBtn = rsvpForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            // Recolectar datos del formulario HTML
            const formData = {
                nombre: document.getElementById('name').value,
                asistencia: document.getElementById('attendance').value,
                acompanantes: document.getElementById('guests').value,
                cancion: document.getElementById('song').value
            };

            try {
                // Hacemos la petición a nuestro servidor Python local
                const response = await fetch('http://127.0.0.1:5000/confirmar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.status === 'success') {
                    alert('¡Gracias por confirmar, ' + formData.nombre + '!');
                    
                    // Aquí es donde meteremos la lógica del QR en la siguiente fase
                    // console.log("ID para el QR:", result.id_qr); 
                    
                    rsvpForm.reset(); // Limpia el formulario
                } else {
                    alert('Hubo un problema: ' + result.message);
                }
            } catch (error) {
                console.error('Error al enviar:', error);
                alert('No se pudo conectar con el servidor. (Asegúrate de tener corriendo app.py en tu terminal)');
            } finally {
                // Restaurar el botón a su estado original
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});