# Instalación GPSWOX to SUTRAN Retransmitter - Rocky Linux 9.4

## Requisitos del sistema
- Rocky Linux 9.4 (Blue Onyx)
- RAM: 3.6 GiB (disponible ~1.8 GiB)
- El servicio consume ~50MB RAM

---

## 1. Actualizar sistema

```bash
sudo dnf update -y
```

## 2. Instalar Node.js 20

```bash
sudo dnf install -y nodejs npm
node --version
```

## 3. Crear usuario para el servicio

```bash
sudo useradd -m -s /bin/false gpsretransmitter
```

## 4. Copiar proyecto al servidor

En tu máquina local, primero ejecutar build:
```bash
cd C:\apiwox
npm run build
```

Luego copiar al servidor:
```bash
scp -r ./dist config.yaml package.json usuario@IP_SERVIDOR:/home/gpsretransmitter/
```

## 5. Instalar dependencias

```bash
cd /home/gpsretransmitter
npm install --production
```

## 6. Configurar variables de entorno

```bash
sudo nano /etc/environment
```

Agregar:
```
GPSWOX_API_HASH=tu_hash_aqui
SUTRAN_ACCESS_TOKEN=tu_token_aqui
GPSWOX_URL=https://drsecuritygps.com/api
SUTRAN_URL=https://wstr.sutran.gob.pe/api/v2.0
```

## 7. Configurar permisos

```bash
sudo chown -R gpsretransmitter:gpsretransmitter /home/gpsretransmitter
```

## 8. Crear servicio systemd

```bash
sudo nano /etc/systemd/system/gps-retransmitter.service
```

Contenido:
```ini
[Unit]
Description=GPSWOX to SUTRAN Retransmission Service
After=network.target

[Service]
Type=simple
User=gpsretransmitter
WorkingDirectory=/home/gpsretransmitter
EnvironmentFile=/etc/environment
ExecStart=/usr/bin/node /home/gpsretransmitter/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 9. Habilitar y arrancar

```bash
sudo systemctl daemon-reload
sudo systemctl enable gps-retransmitter
sudo systemctl start gps-retransmitter
```

## 10. Verificar funcionamiento

Ver estado:
```bash
sudo systemctl status gps-retransmitter
```

Ver logs en tiempo real:
```bash
sudo journalctl -u gps-retransmitter -f
```

Ver todos los logs:
```bash
sudo journalctl -u gps-retransmitter --no-pager
```

## 11. Reiniciar servicio (si hay cambios)

```bash
sudo systemctl restart gps-retransmitter
```

## Configuración

El intervalo de polling se configura en `config.yaml`:
```yaml
gpswox:
  polling_interval_ms: 30000  # 30 segundos
```

---

## Solución de problemas

### Si el servicio no inicia:
```bash
sudo journalctl -u gps-retransmitter -n 50
```

### Verificar variables de entorno:
```bash
sudo systemctl show-environment
```

### Reiniciar y ver logs:
```bash
sudo systemctl restart gps-retransmitter && sudo journalctl -u gps-retransmitter -f
```

---

## Credenciales necesarias

- **GPSWOX_API_HASH**: Hash de API de GPSWOX (obtenido del login)
- **SUTRAN_ACCESS_TOKEN**: Token de acceso SUTRAN

Ejemplo de login para obtener hash:
```bash
curl -X POST https://drsecuritygps.com/api/login \
  -d "email=sutran@drsecurity.com&password=Sutran2026"
```

Respuesta incluye `user_api_hash` para usar en `GPSWOX_API_HASH`.