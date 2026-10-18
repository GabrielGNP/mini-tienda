import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listarProductos, buscarProducto } from '../src/catalogo.js';

test('listarProductos devuelve los 6 productos del catálogo', () => {
  assert.equal(listarProductos().length, 6);
});

test('buscarProducto devuelve el producto con ese id', () => {
  assert.equal(buscarProducto(3).nombre, 'Bud Mini');
});

test('buscarProducto devuelve null si el producto no existe', () => {
  assert.equal(buscarProducto(99), null);
});
