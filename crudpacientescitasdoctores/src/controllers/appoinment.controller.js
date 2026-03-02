// Importa el SDK de OpenAI para usar modelos de lenguaje.
import OpenAI from "openai";
// Crea un cliente con la configuración por defecto (usa OPENAI_API_KEY).
const client = new OpenAI();

// Función de triage que consulta al modelo con los datos del paciente.
async function triage (name, age , symptoms) {

    // Solicita una respuesta estructurada en JSON al modelo.
    const response = await client.chat.completions.create({
        // Modelo a utilizar para la respuesta.
        model: "gpt-4.1-nano",
        // Indica que la respuesta debe ser un objeto JSON.
        response_format: {
            type: "json_object"
        },
        // Mensajes del sistema y del usuario para contextualizar.
        messages: [
            {
                // Mensaje del sistema: define el rol del asistente.
                role: "system",
                // Instrucciones detalladas para generar el triage en JSON.
                content: "Eres un asistente de triage médico. Evalúa los síntomas del paciente y asigna una prioridad de atención: 'Alta', 'Media' o 'Baja'. Responde solo con un objeto JSON que contenga la prioridad asignada, una explicacion de porque esa prioridad que fue asignada y tambien una propiedad donde se especifique si la persona debe ir a una cita o no (required_appoinment) cuyo nombre sea con snake case y con el nombre de la propiedad en ingles si te piden algo adicional que no sea relacionado a salud o un estado medico responde que no estas entrenado para ese tipo de situaciones si no enfocados en triage y temas de salud dejando claro tu proposito y hazlo como un aviso no como un diagnostico medico ademas asigna una especialidad en el json y coloca especialidad ${numero} y ese numero que sea del 1 al 20 de acuerdo a la complejidad del caso donde 1 es lo mas bajo y 20 lo mas alto agrega en caso de que no requiera una cita agrega una propiedad en el json que se llame response y muestre un mensaje de que no requiere cita y el porque no aplica la cita."
            },
            {
                // Mensaje del usuario con los datos dinámicos del paciente.
                role: "user",
                // Texto del usuario formateado con plantilla.
                content: `Paciente: ${name},
                Edad: ${age},
                Sintomas: ${symptoms}`
            }
        ]

    });

    // Convierte el contenido JSON devuelto a un objeto de JavaScript.
    return JSON.parse(response.choices[0].message.content);

}


// Controlador para crear una cita con base en el triage.
export const create = async (req, res) => {

    // Extrae datos del paciente desde el body.
    const { name, age, symptoms } = req.body;

    // 1. Hacer el triage
    // Ejecuta el triage usando el modelo.
    const triageResult = await triage(name, age, symptoms);

    // 2. Validar si el ususario necesita la cita
    // Muestra el resultado del triage en consola.
    console.log(triageResult);

    // Si no requiere cita, responde inmediatamente con el mensaje.
    if (triageResult.required_appoinment === false) {
        res.status(200).json({response: `${triageResult.response}`});
    }

    // 3. Agendar la cita medica en caso de que aplique
    // Aquí iría la lógica de creación de cita en base de datos.

    // Respuesta final indicando que la cita fue creada.
    res.status(200).json({response: 'Cita creada'});
};