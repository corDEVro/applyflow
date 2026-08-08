# ApplyFlow 🚀

ApplyFlow es un ecosistema inteligente de gestión de candidaturas y optimización de perfiles profesionales. Centraliza ofertas de empleo, automatiza el seguimiento de estados y adapta currículums y cartas de presentación mediante IA (OpenRouter) según los requisitos de cada oferta.

**MVP sin base de datos:** los datos de cada usuario viven **solo en su navegador** (`localStorage`). Esto hace el despliegue 100% gratuito y aísla automáticamente a cada persona que use la app.

---

## 🛠️ Arquitectura

Dos capas que se ejecutan en paralelo:

- **Frontend (React + TypeScript + Vite + Tailwind):** interfaz SPA. Persiste candidaturas y CV base en `localStorage` a través de la capa de datos única `src/storage.ts` (migrable a una BD futura). Incluye copias de seguridad **Exportar/Importar** en JSON.
- **Backend (Spring Boot + Java):** API REST mínima sin estado que solo se encarga de tres cosas:
  1. **IA**: `/api/ai/generate` (analiza la oferta y adapta CV + carta + email vía OpenRouter).
  2. **PDF**: `/api/cv/generate-pdf` (genera el CV adaptado en PDF con OpenPDF).
  3. **Extracción**: `/api/cv/extract-text` (convierte un `.docx` en texto para usarlo como CV base).

No hay PostgreSQL, ni JPA, ni SMTP. El "envío" de candidaturas se hace con **`mailto:`**: se abre el correo del usuario con la carta preparada y él adjunta el PDF.

---

## ✅ Requisitos

- **Java 21+** (JDK)
- **Node.js 20+** y **pnpm**
- Una cuenta en **[OpenRouter](https://openrouter.ai)** para obtener una API key

---

## 🚀 Puesta en marcha (desarrollo)

### 1. Backend (`applyflow-backend`)

```bash
cd applyflow-backend
OPENROUTER_API_KEY=tu_clave ./mvnw spring-boot:run
```

Sin `OPENROUTER_API_KEY`, la IA devolverá un error controlado; PDF y extracción siguen funcionando.

### 2. Frontend (`applyflow-frontend`)

```bash
cd applyflow-frontend
cp .env.example .env    # ajusta VITE_API_URL si tu backend no está en localhost:8080
pnpm install
pnpm dev
```

Abre `http://localhost:5173`. La primera vez te pedirá tu CV base (pegarlo o subir tu `.docx`); se guarda solo en tu navegador.

---

## ⚙️ Variables de entorno

### Backend

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `OPENROUTER_API_KEY` | Clave de la API de OpenRouter | *(vacía)* |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos para el frontend (separados por comas) | `http://localhost:5173` |
| `OPENROUTER_REFERER` | URL pública reportada a OpenRouter | `http://localhost:8080` |

### Frontend

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL del backend | `http://localhost:8080` |

---

## 🔒 Datos y privacidad

- El repositorio **no contiene datos personales**.
- Tu CV base y tus candidaturas se guardan **exclusivamente en tu navegador** (localStorage): no viajan a ningún servidor de datos.
- Al estar ligados al navegador, usa siempre el mismo dispositivo/navegador, y usa **Exportar/Importar** para hacer copias de seguridad o moverte de dispositivo.
- Si borras los datos de navegación, perderás tus candidaturas (por eso exporta de vez en cuando).

---

## 🌍 Despliegue gratuito

- **Frontend → Vercel o Netlify:** build `pnpm build` (output `dist`). Variable `VITE_API_URL` apuntando a la URL pública del backend.
- **Backend → Render (plan Free) o similar:** build `./mvnw package` y arranque `java -jar target/backend-0.0.1-SNAPSHOT.jar`. Variables:
  - `OPENROUTER_API_KEY` (tu clave personal)
  - `CORS_ALLOWED_ORIGINS` (URL del frontend desplegado)
  - `OPENROUTER_REFERER` (URL del frontend desplegado)

---

## 🧪 Tests

```bash
cd applyflow-backend
./mvnw test
```

Incluyen un test real de generación de PDF (no necesitan base de datos ni red).

---

## 📈 Métricas de usuarios

Este MVP no tiene base de datos, así que no puede contar usuarios de forma precisa. Cuando exista la versión con BD y login, el registro de usuarios dará la métrica real. Si quieres una cifra aproximada mientras tanto, puedes añadir un endpoint `/api/analytics/visit` que escriba en los logs de Render (cuenta aproximada de visitas, no de usuarios únicos).
