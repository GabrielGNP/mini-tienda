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

test('GET /api/productos devuelve el catálogo completo', async () => {
  const respuesta = await fetch(`${url}/api/productos`);
  const productos = await respuesta.json();

  assert.equal(respuesta.status, 200);
  assert.equal(productos.length, 6);
  assert.deepEqual(Object.keys(productos[0]), ['id', 'nombre', 'marca', 'tipo', 'precio', 'stock']);
});

test('GET /api/productos/:id devuelve un producto', async () => {
  const respuesta = await fetch(`${url}/api/productos/2`);
  const producto = await respuesta.json();

  assert.equal(respuesta.status, 200);
  assert.equal(producto.id, 2);
  assert.equal(producto.nombre, 'Pulse One Pro');
});

test('GET /api/productos/:id responde 404 si el producto no existe', async () => {
  const respuesta = await fetch(`${url}/api/productos/99`);
  const cuerpo = await respuesta.json();

  assert.equal(respuesta.status, 404);
  assert.ok(cuerpo.error);
});

test('GET /api/productos/:id responde 400 si el id no es un número entero', async () => {
  for (const id of ['abc', '1.5']) {
    const respuesta = await fetch(`${url}/api/productos/${id}`);
    const cuerpo = await respuesta.json();

    assert.equal(respuesta.status, 400, `id: ${id}`);
    assert.ok(cuerpo.error);
  }
});
