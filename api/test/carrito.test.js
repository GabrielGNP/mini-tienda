import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearCarrito, agregarProducto, calcularSubtotal, resumirCarrito } from '../src/carrito.js';

const auricular = { id: 1, nombre: 'Pulse One', precio: 89000, stock: 8 };
const otroAuricular = { id: 3, nombre: 'Bud Mini', precio: 45000, stock: 15 };
const sinStock = { id: 6, nombre: 'Run Clip', precio: 15000, stock: 0 };

test('crearCarrito crea un carrito vacío con el id indicado', () => {
  assert.deepEqual(crearCarrito('abc'), { id: 'abc', items: [] });
});

test('agregarProducto agrega el producto con su cantidad', () => {
  const carrito = agregarProducto(crearCarrito('abc'), auricular, 2);

  assert.deepEqual(carrito.items, [
    { productoId: 1, nombre: 'Pulse One', precio: 89000, cantidad: 2 },
  ]);
});

test('agregarProducto suma la cantidad si el producto ya está en el carrito', () => {
  let carrito = agregarProducto(crearCarrito('abc'), auricular, 2);
  carrito = agregarProducto(carrito, auricular, 3);

  assert.equal(carrito.items.length, 1);
  assert.equal(carrito.items[0].cantidad, 5);
});

test('agregarProducto no modifica el carrito original', () => {
  const original = crearCarrito('abc');
  agregarProducto(original, auricular, 1);

  assert.deepEqual(original.items, []);
});

test('agregarProducto rechaza cantidades que no son enteros mayores que 0', () => {
  for (const cantidad of [0, 1.5, '2', undefined]) {
    assert.throws(
      () => agregarProducto(crearCarrito('abc'), auricular, cantidad),
      { estado: 400 },
      `cantidad: ${cantidad}`,
    );
  }
});

test('agregarProducto rechaza superar el stock, contando lo que ya está en el carrito', () => {
  const carrito = agregarProducto(crearCarrito('abc'), auricular, 6);

  assert.throws(() => agregarProducto(carrito, auricular, 3), { estado: 409 });
});

test('agregarProducto rechaza productos sin stock', () => {
  assert.throws(() => agregarProducto(crearCarrito('abc'), sinStock, 1), { estado: 409 });
});

test('calcularSubtotal suma precio por cantidad de cada ítem', () => {
  let carrito = agregarProducto(crearCarrito('abc'), auricular, 2);
  carrito = agregarProducto(carrito, otroAuricular, 1);

  assert.equal(calcularSubtotal(carrito), 89000 * 2 + 45000);
});

test('resumirCarrito agrega el importe de cada ítem y el subtotal', () => {
  const carrito = agregarProducto(crearCarrito('abc'), auricular, 2);

  assert.deepEqual(resumirCarrito(carrito), {
    id: 'abc',
    items: [{ productoId: 1, nombre: 'Pulse One', precio: 89000, cantidad: 2, importe: 178000 }],
    subtotal: 178000,
  });
});
