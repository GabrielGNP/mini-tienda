import { readFileSync } from 'node:fs';

// El catálogo se lee una sola vez, al arrancar la API.
const productos = JSON.parse(
  readFileSync(new URL('../data/productos.json', import.meta.url), 'utf8'),
);

export function listarProductos() {
  return productos;
}

export function buscarProducto(id) {
  return productos.find((producto) => producto.id === id) ?? null;
}
