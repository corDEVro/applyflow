# ApplyFlow 🚀

ApplyFlow es una app de gestión de candidaturas y optimización de perfiles profesionales. Centraliza ofertas de empleo, automatiza el seguimiento de estados y adapta currículums y cartas de presentación con IA (OpenRouter) según cada oferta.

**MVP sin base de datos:** los datos de cada usuario viven solo en su navegador (`localStorage`), con copias de seguridad Exportar/Importar en JSON.

**Límite gratuito:** cada usuario tiene **5 análisis de IA al día** (contador en su navegador), lo que permite hasta ~10 usuarios con el plan gratis de OpenRouter. La opción premium (API key propia del usuario) llegará en una versión futura.

---

## 🛠️ Arquitectura

- **Frontend (React + TypeScript + Vite + Tailwind):** interfaz SPA. Persiste los datos en `localStorage` a través de la capa única `src/storage.ts`.
- **Backend (Spring Boot + Java):** API REST mínima que hace tres cosas:
  1. **IA**: `/api/ai/generate` — analiza la oferta y adapta CV + carta + email (OpenRouter).
  2. **PDF**: `/api/cv/generate-pdf` — genera el CV adaptado en PDF (OpenPDF).
  3. **Extracción**: `/api/cv/extract-text` — convierte un `.docx` en texto (CV base) y `/api/offer/extract` — extrae los datos de una oferta a partir de su URL.

El envío de candidaturas se hace con `mailto:`: se abre el correo del usuario con la carta preparada y él adjunta el PDF.

---

## ✅ Requisitos

- **Java 21+** (JDK)
- **Node.js 20+** y **pnpm**
- Una cuenta en **[OpenRouter](https://openrouter.ai)** para obtener una API key

---

## 🚀 Puesta en marcha (local)

### 1. Backend (`applyflow-backend`)

```bash
cd applyflow-backend
export OPENROUTER_API_KEY=tu_clave
./mvnw spring-boot:run
```

Sin `OPENROUTER_API_KEY`, la IA devuelve un error controlado; el resto de funciones siguen funcionando.

### 2. Frontend (`applyflow-frontend`)

```bash
cd applyflow-frontend
cp .env.example .env    # ajusta VITE_API_URL si el backend no está en localhost:8080
pnpm install
pnpm dev
```

Abre `http://localhost:5173`. La primera vez pedirá tu CV base (pegarlo o subir tu `.docx`).

---

## ⚙️ Variables de entorno

| Variable | Dónde | Descripción | Por defecto |
|---|---|---|---|
| `OPENROUTER_API_KEY` | Backend | Clave de la API de OpenRouter (gratis de crear) | *(vacía)* |
| `OPENROUTER_MODEL` | Backend | Modelo de IA (usa `:free` o `openrouter/free` para que cueste 0 €) | `openrouter/free` |
| `CORS_ALLOWED_ORIGINS` | Backend | Orígenes permitidos (separados por comas) | `http://localhost:5173` |
| `OPENROUTER_REFERER` | Backend | URL pública reportada a OpenRouter | `http://localhost:8080` |
| `VITE_API_URL` | Frontend | URL del backend | `http://localhost:8080` |

> 💡 **Gratis de verdad:** OpenRouter permite crear la API key sin tarjeta y usar modelos `:free` con saldo 0 € (límite 50 peticiones/día). Con `OPENROUTER_MODEL=openrouter/free` la IA no cuesta nada.

---

## 🌍 Despliegue del MVP (gratuito)

- **Frontend → Vercel o Netlify:** build `pnpm build` (salida `dist`). Variable `VITE_API_URL` con la URL pública del backend.
- **Backend → Render (plan Free):** build `./mvnw package` y arranque `java -jar target/backend-0.0.1-SNAPSHOT.jar`. Variables: `OPENROUTER_API_KEY`, `CORS_ALLOWED_ORIGINS` (URL del frontend desplegado) y `OPENROUTER_REFERER` (URL del frontend desplegado).

---

## 🧪 Tests

```bash
cd applyflow-backend
./mvnw test
```
