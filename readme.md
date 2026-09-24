# Trabajo practico 05

## Descripción

El proyecto permite consultar las reservas existentes, ver el detalle de una reserva, crear una nueva reserva mediante un formulario web.

Las reservas se almacenan unicamente en memoria, por lo que se reinicia al volver a inicar el servidor y unicamente aparecen las 4 reservas inciales.

## Instalacion 

Para la instalacion utilizamos el siguiente codigo en la terminal

```
npm install
```
## Ejecucion 

Para ejecutar el servidor tenemos que usar el siguiente codigo en la terminal

```
npm start
```

Y va a mostrar que el servidor esta disponible en:
http://localhost:3000

Y por ultimo para comprobar la sintaxis

```
npm run check
```

## Rutas

GET / -> Pagina de Inicio
GET /estado -> Estado del servicio en formato JSON
GET /reservas -> Lista de reservas
GET /reservas/nueva -> Formulario para crear una reserva nueva 
GET /reservas/:id -> Detalle de una reserva
POST /reservas -> Valida y crea un reserva

## Pipeline de middleware

El orden principal es:

Morgan
   ↓
identificarSolicitudes
   ↓
medirDuracion
   ↓
express-ejs-layouts
   ↓
express.static
   ↓
express.urlencoded
   ↓
express.json
   ↓
rutas
   ↓
reservasRouter
   ↓
validarReserva
   ↓
crearReserva
   ↓
404 final
POST válido
POST /reservas
   ↓
validarReserva
   ↓
crearReserva
   ↓
302 /reservas
POST inválido
POST /reservas
   ↓
validarReserva
   ↓
400 + formulario con error

* Alcance de cada funcion: 

Morgan e indentificarSolicitudes se aplican de forma global a todas las solicitudes.

medirDuracion tambien se aplica de forma global y registra la duracion cuando termina cada respuesta.

El middleware del router se aplica solamente a las rutas de reservas.

validarReserva se aplica solamente al POST de `/reservas`.

Los parsers `express.urlencoded` y `express.json` permiten obtener los datos enviados por el cliente antes de realizar la validación.

* Tipos de middleware:

Los middleware incorporados son lo que proporciona express como `express.urlencoded`, `express.json` y `express.static`.

El middleware de terceros es propcionados por paquetes externos como `morgan` y `express-ejs-layouts`.

Los middleware personalizados son funciones creadas en el proyecto, como `indentificarSolicitudes`, `medirDuracion` y `validarReserva`.

* Uso de next():

`next()` se utiliza para pasar la solicitud al siguiente middleware o ruta. Si un middleware termina la respuesta, como ocurre con una validación incorrecta, no se utiliza `next()`.

* Parsers y evento finish:

Los parsers aparecen antes de la validación porque permiten que Express interprete los datos enviados en el formulario y los coloque en `req.body`. De esta forma, `validarReserva` puede acceder a esos datos.

El evento `finish` se utiliza para medir la duración real de la solicitud una vez que la respuesta terminó.

## Validacion

Se controla:
* Estudiante obligatorio.
* Email válido.
* Sala permitida.
* Fecha obligatoria.
* Turno válido.
* Entre 1 y 6 personas.

Los valores del formulario se conservan cuando existe un error.

## Pruebas manuales

Se probaron diferentes solicitudes para comprobar el funcionamiento del sistema:

* GET `/` → 200.
* GET `/reservas` → 200.
* POST `/reservas` válido → 302.
* POST `/reservas` inválido → 400.
* GET `/reservas/999` → 404.
* GET `/cualquier-cosa` → 404.

También se comprobó que los identificadores de solicitud aumentan de forma consecutiva y que se registra la duración de cada solicitud en la terminal.

### Montaje del router

El router de reservas se monta en `/reservas`, por lo que las rutas definidas dentro del router utilizan ese prefijo. Por ejemplo, `GET /` dentro del router corresponde a `GET /reservas`.

### POST 302 y GET posterior

Cuando se crea una reserva correctamente, el servidor responde con un estado 302 y redirige a `/reservas`. El navegador realiza después un nuevo GET para mostrar la lista actualizada de reservas.

## Persistencia temporal

Las reservas se almacenan únicamente en memoria. Al reiniciar el servidor vuelven a aparecer las 4 reservas iniciales.

Las nuevas reservas desaparecen porque no se guardan en una base de datos ni en un archivo. Al reiniciar Node.js, se vuelve a ejecutar el programa y se crea nuevamente el arreglo inicial.