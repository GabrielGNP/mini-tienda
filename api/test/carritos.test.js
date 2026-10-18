import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { crearServidor } from '../src/servidor.js';

let servidor;
let url;

before(async () => {
  servidor = crearServidor();
  await new Promise((listo) => servidor.listen(0, listo));
  url = `http://localhost:${servidor.address().port}`;
});

after(() => servidor.close());

async function pedir(metodo, ruta, cuerpo) {
  const respuesta = await fetch(`${url}${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  return { estado: respuesta.status, cuerpo: await respuesta.json() };
}

async function nuevoCarrito() {
  const { cuerpo } = await pedir('POST', '/api/carritos');
  return cuerpo.id;
}

test('POST /api/carritos crea un carrito vacío', async () => {
  const { estado, cuerpo } = await pedir('POST', '/api/carritos');

  assert.equal(estado, 201);
  assert.ok(cuerpo.id);
  assert.deepEqual(cuerpo.items, []);
  assert.equal(cuerpo.subtotal, 0);
});

test('GET /api/carritos/:id devuelve el carrito', async () => {
  const id = await nuevoCarrito();
  const { estado, cuerpo } = await pedir('GET', `/api/carritos/${id}`);

  assert.equal(estado, 200);
  assert.equal(cuerpo.id, id);
});

test('GET /api/carritos/:id responde 404 si el carrito no existe', async () => {
  const { estado } = await pedir('GET', '/api/carritos/no-existe');

  assert.equal(estado, 404);
});

test('POST /api/carritos/:id/items agrega un producto y calcula el subtotal', async () => {
  const id = await nuevoCarrito();
  const { estado, cuerpo } = await pedir('POST', `/api/carritos/${id}/items`, { productoId: 3, cantidad: 2 });

  assert.equal(estado, 200);
  assert.equal(cuerpo.items.length, 1);
  assert.equal(cuerpo.items[0].cantidad, 2);
  assert.equal(cuerpo.subtotal, 90000);
});

test('POST /api/carritos/:id/items guarda el producto en el carrito', async () => {
  const id = await nuevoCarrito();
  await pedir('POST', `/api/carritos/${id}/items`, { productoId: 3, cantidad: 2 });
  const { cuerpo } = await pedir('GET', `/api/carritos/${id}`);

  assert.equal(cuerpo.subtotal, 90000);
});

test('POST /api/carritos/:id/items responde 404 si el producto no existe', async () => {
  const id = await nuevoCarrito();
  const { estado } = await pedir('POST', `/api/carritos/${id}/items`, { productoId: 99, cantidad: 1 });

  assert.equal(estado, 404);
});

test('POST /api/carritos/:id/items responde 409 si no hay stock', async () => {
  const id = await nuevoCarrito();
  const { estado, cuerpo } = await pedir('POST', `/api/carritos/${id}/items`, { productoId: 6, cantidad: 1 });

  assert.equal(estado, 409);
  assert.ok(cuerpo.error);
});

test('POST /api/carritos/:id/items responde 400 si la cantidad es 0', async () => {
  const id = await nuevoCarrito();
  const { estado } = await pedir('POST', `/api/carritos/${id}/items`, { productoId: 3, cantidad: 0 });

  assert.equal(estado, 400);
});

test('POST /api/carritos/:id/items responde 400 si la cantidad es negativa', async () => {
  const id = await nuevoCarrito();
  const { estado } = await pedir('POST', `/api/carritos/${id}/items`, { productoId: 3, cantidad: -2 });
  const { cuerpo } = await pedir('GET', `/api/carritos/${id}`);

  assert.equal(estado, 400);
  assert.equal(cuerpo.subtotal, 0);
});

test('POST /api/carritos/:id/items responde 400 si el cuerpo no es JSON', async () => {
  const id = await nuevoCarrito();
  const respuesta = await fetch(`${url}/api/carritos/${id}/items`, { method: 'POST', body: '{ esto no es json' });

  assert.equal(respuesta.status, 400);
});
