interface ParametersOfError {
  unknown: unknown;
  message: string;
  inputErro: string[];
}

type OpcionalParametersOfError = Partial<ParametersOfError>;

class FormatError extends Error {
  constructor(public status: number, name: string, public parameters?: OpcionalParametersOfError) {
    super(parameters?.message);
    this.name = name;
  }
}

export default FormatError;
