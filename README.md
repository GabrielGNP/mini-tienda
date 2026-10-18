# Mini Tienda

Carrito de compras de una tienda de auriculares. Proyecto de práctica del Taller de Integración para trabajar con Issues, Pull Requests, protección de ramas, Projects y GitHub Actions.

## Partes

| Carpeta | Qué contiene |
| --- | --- |
| `api/` | API REST en Node.js, sin dependencias externas. |
| `web/` | Página en HTML, CSS y JavaScript puro *(próximamente)*. |

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior.

## Cómo ejecutarlo

```bash
cd api
npm start
```

La API queda disponible en `http://localhost:3000`. Para comprobar que funciona: `http://localhost:3000/api/salud`.

Para usar otro puerto, definir la variable de entorno `PUERTO`.

## Endpoints

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `GET` | `/api/salud` | `{ "estado": "ok" }` |
| `GET` | `/api/productos` | Lista de productos. |
| `GET` | `/api/productos/:id` | Un producto. `404` si no existe, `400` si el id no es un número entero. |

Los errores responden con un cuerpo `{ "error": "mensaje" }`.

## Pruebas

```bash
cd api
npm test
```

## Reglas de negocio

- No se pueden agregar más unidades que el stock del producto.
- El envío cuesta $5.000 y es gratis si el subtotal supera los $100.000.
- Cupones disponibles: `BIENVENIDA10` (10 % de descuento) y `AURIS5000` ($5.000 de descuento con compras desde $50.000).
