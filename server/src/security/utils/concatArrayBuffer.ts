function concatArrayBuffer(buf1: ArrayBuffer, buf2: ArrayBuffer): ArrayBuffer {
  // cria um buffer temporario do tamanho da soma
  const tmp = new Uint8Array(buf1.byteLength + buf2.byteLength);

  // pega os valores dos buffers e os coloca nas posições
  tmp.set(new Uint8Array(buf1), 0);
  tmp.set(new Uint8Array(buf2), buf1.byteLength);

  // retorna o buffer resultante
  return tmp.buffer;
}

export default concatArrayBuffer;
