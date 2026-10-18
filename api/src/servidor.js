import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { buscarRuta } from './rutas.js';

export function crearServidor() {
  return http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    const ruta = buscarRuta(req.method, pathname);
    if (!ruta) return responder(res, 404, { error: 'Ruta no encontrada' });

    try {
      const cuerpo = await leerCuerpo(req);
      const respuesta = await ruta.manejar({ parametros: ruta.parametros, cuerpo });
      responder(res, respuesta.estado, respuesta.cuerpo);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return responder(res, 400, { error: 'El cuerpo no es un JSON válido' });
      }
      console.error(error);
      responder(res, 500, { error: 'Error interno del servidor' });
    }
  });
}

function responder(res, estado, cuerpo) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(cuerpo));
}

// Lee el cuerpo de la petición y lo convierte de JSON. Sin cuerpo devuelve null.
async function leerCuerpo(req) {
  let texto = '';
  for await (const parte of req) texto += parte;
  return texto ? JSON.parse(texto) : null;
}

// Solo arranca el servidor si se ejecuta este archivo directamente (npm start).
// Las pruebas importan crearServidor() y lo levantan en un puerto libre.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const puerto = Number(process.env.PUERTO ?? 3000);
  crearServidor().listen(puerto, () => {
    console.log(`API de Mini Tienda escuchando en http://localhost:${puerto}`);
  });
}
