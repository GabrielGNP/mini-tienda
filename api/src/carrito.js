import { ErrorHttp } from './errores.js';

// Reglas de negocio del carrito. Son funciones puras: reciben un carrito y
// devuelven uno nuevo, sin modificar el original. Así se prueban sin servidor.

export function crearCarrito(id) {
  return { id, items: [] };
}

export function agregarProducto(carrito, producto, cantidad) {
  if (!Number.isInteger(cantidad) || cantidad === 0) {
    throw new ErrorHttp(400, 'La cantidad tiene que ser un número entero mayor que 0');
  }

  const existente = carrito.items.find((item) => item.productoId === producto.id);
  const cantidadTotal = (existente?.cantidad ?? 0) + cantidad;
  if (cantidadTotal > producto.stock) {
    throw new ErrorHttp(409, `No hay stock suficiente de ${producto.nombre} (disponible: ${producto.stock})`);
  }

  const item = {
    productoId: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    cantidad: cantidadTotal,
  };
  const items = existente
    ? carrito.items.map((actual) => (actual.productoId === producto.id ? item : actual))
    : [...carrito.items, item];
  return { ...carrito, items };
}

export function calcularSubtotal(carrito) {
  return carrito.items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

// Lo que devuelve la API: cada ítem con su importe y el subtotal del carrito.
export function resumirCarrito(carrito) {
  return {
    id: carrito.id,
    items: carrito.items.map((item) => ({ ...item, importe: item.precio * item.cantidad })),
    subtotal: calcularSubtotal(carrito),
  };
}
