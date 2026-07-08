# CLAUDE.md — Contexto del proyecto feria-app / Bot Dipamex

## Proyecto y modelo de negocio

**feria-app** es un sistema MERN (Express + MongoDB + React) que Mau desarrolló para **Dipamex**, un distribuidor de papelería en Tuxtla Gutiérrez. Se está extendiendo con un módulo nuevo: un **bot de WhatsApp** que atiende clientes durante la temporada escolar (agosto-septiembre) para vender listas de útiles.

**Modelo de negocio del bot:**
- 70-90% de casos: escuelas con "convenio" — Dipamex ya tiene la lista de útiles pre-armada, el bot solo la cotiza.
- 10-30% de casos: escuelas sin convenio — el cliente manda su lista (foto/PDF/texto), la IA la procesa, un operativo la valida en el panel, y queda guardada para futuros clientes.
- El bot cobra $100 fijos de anticipo, el resto se paga al recoger o entregar.
- Las cotizaciones del bot siempre usan `priceContado` (sin descuento) y desglosan IVA 16% (Subtotal/IVA/Total), igual que sus cotizaciones formales de mostrador.

## Estructura del proyecto

```
fería-proyecto/
├── client/                    ← Frontend React (Vite), deploy en Netlify
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/        (ConfirmDialog, Modal, Navbar, etc.)
│   │   ├── context/           (AuthContext)
│   │   ├── pages/             (Customers, Dashboard, Login, Orders, Products, Users)
│   │   └── services/api.js
│   └── vite.config.js
│
└── server/                    ← Backend Express, deploy en Railway
    ├── src/
    │   ├── index.js           (entry point)
    │   ├── config/            (db.js, seeds existentes)
    │   ├── middleware/auth.js
    │   ├── models/            (Customer, Product, Order, User, Conversation, School, SchoolList)
    │   ├── routes/            (auth, customers, export, orders, products)
    │   └── bot/               ← Módulo nuevo del bot
    │       ├── webhook.js
    │       ├── whatsapp-client.js
    │       ├── school-matcher.js
    │       ├── quote-service.js
    │       ├── pdf-generator.js
    │       ├── assets/logo.jpeg
    │       └── state-machine/
    │           ├── router.js
    │           ├── states.js
    │           └── handlers/
    ├── scripts/            (seed-schools.js, seed-mi-pequeno-hogar.js, test-quote-pdf.js)
    └── .env
```

## Stack

- Backend: Node.js + Express, JavaScript puro (NO TypeScript).
- DB: MongoDB Atlas + Mongoose.
- Frontend: React con Vite + Context API para auth (NO Redux, NO Zustand).
- Deploy: Netlify (client) + Railway (server), auto-deploy en cada push a main.
- WhatsApp: Meta Cloud API (directa, sin BSP intermediario como Twilio o Wati).
- IA: por definir. Probablemente Anthropic Claude Haiku para conversación libre y Claude Sonnet Vision para procesar listas en imagen.
- PDF: `pdfmake` (JS puro, sin Chromium/binarios nativos — importante por la RAM limitada de Railway).

## Patrones importantes que se deben respetar

- Todos los modelos siguen el estilo de `server/src/models/Customer.js` (Schema + `module.exports = mongoose.model(...)`).
- Handlers de la state machine: cada uno exporta una función `async` que recibe `(conversation, message)` y devuelve `{ nextState, contextUpdate }`.
- El webhook llama a `stateRouter.route()`, éste al handler correcto según `conversation.currentState`.
- La memoria conversacional se guarda en `Conversation.context` (Mongoose Schema.Types.Mixed).
- JavaScript, NO TypeScript. Sin `.ts`, sin `interface`, sin `type`.

---

## Estado actual del bot (7 de julio de 2026)

### Infraestructura ya funcionando en producción (Railway)
- Webhook de Meta configurado y verificado, recibe mensajes en `/bot/webhook`.
- Token permanente de Meta configurado (System User Token).
- Deploy automático con `git push` a main.
- MongoDB Atlas conectado.

### Modelos de datos creados
- `Conversation` — memoria conversacional del bot. Guarda `whatsappId`, `currentState`, `context` (Mixed), `profileName`, referencia opcional a `Customer`.
- `School` — escuelas con `name`, `nameNormalized` (sin acentos), `aliases`, `city`, `isConvenio`, `registeredVia`. Tiene método estático `School.normalize(text)` para quitar acentos.
- `SchoolList` — lista de útiles por combinación `school + level + grade + sex` (índice único compuesto). Cada item en `items[]` tiene `product` (ref), `quantity` y `priceContado` (snapshot del precio al momento de crear/editar la lista, no en vivo). Tiene `isActive` para desactivar listas viejas sin borrarlas.

### Handlers implementados (flujo de convenio completo hasta la cotización)
1. `INITIAL` — saludo al primer mensaje, pide nombre.
2. `ONBOARDING_NAME` — valida y guarda nombre, pide correo.
3. `ONBOARDING_EMAIL` — valida formato de correo y guarda, pide escuela.
4. `ASK_SCHOOL` — recibe nombre de escuela y hace fuzzy match; puede resultar EXACT_MATCH, MULTIPLE_MATCHES o NO_MATCH.
5. `CONFIRM_SCHOOL` — procesa la respuesta de los botones, guarda `schoolId` y `schoolName`, pide nivel.
6. `ASK_LEVEL` — recibe kinder/primaria/secundaria por botón, pide grado (botones si son ≤3, lista interactiva si son más).
7. `ASK_GRADE` — recibe el grado (de botón o de lista), pide sexo.
8. `ASK_SEX` — recibe F/M/unisex y delega en `quote-service.js` la búsqueda de la lista y el envío de la cotización.
9. `SHOWING_QUOTE` — procesa la respuesta a los botones [Confirmar][Agregar][Quitar]. Confirmar pasa a `ASK_RECEIPT_TYPE` (sin handler aún, item 4). Agregar manda a un ejecutivo (no hay flujo de búsqueda de producto). Quitar manda la lista numerada en texto y pasa a `ASK_REMOVE_ITEM`.
10. `ASK_REMOVE_ITEM` — recibe el número del producto a quitar, actualiza `conversation.context.quoteItems` y reenvía la cotización actualizada (PDF + total + botones) vía `quoteService.resendQuote()`.
11. `ASK_RECEIPT_TYPE` — factura sí/no. Si pide factura, anota `requiresInvoice: true` y avisa que un ejecutivo pedirá la CSF después, pero **no bloquea** — sigue a `ASK_DELIVERY_TYPE` de todas formas.
12. `ASK_DELIVERY_TYPE` — recoger en tienda (pasa directo a `AWAITING_PAYMENT`) o a domicilio (pasa a `ASK_ADDRESS`).
13. `ASK_ADDRESS` — captura la dirección (texto libre, mínimo 10 caracteres), pasa a `AWAITING_PAYMENT`.

`AWAITING_PAYMENT` en adelante (`ASK_CSF`, `AWAITING_RECEIPT`, creación de `Order`) sigue sin handlers — el mensaje de "en breve te compartimos cómo pagar" es genérico, sin datos bancarios reales todavía.

### Servicios auxiliares
- `whatsapp-client.js` con métodos `sendText`, `sendInteractiveButtons` (hasta 3 botones), `sendInteractiveList` (hasta 10 opciones), `uploadMedia` (sube archivo a la API de medios de Meta) y `sendDocument` (manda documento ya subido).
- `school-matcher.js` con `matchSchool()` que devuelve `{ type, matches }`.
- `quote-service.js` con `buildAndSendQuote(conversation, extraContext)`: busca la `SchoolList` exacta (fallback automático a `sex: 'unisex'` si no hay lista específica de sexo), calcula IVA 16%, genera el PDF y manda 3 mensajes (documento → texto con total/anticipo → botones). Si no hay lista, avisa y pasa a `ASK_LIST` (sin handler aún, queda ahí — flujo sin convenio, items 6-8). Copia los items de la lista maestra a `conversation.context.quoteItems` (con `productId`, `name`, `quantity`, `priceContado`) para que los ajustes de Agregar/Quitar sean por conversación y nunca toquen la `SchoolList` compartida. También expone `resendQuote(conversation, extraContext)` para reenviar la cotización tras modificarla, sin volver a consultar la lista maestra.
- `pdf-generator.js` con `buildQuotePdf()`: arma el PDF de la cotización con `pdfmake` (logo, tabla de productos, Subtotal/IVA 16%/Total, footer con el anticipo). Usa fuente estándar `Helvetica` (sin necesidad de vfs de fuentes TTF), logo embebido como base64 desde `bot/assets/logo.jpeg` (copia local, no depende de `client/`).

### Datos de prueba cargados
- 5 escuelas de prueba con `seed-schools.js`: Colegio Lincoln de Tuxtla, Instituto Antara, Colegio del Valle, Colegio Bilingüe Frida Kahlo, Instituto Cumbres.
- Escuela real + catálogo real con `seed-mi-pequeno-hogar.js`: "Centro Educativo Mi Pequeño Hogar", 30 productos y una `SchoolList` de 4to de primaria (unisex), tomados de una cotización real de su sistema actual (precios sin el 20% de descuento que traía el PDF original, ya que el bot cotiza sin descuento).
- `test-quote-pdf.js` genera un PDF de cotización de prueba local (`server/cotizacion-prueba.pdf`) sin tocar Mongo ni WhatsApp — útil para iterar el diseño del PDF.

---

## Lo que falta por hacer

### Inmediato (para completar el flujo de convenio de punta a punta)
1. ✅ Modelo `SchoolList` — lista de productos por combinación `escuela + nivel + grado + sexo`. Cada item referencia un `Product` y tiene cantidad. (hecho 2026-07-07)
2. ✅ Handler para el estado `SHOWING_QUOTE` — busca la `SchoolList` correspondiente, calcula precios, envía cotización al cliente con botones [Confirmar] [Agregar] [Quitar]. (hecho 2026-07-07, ver `quote-service.js`)
3. ✅ Handlers de modificación de cotización. (hecho 2026-07-07) "Quitar" implementado de verdad: `showingQuote.js` manda la lista numerada en texto (no lista interactiva — con 30+ items se pasa del límite de 10 filas de Meta) y `askRemoveItem.js` procesa el número, actualiza `quoteItems` y reenvía. "Agregar" se dejó como mensaje de "un ejecutivo te ayuda" (la lista de convenio es la que pidió la escuela, agregar algo fuera de ella es poco frecuente — no se construyó el flujo de búsqueda de producto). Los ajustes viven en `conversation.context.quoteItems` (copia por conversación), nunca tocan la `SchoolList` maestra.
4. Handlers del cierre del pedido. Nota (2026-07-07): al terminar de confirmar/cerrar un pedido, ofrecer opción de cotizar otra lista (clientes con más de un hijo/a).
   - ✅ `ASK_RECEIPT_TYPE`, `ASK_DELIVERY_TYPE`, `ASK_ADDRESS` (hecho 2026-07-07) — la parte conversacional simple, sin infraestructura nueva.
   - ⏳ Pendiente, requiere diseño aparte: `ASK_CSF` (recibir el documento de la constancia fiscal), `AWAITING_PAYMENT`/`AWAITING_RECEIPT` (recibir comprobante de pago) y la creación de la `Order` real al confirmar. Esto necesita: (a) capacidad nueva de **recibir** medios desde WhatsApp — hoy `whatsapp-client.js` solo manda, nunca descarga lo que el cliente sube; (b) decidir qué hacer con `Order.stand` y `Order.vendorUser` (`required`, pensados para venta en feria física, sin valor natural para un pedido del bot).
5. ✅ Generación de cotización en PDF y envío como documento por WhatsApp. (hecho 2026-07-07, con `pdfmake` — ver `pdf-generator.js`)

### Flujo sin convenio (después de completar convenio)
6. Modelo `PendingSchoolList` — cola de validación con "request coalescing" (varios clientes con la misma demanda comparten una sola entrada pendiente).
7. Handler para procesar listas en formato foto/PDF/texto con Claude Sonnet Vision.
8. Endpoints del panel para que operativos de Dipamex validen listas nuevas.

### Extensiones al panel (React)
9. Módulo de gestión de listas escolares (CRUD). Decisión ya tomada (2026-07-07): subir el PDF de la cotización ya hecha en su sistema actual → extraer texto automáticamente (NO Claude Vision, son PDFs de texto real de su ERP, no fotos — extracción de texto simple basta) → operativo revisa/edita → guarda como `SchoolList`. Claude Vision se reserva para el item 7 (cliente manda su propia lista en foto/formato libre).
10. Módulo de listas pendientes de validación (con sugerencias del bot).
11. Filtros de órdenes por origen (`source: 'feria' | 'whatsapp'`) y por nuevos estados.
12. Trigger de notificaciones WhatsApp al cambiar estado en el panel.

### Robustez y edge cases (fase de estabilización)
13. Cron de seguimiento a 24 horas para clientes que abandonan la conversación.
14. Manejo de inputs inesperados (fallback handler universal).
15. Comando de "cancelar" o "reiniciar" desde cualquier estado.

### Integración con IA (después de flujo convenio funcionando)
16. Ingesta del catálogo real de Dipamex (script `ingest-catalog.js`) con normalización + embeddings de OpenAI.
17. Búsqueda semántica de productos con MongoDB Atlas Vector Search.
18. Integración con Claude Haiku para conversación libre en fallback.

### Plantillas de WhatsApp (dependencia externa)
19. Someter 9 plantillas a Meta para aprobación (anticipo_confirmado, en_preparacion, surtido, listo_recoleccion, listo_domicilio, entregado, seguimiento_24h, anticipo_rechazado, cotizacion_lista_aprobada).
20. Handler que decide en runtime: si la ventana de 24h del cliente está abierta manda texto libre, si está cerrada manda plantilla aprobada.

---

## Reglas de trabajo

### Consistencia de código
- JavaScript puro. Prohibido TypeScript, `.ts`, `interface`, `type`, decoradores.
- CommonJS: usar `require`/`module.exports`. Nunca `import`/`export`.
- Async/await preferido sobre `.then()`.
- Antes de crear un patrón nuevo, revisar cómo está resuelto un problema similar en el código existente (por ejemplo, ver `models/Customer.js` antes de crear un modelo, ver `handlers/askSchool.js` antes de crear un handler).

### Manejo de commits
- No hacer commits automáticamente. Después de cada cambio significativo, avisar a Mau qué archivos se tocaron y proponer el mensaje del commit; Mau decide cuándo y qué commitear.
- Mensajes de commit en formato `tipo(scope): descripción corta en español`. Ejemplo: `feat(bot): handler para SHOWING_QUOTE`.

### Cómo escribir handlers de la state machine
- Un archivo por estado en `server/src/bot/state-machine/handlers/`.
- Nombre del archivo en camelCase: `showingQuote.js`, no `showing-quote.js`.
- Exportar una función `async` que reciba `(conversation, message)` y devuelva `{ nextState, contextUpdate }`.
- Registrar el nuevo handler en `router.js` tanto en el `require` como en el diccionario `handlers`.
- Actualizar `states.js` si el estado no existe todavía.

### Cómo escribir modelos
- Un archivo por modelo en `server/src/models/`.
- Nombre PascalCase: `SchoolList.js`.
- Seguir exactamente el estilo de `Customer.js` y `School.js`.
- Los `pre('save')` hooks en Mongoose recientes no reciben `next` como parámetro cuando la función es sync — no llamarlo.
- ⚠️ Bug conocido en `School.js`: su `pre('save')` intenta autogenerar `nameNormalized`, pero la validación de campos `required` corre antes que `pre('save')`, así que nunca se ejecuta a tiempo. Cualquier código que cree una `School` debe setear `nameNormalized: School.normalize(name)` a mano antes de `.create()` (ver el workaround en `seed-schools.js` y `seed-mi-pequeno-hogar.js`). No se ha corregido el modelo todavía — preguntar a Mau antes de tocarlo.

### Antes de instalar cualquier dependencia nueva
- Preguntar a Mau primero, explicando para qué y qué alternativas nativas existen.
- Preferir soluciones sin dependencias cuando sea razonable (por ejemplo, fuzzy match casero antes de instalar `fuse.js`).

### Cuando algo esté ambiguo
Preguntar en vez de asumir. Especialmente en:
- Formatos de mensajes al cliente (tono, emojis, extensión).
- Decisiones de UX (cuántos botones, cuándo lista, cuándo texto libre).
- Estructura de datos nueva (qué campos guardar, cuáles son opcionales).

### Estilo de mensajes del bot al cliente
- Español mexicano, tono amable y cercano.
- Emojis moderados (1-2 por mensaje máximo).
- Preferir botones sobre texto libre cuando las opciones son enumerables.
- Máximo 3 botones por mensaje (límite de Meta). Si son más, usar lista interactiva.
- Frases cortas, evitar párrafos largos.

### Deploy y prueba
- Nunca ejecutar `git push` sin autorización de Mau.
- Cuando se quiera probar algo, sugerir correr local con ngrok o proponer que Mau haga push manualmente.
- Mau borra manualmente su conversación de prueba en MongoDB Atlas cuando quiere reiniciar el flujo.

### Comunicación con Mau
- Explicaciones concisas, sin sobre-adornar.
- Cuando se agregue código, decir en qué archivo y en qué sección va.
- Si se toca más de un archivo, listar cada uno con lo que cambia.
- Si algo del código existente parece mal escrito o inconsistente, señalarlo pero no corregirlo sin preguntar.
- Mau es PMP e ingeniero, no requiere explicaciones básicas de conceptos técnicos ni de estructura de proyecto.