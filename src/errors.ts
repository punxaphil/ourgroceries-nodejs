export class InvalidLoginException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidLoginException';
  }
}

export class OurGroceriesApiException extends Error {
  command?: string;
  statusCode?: number;
  causeError?: unknown;

  constructor(message: string, command?: string, opts?: { statusCode?: number; cause?: unknown }) {
    super(message);
    this.name = 'OurGroceriesApiException';
    this.command = command;
    this.statusCode = opts?.statusCode;
    this.causeError = opts?.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static fromStatus(command: string, statusCode: number): OurGroceriesApiException {
    return new OurGroceriesApiException(`HTTP ${statusCode} returned for command '${command}'.`, command, {
      statusCode,
    });
  }

  static fromTransport(command: string, underlying: unknown): OurGroceriesApiException {
    const msg = underlying instanceof Error ? underlying.message : String(underlying);
    return new OurGroceriesApiException(`Network/transport failure executing command '${command}': ${msg}`, command, {
      cause: underlying,
    });
  }
}
