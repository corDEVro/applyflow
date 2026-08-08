# ApplyFlow — Notas de desarrollo y despliegue

Documento técnico para quien mantiene la aplicación. El README principal es el documento de producto.

## 🛠️ Arquitectura

- **Frontend (React + TypeScript + Vite + Tailwind):** SPA. Persiste los datos en `localStorage` a través de la capa única `src/storage.ts`.
- **Backend (Spring Boot + Java):** API REST mínima:
  1. **IA**: `/api/ai/generate` — analiza la oferta y adapta CV + carta + email (OpenRouter).
  2. **PDF**: `/api/cv/generate-pdf` — genera el CV adaptado en PDF (OpenPDF).
  3. **Extracción**: `/api/cv/extract-text` — convierte un `.docx` en texto (CV base).
  4. **Ofertas**: `/api/offer/extract` — descarga la página de la oferta (jsoup) y la IA extrae puesto, empresa, salario, plataforma y email.

El envío de candidaturas usa `mailto:` (el correo del usuario, sin backend de correos).

## ✅ Requisitos

- **Java 21+** (JDK)
- **Node.js 20+** y **pnpm**
- Cuenta en **[OpenRouter](https://openrouter.ai)** para la API key

## 🚀 Puesta en marcha (local)

### Backend (`applyflow-backend`)

```bash
cd applyflow-backend
set -a; source .env; set +a   # o exporta OPENROUTER_API_KEY=tu_clave
./mvnw spring-boot:run
```

> Hay un script `run.sh` que carga automáticamente el fichero `.env` (ignorado por git) y arranca el backend.

### Frontend (`applyflow-frontend`)

```bash
cd applyflow-frontend
cp .env.example .env    # ajusta VITE_API_URL si el backend no está en localhost:8080
pnpm install
pnpm dev
```

Abre `http://localhost:5173`.

## ⚙️ Variables de entorno

| Variable | Dónde | Descripción | Por defecto |
|---|---|---|---|
| `OPENROUTER_API_KEY` | Backend | Clave de la API de OpenRouter | *(vacía)* |
| `OPENROUTER_MODEL` | Backend | Modelo de IA (usa `:free` o `openrouter/free` para que cueste 0 €) | `openrouter/free` |
| `CORS_ALLOWED_ORIGINS` | Backend | Orígenes permitidos (separados por comas) | `http://localhost:5173` |
| `OPENROUTER_REFERER` | Backend | URL pública reportada a OpenRouter | `http://localhost:8080` |
| `VITE_API_URL` | Frontend | URL del backend | `http://localhost:8080` |

## 📈 Límite de uso (importante)

- El frontend limita cada usuario a **10 análisis de IA al día** (contador en `localStorage`, constante `LIMITE_IA_DIARIO` en `src/storage.ts`).
- OpenRouter cobra **0 €** por los modelos `:free` (sin tarjeta), con límites de cuenta: **50 peticiones/día** (o 1.000/día con una compra única de 10 $) y **20 peticiones/minuto**.
- Todos los usuarios comparten la misma key → consumen el mismo contador de 50/día. Con 10 análisis/día por usuario, caben **~5 usuarios completos por día**. Al agotarse, OpenRouter responde 429 y la IA falla hasta el día siguiente.
- El control es por navegador (sin cuentas): un usuario técnico podría reiniciarlo limpiando `localStorage`. El control real llegará con la versión de cuentas/premium.

## 🌍 Despliegue (gratuito)

- **Frontend → Vercel o Netlify:** build `pnpm build` (salida `dist`). Variable `VITE_API_URL` con la URL pública del backend.
- **Backend → Render (plan Free):** build `./mvnw package` y arranque `java -jar target/backend-0.0.1-SNAPSHOT.jar`. Variables: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `CORS_ALLOWED_ORIGINS` (URL del frontend desplegado) y `OPENROUTER_REFERER` (URL del frontend desplegado).

## 🧪 Tests

```bash
cd applyflow-backend
./mvnw test
```

## 🔐 Seguridad

- La API key **nunca** debe commitearse. En local se carga desde `.env` (ignorado por git); en producción, desde las variables de entorno del panel.
- El repositorio no contiene datos personales ni credenciales.
