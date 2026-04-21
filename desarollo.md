# SUTRAN contrato EMV v2 - Transcripción completa en Markdown

> Conversión completa del PDF a Markdown, preservando el contenido visible del documento lo más fielmente posible, incluyendo encabezados repetidos, tablas, bloques JSON, textos de soporte y notas visibles.

---

## Página 1

**[Logotipo visible: E77AG]**

**EDDAS HG SAC**  
RUC 20539472390  
Av. Cayma 612 Int 402  
Cayma Arequipa Perú  
+51[54]640200  
info@eddas.com.pe

# /api/v2.0/transmisiones

## URL Requeridos para Consumó

**Desarrollo**  
<https://ws03.sutran.ehg.pe/api/v2.0/transmisiones>

**Producción**  
<https://ws03.sutran.gob.pe/api/v2.0/transmisiones>

## Sinopsis

### Petición

```http
POST /api/v2.0/transmisiones
Access-token: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

```json
{
  "plate": "VAC036",
  "geo": [-11.410890, -76.9604001],
  "direction": 38,
  "event": "ER",
  "speed": 50,
  "time_device": "2023-04-13 23:59:01",
  "imei": "123456789012345"
}
```

### Respuesta

```json
{
  "crc": "yB5kht",
  "code": 2000,
  "result": "OK"
}
```

## Manejo de la Petición

La petición debidamente formateada en JSON como minimo debe de cumplir con el siguiente equema

**Campos requeridos**: `plate`, `geo`, `direction`, `event`, `speed`, `time_device`  
**Campos opcionales**: `imei`

### Propiedades de los campos

| Parámetro | Campo | Tipo | Obligatorio | Observación |
|---|---|---|---|---|
| Header | access-token | uuid | *************** | El token es el identificador de la Empresa de Monitoreo Vehicular |
| Body | plate | string | HEN123 | Placa del vehículo, cadena de seis caracteres |
| Body | geo | array | [-11.410890 , -76.9604001] | Arreglo de dos numeros [latitud y la longitud] |
| Body | direction | Int | 38 | Rumbo - Sentido del desplazamiento en grados. Entero que debe de tener valores entre 0 y 360 |
| Body | event | string | ER/PA/BP | Valor del evento. **BP**: Botón de pánico. **ER**: En ruta (a partir de la velocidad > 0 km/h). **PA**: Parada (a partir de la velocidad = 0 km/h) |
| Body | speed | int | 50 | Velocidad de desplazamiento km/h. Numero entero |
| Body | time_device | date | 2023-04-13 10:47:00 | Fecha de envío de la posición del dispositivo GPS. Cadena de fecha en formato YYYY-MM-DD HH:MM:SS esta hora debera estar formateada en GMT-5 y no en UTC |
| Body | imei | int | 123456789102356 | Número de 15 digitos |

En la capa de seguridad tenermos el campo access-token el cual se deberá de mandar en la cabecera de la petición, esta en formato UUID y es una cadena que sera generada por la EMV desde su consola grafica, debe de tener el valor directo **NO USANDO Authorization: Bearer** debiendo usar en su lugar `access-token: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

## Página 2

**[Logotipo visible: E77AG]**

**EDDAS HG SAC**  
RUC 20539472390  
Av. Cayma 612 Int 402  
Cayma Arequipa Perú  
+51[54]640200  
info@eddas.com.pe

## Manejo de respuestas

Siempre el servicio Web entregara los campos `code` y `result` los cuales pueden tener los siguientes valores

| code | result |
|---|---|
| 5001 | Este servicio solo admite metodos post |
| 5002 | Se requiere header access-token |
| 5003 | access-token invalid |
| 4001 | Cadena JSON Invalida |
| 4002 | Cadena JSON no cumple caracteristicas |
| 2000 | OK |

Como se puede apreciar en la tabla de codigos existen los tipo 5XXX que se refiere a la capa de conexión y la 4XXX que se refiere al contenido los 2XXX que se refiere a las tramas aceptadas que a continuacion se detalla

### 2000

Se confirma que la trama fue recibida con éxito adicionalmente se entregara un validador como evidencia de la entrega dentro del campo CRC que es una cadena de 6 caracteres dentro del conjunto `([0-9][a-z][A-Z])`

```json
{
  "crc": "yB5kht",
  "code": 2000,
  "result": "OK"
}
```

### 5001

Cuando la petición es realizada por un metodo diferente a POST, se recomienda en este caso se revise la manera que se realiza la petición.

### 5002

Si bien la petición se recibe como POST no contiene el header “access-token” el cual para entornos de producción debe ser generado desde la interface gui de la EMV / ADM.

### 5003

Si bien se envia el header “access-token” este no se encuentra en la lista de token para poder consumir el recurso.

### 4004

La fecha del reporte del dispositivo esta en el futuro

### 4003

La fecha del reporte del dispoitivo esta en el pasado (mayor a 20 dias)

### 4001

Se refiere que la cadena enviada en el BODY NO es una cadena formateada bajo el estandar JSON.

### 4002

Se refiere que la cadena enviada no cumple los requisitos de datos minimos, este mensaje de error tambien conlleva una explicación sobre los elementos los cuales no cumplen los requerimientos minimos de información como se muestra a continuacion con esta petición de ejemplo que intencionalmente se introdujo tres errores:

**Dando la siguiente respuesta**

```json
{
  "error": [
    {
      "path": "/direction",
      "txt": "Missing property."
    },
    {
      "path": "/geo/0",
      "txt": "Expected number - got string."
    },
    {
      "path": "/plate",
      "txt": "String is too long: 7/6."
    },
    {
      "path": "/speed",
      "txt": "Expected integer - got number."
    }
  ],
  "code": 4002,
  "result": "Cadena JSON no cumple caracteristicas"
}
```

Como se puede puede observar en la trama de respuesta al momento de tener un error 4002 se adjunta un arreglo “error” el cual contiene dos elementos; el `path` que es la ruta que no paso la ruta de validacion y el `txt` que es una explicacion de la regla que no cumplio en la etapa de validacion del ejemplo podemos sacar la siguiente respuesta:

0 Problema que no se recibio el campo direction  
1 Se debia recibir un numero y no una cadena  
2 La placa tiene 7 caracteres se esperaba 6

---
