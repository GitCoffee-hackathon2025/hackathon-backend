class BufferConverter {
  public static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary: string[] = [];

    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary.push(String.fromCharCode(bytes[i]));
    }
    return btoa(binary.join(''));
  }

  public static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);

    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export default BufferConverter;
