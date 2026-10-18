import { randomUUID } from 'node:crypto';
import { listarProductos, buscarProducto } from './catalogo.js';
import { crearCarrito, agregarProducto, resumirCarrito } from './carrito.js';
import { ErrorHttp } from './errores.js';

// Los carritos se guardan en memoria: se pierden al reiniciar la API.
const carritos = new Map();

function obtenerCarrito(id) {
  const carrito = carritos.get(id);
  if (!carrito) throw new ErrorHttp(404, 'Carrito no encontrado');
  return carrito;
}

// Tabla de rutas de la API: método HTTP, patrón de la URL y función que la atiende.
// Cada función recibe { parametros, cuerpo } y devuelve { estado, cuerpo }.
const rutas = [
  {
    metodo: 'GET',
    patron: '/api/salud',
    manejar: () => ({ estado: 200, cuerpo: { estado: 'ok' } }),
  },
  {
    metodo: 'GET',
    patron: '/api/productos',
    manejar: () => ({ estado: 200, cuerpo: listarProductos() }),
  },
  {
    metodo: 'GET',
    patron: '/api/productos/:id',
    manejar: ({ parametros }) => {
      const id = Number(parametros.id);
      if (!Number.isInteger(id)) {
        throw new ErrorHttp(400, 'El id del producto tiene que ser un número entero');
      }

      const producto = buscarProducto(id);
      if (!producto) throw new ErrorHttp(404, 'Producto no encontrado');
      return { estado: 200, cuerpo: producto };
    },
  },
  {
    metodo: 'POST',
    patron: '/api/carritos',
    manejar: () => {
      const carrito = crearCarrito(randomUUID());
      carritos.set(carrito.id, carrito);
      return { estado: 201, cuerpo: resumirCarrito(carrito) };
    },
  },
  {
    metodo: 'GET',
    patron: '/api/carritos/:id',
    manejar: ({ parametros }) => ({ estado: 200, cuerpo: resumirCarrito(obtenerCarrito(parametros.id)) }),
  },
  {
    metodo: 'POST',
    patron: '/api/carritos/:id/items',
    manejar: ({ parametros, cuerpo }) => {
      const carrito = obtenerCarrito(parametros.id);
      const producto = buscarProducto(cuerpo?.productoId);
      if (!producto) throw new ErrorHttp(404, 'Producto no encontrado');

      const actualizado = agregarProducto(carrito, producto, cuerpo.cantidad);
      carritos.set(actualizado.id, actualizado);
      return { estado: 200, cuerpo: resumirCarrito(actualizado) };
    },
  },
];

export function buscarRuta(metodo, ruta) {
  for (const r of rutas) {
    if (r.metodo !== metodo) continue;
    const parametros = coincidir(r.patron, ruta);
    if (parametros) return { manejar: r.manejar, parametros };
  }
  return null;
}

// Compara '/api/productos/:id' con '/api/productos/3' y devuelve { id: '3' }.
// Si la ruta no coincide con el patrón, devuelve null.
function coincidir(patron, ruta) {
  const partesPatron = patron.split('/');
  const partesRuta = ruta.split('/');
  if (partesPatron.length !== partesRuta.length) return null;

  const parametros = {};
  for (let i = 0; i < partesPatron.length; i++) {
    if (partesPatron[i].startsWith(':')) {
      parametros[partesPatron[i].slice(1)] = decodeURIComponent(partesRuta[i]);
    } else if (partesPatron[i] !== partesRuta[i]) {
      return null;
    }
  }
  return parametros;
}
