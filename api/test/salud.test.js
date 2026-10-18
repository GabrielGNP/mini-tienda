import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { crearServidor } from '../src/servidor.js';

let servidor;
let url;

// El puerto 0 le pide al sistema operativo un puerto libre.
before(async () => {
  servidor = crearServidor();
  await new Promise((listo) => servidor.listen(0, listo));
  url = `http://localhost:${servidor.address().port}`;
});

after(() => servidor.close());

test('GET /api/salud responde 200 con estado ok', async () => {
  const respuesta = await fetch(`${url}/api/salud`);

  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), { estado: 'ok' });
});

test('una ruta inexistente responde 404', async () => {
  const respuesta = await fetch(`${url}/api/no-existe`);

  assert.equal(respuesta.status, 404);
  assert.deepEqual(await respuesta.json(), { error: 'Ruta no encontrada' });
});
