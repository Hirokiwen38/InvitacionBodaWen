document.addEventListener('DOMContentLoaded', () => {
    
    function activateReveals() {
        const reveals = document.querySelectorAll('.reveal');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
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

    function activatePhotoSwiperEffect() {
        const swiperContainer = document.querySelector('.photo-swiper-container');
        const cards = document.querySelectorAll('.photo-card');

        if (!swiperContainer || cards.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    cards.forEach(card => card.classList.remove('center'));
                    entry.target.classList.add('center');
                }
            });
        }, {
            root: swiperContainer,
            threshold: 0.6 
        });

        cards.forEach(card => observer.observe(card));
    }

    function activateCountdown() {
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

            if (distance < 0) {
                clearInterval(timer);
                countdownContainer.classList.add('hidden');
                if (messageEl) messageEl.classList.remove('hidden');
                return;
            }

            daysEl.textContent = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
            hoursEl.textContent = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            minsEl.textContent = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            secsEl.textContent = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
        }, 1000);
    }

    activateReveals();
    activatePhotoSwiperEffect();
    activateCountdown();

    const rsvpForm = document.getElementById('rsvp-form');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const submitBtn = rsvpForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            const formData = {
                nombre: document.getElementById('name').value,
                asistencia: document.getElementById('attendance').value,
                acompanantes: document.getElementById('guests').value,
                cancion: document.getElementById('song').value
            };

            try {
                const response = await fetch('https://invitacion-boda-wen.vercel.app/confirmar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.status === 'success') {
                    
                    rsvpForm.classList.add('hidden');
                    const qrContainer = document.getElementById('qr-container');
                    qrContainer.classList.remove('hidden');
                    
                    const qrCodeDiv = document.getElementById('qrcode');
                    qrCodeDiv.innerHTML = '';

                    const qrData = `ID: ${result.id_qr} | Compañìa: ${formData.acompanantes}`;

                    try {
                        new QRCode(qrCodeDiv, {
                            text: qrData,
                            width: 200,
                            height: 200,
                            colorDark : "#1A1A1A", 
                            colorLight : "#FFFFFF", 
                            correctLevel : QRCode.CorrectLevel.M 
                        });
                    } catch (qrError) {
                        console.error("Error al dibujar el QR:", qrError);
                        qrCodeDiv.innerHTML = `<p style="font-size: 0.9rem; margin-top: 10px;">Tu ID de pase es:<br><b style="font-size: 1.2rem;">${result.id_qr}</b></p>`;
                    }

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
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});