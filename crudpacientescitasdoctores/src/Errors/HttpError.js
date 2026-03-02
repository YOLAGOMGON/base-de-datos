// Define una clase de error HTTP personalizada.
export class HttpError extends Error {

    // Constructor que recibe el mensaje y el código de estado HTTP.
    constructor(
        message,
        statusCode
    ) {
        // Llama al constructor de la clase Error.
        super();
        // Guarda el mensaje del error.
        this.message = message;
        // Guarda el código HTTP asociado al error.
        this.statusCode = statusCode;
    }

}