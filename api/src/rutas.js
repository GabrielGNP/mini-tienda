import { listarProductos, buscarProducto } from './catalogo.js';
import { ErrorHttp } from './errores.js';

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
