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

    // ==========================================
    // 3. CUENTA REGRESIVA (COUNTDOWN)
    // ==========================================
    function activateCountdown() {
        // Definimos la fecha de la boda
        const weddingDate = new Date("May 23, 2026 19:00:00").getTime();
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minsEl = document.getElementById('minutes');
        const secsEl = document.getElementById('seconds');
        const countdownContainer = document.querySelector('.countdown-container');
        const messageEl = document.getElementById('countdown-message');

        if (!daysEl) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = weddingDate - now;

            // Si la fecha ya llegó, detenemos el contador y mostramos el mensaje
            if (distance < 0) {
                clearInterval(timer);
                countdownContainer.classList.add('hidden');
                if (messageEl) messageEl.classList.remove('hidden');
                return;
            }

            // Cálculos matemáticos de tiempo
            daysEl.textContent = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
            hoursEl.textContent = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            minsEl.textContent = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            secsEl.textContent = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
        }, 1000);
    }

    // Ejecutar funciones visuales
    activateReveals();
    activatePhotoSwiperEffect();
    activateCountdown();

    // ==========================================
    // 4. CONEXIÓN BACKEND (GUARDAR EN SHEETS)
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
                    
                    // Ocultamos el formulario y mostramos el contenedor del QR
                    rsvpForm.classList.add('hidden');
                    const qrContainer = document.getElementById('qr-container');
                    qrContainer.classList.remove('hidden');
                    
                    // Limpiamos el contenedor por si había un QR anterior
                    const qrCodeDiv = document.getElementById('qrcode');
                    qrCodeDiv.innerHTML = '';

                    // Reducimos el texto y quitamos saltos de línea para evitar el error "code length overflow"
                    const qrData = `ID: ${result.id_qr} | Nombre: ${formData.nombre} | Asistencia: ${formData.asistencia} | Pases: ${formData.acompanantes}`;

                    try {
                        // Generamos el Código QR
                        new QRCode(qrCodeDiv, {
                            text: qrData,
                            width: 200,
                            height: 200,
                            colorDark : "#1A1A1A", // Tu color negro
                            colorLight : "#FFFFFF", // Tu color blanco
                            correctLevel : QRCode.CorrectLevel.L // Nivel L maximiza el espacio para texto
                        });
                    } catch (qrError) {
                        console.error("Error al dibujar el QR:", qrError);
                        qrCodeDiv.innerHTML = `<p style="font-size: 0.9rem; margin-top: 10px;">Tu ID de pase es:<br><b style="font-size: 1.2rem;">${result.id_qr}</b></p>`;
                    }

                    // Lógica para descargar el código QR
                    document.getElementById('btn-download-qr').addEventListener('click', () => {
                        const canvas = qrCodeDiv.querySelector('canvas');
                        if (canvas) {
                            const link = document.createElement('a');
                            link.download = `Pase_Boda_${formData.nombre.replace(/\s+/g, '_')}.png`; // Nombre del archivo
                            link.href = canvas.toDataURL('image/png');
                            link.click();
                        }
                    });
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