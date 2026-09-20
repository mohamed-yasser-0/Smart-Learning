function ErrorHandel(message, statusCode) {
    const error = new Error()
    error.message = message;
    error.statusCode = statusCode;
    return error
}
module.exports = ErrorHandel