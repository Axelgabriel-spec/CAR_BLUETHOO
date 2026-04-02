 let device, server, characteristic;
        const serviceUuid = "0000ffe0-0000-1000-8000-00805f9b34fb"; // Genérico SPP
        const charUuid = "0000ffe1-0000-1000-8000-00805f9b34fb";

        async function connectBT() {
            try {
                device = await navigator.bluetooth.requestDevice({
                    filters: [{ name: 'Carro_Control_Gemini' }],
                    optionalServices: [serviceUuid]
                });
                document.getElementById('status').innerText = "Conectando...";
                server = await device.gatt.connect();
                const service = await server.getPrimaryService(serviceUuid);
                characteristic = await service.getCharacteristic(charUuid);
                document.getElementById('status').innerText = "Estado: ¡CONECTADO!";
            } catch (error) {
                console.log(error);
                alert("Error al conectar: " + error);
            }
        }

        function send(command) {
            if (characteristic) {
                const encoder = new TextEncoder();
                characteristic.writeValue(encoder.encode(command));
                console.log("Enviado: " + command);
            }
        }

        function switchMode(mode) {
            document.getElementById('control-arrows').style.display = mode === 'arrows' ? 'grid' : 'none';
            document.getElementById('control-wheel').style.display = mode === 'wheel' ? 'flex' : 'none';
        }

        // Animación básica del volante
        let volante = document.getElementById('volante');
        volante.addEventListener('touchstart', () => volante.style.transform = 'rotate(45deg)');
        volante.addEventListener('touchend', () => volante.style.transform = 'rotate(0deg)');
