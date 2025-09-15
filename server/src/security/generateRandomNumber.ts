function generateRandomNumber() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return 100000 + (array[0] % (999999 - 100000 + 1));
}

export default generateRandomNumber;
