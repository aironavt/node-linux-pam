class PamError extends Error {
  constructor(message, code) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = 'PamError';
    this.code = code;

    Error.captureStackTrace(this, PamError);
  }
}

module.exports = PamError;
