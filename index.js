const volanteImg = document.getElementById('volante-img');
let isRotating = false;
let startAngle = 0;
let currentRotation = 0;

volanteImg.addEventListener('touchstart', (e) => {
    isRotating = true;
    const touch = e.touches[0];
    const rect = volanteImg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    startAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
});

volanteImg.addEventListener('touchmove', (e) => {
    if (!isRotating) return;
    const touch = e.touches[0];
    const rect = volanteImg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
    
    currentRotation = (angle - startAngle) * (180 / Math.PI);
    
    // Limitar el giro a 90 grados
    if (currentRotation > 90) currentRotation = 90;
    if (currentRotation < -90) currentRotation = -90;

    volanteImg.style.transform = `rotate(${currentRotation}deg)`;

    // Mandar señales al ESP32 según el giro
    if (currentRotation > 30) send('R');
    else if (currentRotation < -30) send('L');
    else send('S'); // Si está centrado, detener dirección
});

volanteImg.addEventListener('touchend', () => {
    isRotating = false;
    currentRotation = 0;
    volanteImg.style.transform = `rotate(0deg)`; // El volante regresa al centro solo
    send('S');
});
