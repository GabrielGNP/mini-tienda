// Error con código HTTP. Cualquier parte de la API puede lanzarlo y el
// servidor lo convierte en una respuesta { error: mensaje } con ese estado.
export class ErrorHttp extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.estado = estado;
  }
}
