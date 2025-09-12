interface ParametersOfError {
  unknown: unknown;
  inputErro: Uppercase<string>[];
}

type OpcionalParametersOfError = Partial<ParametersOfError>;

class FormatError extends Error {
  constructor(
    public status: number,
    name: string,
    message?: string,
    public parameters?: OpcionalParametersOfError
  ) {
    super(message);
    this.name = name;
  }
}

export default FormatError;
