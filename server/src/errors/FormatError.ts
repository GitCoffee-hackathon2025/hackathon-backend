class FormatError extends Error {
  constructor(public status: number, name: string, message: string, public original?: unknown) {
    super(message);

    this.name = name;
  }
}

export default FormatError;
