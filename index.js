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


let dispositivoBT;
let caracteristicaTX;

// UUIDs estándar para comunicación serial por Bluetooth LE
const SERVICIO_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const CARACTERISTICA_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

const botonConectar = document.getElementById('btn-bluetooth');

botonConectar.addEventListener('click', async () => {
    if (dispositivoBT && dispositivoBT.gatt.connected) {
        dispositivoBT.gatt.disconnect();
        botonConectar.innerText = "CONECTAR CARRITO";
        botonConectar.classList.remove('connected');
        return;
    }

    try {
        console.log('Buscando ESP32...');
        dispositivoBT = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'ESP32' }], // Tu ESP32 debe llamarse algo que empiece con "ESP32"
            optionalServices: [SERVICIO_UUID]
        });

        const servidor = await dispositivoBT.gatt.connect();
        const servicio = await servidor.getPrimaryService(SERVICIO_UUID);
        caracteristicaTX = await servicio.getCharacteristic(CARACTERISTICA_UUID);

        botonConectar.innerText = "DESCONECTAR";
        botonConectar.classList.add('connected');
        alert("¡Conectado al volante del futuro!");

    } catch (error) {
        console.error("Error de Bluetooth:", error);
        alert("No se pudo conectar. Asegúrate de estar en HTTPS y con Bluetooth activo.");
    }
});

// Función para enviar los comandos al carrito
async function enviarComando(comando) {
    console.log("Comando:", comando);
    
    if (caracteristicaTX) {
        try {
            const encoder = new TextEncoder();
            await caracteristicaTX.writeValue(encoder.encode(comando));
        } catch (error) {
            console.error("Error al enviar comando:", error);
        }
    }
}

