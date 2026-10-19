import { ErrorHttp } from './errores.js';

export const COSTO_ENVIO = 5000;
export const ENVIO_GRATIS_DESDE = 100000;

// Reglas de negocio del carrito. Son funciones puras: reciben un carrito y
// devuelven uno nuevo, sin modificar el original. Así se prueban sin servidor.

export function crearCarrito(id) {
  return { id, items: [] };
}

export function agregarProducto(carrito, producto, cantidad) {
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
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

// Reemplaza la cantidad de un producto que ya está en el carrito. Con 0 lo quita.
export function cambiarCantidad(carrito, producto, cantidad) {
  if (!Number.isInteger(cantidad) || cantidad < 0) {
    throw new ErrorHttp(400, 'La cantidad tiene que ser un número entero mayor o igual que 0');
  }
  buscarItem(carrito, producto.id);

  if (cantidad === 0) return quitarProducto(carrito, producto.id);
  if (cantidad > producto.stock) {
    throw new ErrorHttp(409, `No hay stock suficiente de ${producto.nombre} (disponible: ${producto.stock})`);
  }

  const items = carrito.items.map((item) => (item.productoId === producto.id ? { ...item, cantidad } : item));
  return { ...carrito, items };
}

export function quitarProducto(carrito, productoId) {
  buscarItem(carrito, productoId);
  return { ...carrito, items: carrito.items.filter((item) => item.productoId !== productoId) };
}

function buscarItem(carrito, productoId) {
  const item = carrito.items.find((actual) => actual.productoId === productoId);
  if (!item) throw new ErrorHttp(404, 'El producto no está en el carrito');
  return item;
}

export function calcularSubtotal(carrito) {
  return carrito.items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

// El envío es gratis si el subtotal supera ENVIO_GRATIS_DESDE. Un carrito vacío no paga envío.
export function calcularEnvio(subtotal) {
  if (subtotal === 0 || subtotal > ENVIO_GRATIS_DESDE) return 0;
  return COSTO_ENVIO;
}

// Lo que devuelve la API: cada ítem con su importe, el subtotal, el envío y el total.
export function resumirCarrito(carrito) {
  const subtotal = calcularSubtotal(carrito);
  const envio = calcularEnvio(subtotal);
  return {
    id: carrito.id,
    items: carrito.items.map((item) => ({ ...item, importe: item.precio * item.cantidad })),
    subtotal,
    envio,
    total: subtotal + envio,
  };
}
