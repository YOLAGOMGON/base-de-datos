# Guia linea a linea (archivos sin comentarios en linea)

Este archivo existe porque algunos formatos no permiten comentarios en linea
(por ejemplo JSON). Aqui dejo la explicacion linea por linea como guia.

---

## package.json

L1: Abre el objeto JSON principal del proyecto.
L2: Nombre del paquete/proyecto tal como lo identifica npm.
L3: Version semantica actual del proyecto.
L4: Descripcion breve del proyecto (aqui esta vacia).
L5: Punto de entrada principal (archivo principal si se usa require/import).
L6: Abre el objeto de scripts de npm.
L7: Script de prueba por defecto (muestra un mensaje y falla).
L8: Cierra el objeto de scripts.
L9: Lista de palabras clave para busqueda en npm (vacia).
L10: Autor del proyecto (vacio).
L11: Licencia del proyecto (ISC).
L12: Indica que el proyecto usa modulos ES (import/export).
L13: Abre el objeto de dependencias.
L14: Dependencia para cargar variables de entorno desde .env.
L15: Framework web Express para crear la API.
L16: ODM para usar MongoDB con Mongoose.
L17: SDK oficial de OpenAI para llamadas al modelo.
L18: Cliente de PostgreSQL para Node.js.
L19: Middleware para servir la UI de Swagger.
L20: Cierra el objeto de dependencias.
L21: Cierra el objeto JSON principal.

---

## README.md

L1: Titulo principal del documento con emoji.
L2: Linea en blanco de separacion.
L3: Titulo de la seccion de objetivo.
L4: Linea en blanco.
L5: Indica el objetivo general del proyecto.
L6: Linea en blanco.
L7: Menciona que se debe respetar el ERD.
L8: Menciona que se debe respetar el patron de arquitectura.
L9: Menciona buenas practicas REST.
L10: Menciona la separacion por capas.
L11: Linea en blanco.
L12: Separador horizontal en Markdown.
L13: Linea en blanco.
L14: Titulo de la seccion de modelo de datos.
L15: Linea en blanco.
L16: Introduce las entidades del sistema.
L17: Linea en blanco.
L18: Entidad PATIENT.
L19: Entidad DOCTOR.
L20: Entidad SPECIALTY.
L21: Entidad APPOINTMENT.
L22: Entidad PAYMENT.
L23: Entidad PRESCRIPTION.
L24: Linea en blanco.
L25: Introduce las relaciones principales.
L26: Linea en blanco.
L27: Relacion: paciente tiene muchas citas.
L28: Relacion: doctor tiene muchas citas.
L29: Relacion: especialidad tiene muchos doctores.
L30: Indica que una cita tiene componentes.
L31: Sub-elemento: 1 pago.
L32: Sub-elemento: muchas prescripciones.
L33: Linea en blanco.
L34: Separador horizontal.
L35: Linea en blanco.
L36: Titulo de arquitectura obligatoria.
L37: Linea en blanco.
L38: Indica que se debe seguir el patron.
L39: Linea en blanco.
L40: Inicio de un bloque HTML exportado (estructura visual).
L41: Linea en blanco.
L42: Titulo de responsabilidades.
L43: Linea en blanco.
L44: Subtitulo Controller.
L45: Linea en blanco.
L46: Responsabilidad: recibir request.
L47: Responsabilidad: validar entrada basica.
L48: Responsabilidad: llamar al service.
L49: Responsabilidad: retornar respuesta HTTP.
L50: Linea en blanco.
L51: Subtitulo Service.
L52: Linea en blanco.
L53: Responsabilidad: contener logica de negocio.
L54: Responsabilidad: orquestar repositorios.
L55: Responsabilidad: no interactuar con req/res.
L56: Linea en blanco.
L57: Subtitulo Repository.
L58: Linea en blanco.
L59: Responsabilidad: acceso a base de datos.
L60: Responsabilidad: queries SQL.
L61: Responsabilidad: no logica de negocio.
L62: Linea en blanco.
L63: Separador horizontal.
L64: Linea en blanco.
L65: Titulo de endpoints a implementar.
L66: Linea en blanco.
L67: Seccion de Specialties.
L68: Linea en blanco.
L69: Subtitulo crear especialidad.
L70: Linea en blanco.
L71: Bloque HTML con ejemplo POST /specialties.
L72: Linea en blanco.
L73: Subtitulo listar especialidades.
L74: Linea en blanco.
L75: Bloque HTML con ejemplo GET /specialties.
L76: Linea en blanco.
L77: Separador horizontal.
L78: Linea en blanco.
L79: Seccion de Doctors.
L80: Linea en blanco.
L81: Subtitulo crear doctor.
L82: Linea en blanco.
L83: Bloque HTML con ejemplo POST /doctors.
L84: Linea en blanco.
L85: Indica validacion requerida.
L86: Linea en blanco.
L87: Valida que la especialidad exista.
L88: Linea en blanco.
L89: Subtitulo listar doctores.
L90: Linea en blanco.
L91: Bloque HTML con ejemplo GET /doctors.
L92: Linea en blanco.
L93: Subtitulo filtrar por especialidad.
L94: Linea en blanco.
L95: Bloque HTML con ejemplo GET /doctors?specialty_id=uuid.
L96: Linea en blanco.
L97: Separador horizontal.
L98: Linea en blanco.
L99: Seccion de Patients.
L100: Linea en blanco.
L101: Subtitulo crear paciente.
L102: Linea en blanco.
L103: Bloque HTML con ejemplo POST /patients.
L104: Linea en blanco.
L105: Subtitulo listar pacientes.
L106: Linea en blanco.
L107: Bloque HTML con ejemplo GET /patients.
L108: Linea en blanco.
L109: Subtitulo obtener paciente por ID.
L110: Linea en blanco.
L111: Bloque HTML con ejemplo GET /patients/:id.
L112: Linea en blanco.
L113: Separador horizontal.
L114: Linea en blanco.
L115: Seccion de Appointments.
L116: Linea en blanco.
L117: Subtitulo crear cita.
L118: Linea en blanco.
L119: Bloque HTML con ejemplo POST /appointments.
L120: Linea en blanco.
L121: Indica validaciones requeridas.
L122: Linea en blanco.
L123: Valida que el paciente exista.
L124: Valida que el doctor exista.
L125: Valida que el doctor tenga especialidad correcta.
L126: Valida que la fecha sea valida.
L127: Linea en blanco.
L128: Subtitulo listar citas.
L129: Linea en blanco.
L130: Bloque HTML con ejemplo GET /appointments.
L131: Linea en blanco.
L132: Subtitulo obtener citas por paciente.
L133: Linea en blanco.
L134: Bloque HTML con ejemplo GET /patients/:id/appointments.
L135: Linea en blanco.
L136: Subtitulo obtener citas por doctor.
L137: Linea en blanco.
L138: Bloque HTML con ejemplo GET /doctors/:id/appointments.
L139: Linea en blanco.
L140: Separador horizontal.
L141: Linea en blanco.
L142: Seccion de Prescriptions.
L143: Linea en blanco.
L144: Subtitulo crear prescripcion para una cita.
L145: Linea en blanco.
L146: Bloque HTML con ejemplo POST /appointments/:id/prescriptions.
L147: Linea en blanco.
L148: Indica validaciones requeridas.
L149: Linea en blanco.
L150: Valida que la cita exista.
L151: Linea en blanco.
L152: Subtitulo listar prescripciones por cita.
L153: Linea en blanco.
L154: Bloque HTML con ejemplo GET /appointments/:id/prescriptions.
L155: Linea en blanco.
L156: Separador horizontal.
L157: Linea en blanco.
L158: Seccion de Payments.
L159: Linea en blanco.
L160: Subtitulo registrar pago.
L161: Linea en blanco.
L162: Bloque HTML con ejemplo POST /appointments/:id/payment.
L163: Linea en blanco.
L164: Indica validaciones requeridas.
L165: Linea en blanco.
L166: Valida que la cita exista.
L167: Valida que no exista un pago previo.
L168: Linea en blanco.
L169: Subtitulo obtener pago de una cita.
L170: Linea en blanco.
L171: Bloque HTML con ejemplo GET /appointments/:id/payment.
L172: Linea en blanco.
L173: Separador horizontal.
L174: Linea en blanco.
L175: Titulo de reglas de negocio obligatorias.
L176: Linea en blanco.
L177: Regla 1: doctor requiere especialidad valida.
L178: Regla 2: cita requiere paciente y doctor existentes.
L179: Regla 3: no mas de un pago por cita.
L180: Regla 4: fechas deben ser coherentes.
L181: Regla 5: relaciones deben respetar ERD.
L182: Linea en blanco.
L183: Separador horizontal.
L184: Linea en blanco.
L185: Titulo de validaciones esperadas.
L186: Linea en blanco.
L187: Manejo correcto de errores.
L188: Respuestas JSON consistentes.
L189: No exponer errores internos.
L190: Manejo correcto de UUID.
L191: Linea en blanco.
L192: Separador horizontal.
L193: Linea en blanco.
L194: Titulo de patron esperado en el codigo.
L195: Linea en blanco.
L196: Introduce un ejemplo estructural.
L197: Linea en blanco.
L198: Bloque HTML con ejemplo de nombres de archivos.
L199: Linea en blanco.
L200: Indica lo que NO debe hacer el controller.
L201: Linea en blanco.
L202: No debe contener SQL.
L203: No debe contener logica compleja.
L204: Linea en blanco.
L205: Indica lo que NO debe hacer el repository.
L206: Linea en blanco.
L207: No debe validar reglas de negocio.
L208: No debe tomar decisiones.
L209: Linea en blanco.
L210: Separador horizontal.
L211: Linea en blanco.
L212: Titulo de objetivo final.
L213: Linea en blanco.
L214: Describe que debe permitir el sistema.
L215: Linea en blanco.
L216: Registrar pacientes.
L217: Registrar doctores.
L218: Asignar especialidades.
L219: Crear citas.
L220: Registrar prescripciones.
L221: Registrar pagos.
L222: Consultar relaciones completas.
L223: Linea en blanco.
L224: Indica que el sistema debe funcionar segun el ERD.
L225: Linea en blanco.
L226: Separador horizontal.
L227: Linea en blanco.
L228: Titulo de criterios de evaluacion.
L229: Linea en blanco.
L230: Introduce los criterios.
L231: Linea en blanco.
L232: Implementacion correcta de endpoints.
L233: Respeto del patron de arquitectura.
L234: Calidad del codigo.
L235: Validaciones correctas.
L236: Manejo adecuado de errores.
L237: Claridad en la organizacion del proyecto.
L238: Linea en blanco.
L239: Separador horizontal.
L240: Linea en blanco.
L241: Titulo de restricciones.
L242: Linea en blanco.
L243: No modificar el modelo de datos.
L244: No mezclar responsabilidades entre capas.
L245: No usar logica en rutas.
L246: No usar consultas directas desde el controller.
L247: Linea en blanco.
L248: Separador horizontal.
L249: Linea en blanco.
L250: Titulo de entregables.
L251: Linea en blanco.
L252: Proyecto funcional.
L253: Codigo organizado por modulos.
L254: Base de datos funcionando.
L255: README actualizado si se agrega algo adicional.

---

## Nota sobre package-lock.json

El archivo `package-lock.json` es auto-generado por npm. Si quieres,
puedo explicar secciones especificas, pero no agrego comentarios dentro
del archivo porque debe mantenerse exacto para npm.
