# ApplyFlow 🚀

ApplyFlow es un ecosistema inteligente de gestión de candidaturas y optimización de perfiles profesionales. La aplicación permite centralizar ofertas de empleo de los principales portales de España, automatizar el seguimiento de estados de forma interactiva y adaptar currículums y cartas de presentación mediante Inteligencia Artificial (OpenRouter) en función de los requisitos de cada oferta de trabajo.

---

## 🛠️ Arquitectura del Sistema

El proyecto está dividido en dos capas principales que deben ejecutarse en paralelo:

- **Frontend (React + TypeScript):** Interfaz SPA optimizada con Tailwind CSS, persistencia local para flujos de trabajo e interactividad en tiempo real sin recargas de página.
- **Backend (Spring Boot + Java):** API REST encargada de la persistencia en base de datos, conversión de documentos a PDF de alta fidelidad, despacho automático de correos electrónicos y orquestación del servicio de IA.
- **Base de Datos (PostgreSQL):** Almacenamiento relacional para persistir el histórico de todas las candidaturas.

---

## ✅ Requisitos

- **Java 21+** (JDK)
- **Node.js 20+** y **pnpm**
- **PostgreSQL** (o un contenedor con la imagen `postgres`)
- Una cuenta en **[OpenRouter](https://openrouter.ai)** para obtener una API key

---

## 🚀 Puesta en marcha

### 1. Base de datos

Crea una base de datos PostgreSQL llamada `applyflow` (o la que definas en `DB_NAME`).

### 2. Backend (`applyflow-backend`)

```bash
cd applyflow-backend
./mvnw spring-boot:run
```

Define las variables de entorno que necesites (ver tabla inferior). Sin `OPENROUTER_API_KEY`, el módulo de IA devolverá un error controlado; el resto de la aplicación funciona igual.

> **Nota:** si tu PostgreSQL usa usuario/contraseña no vacíos, exporta `DB_USER` y `DB_PASSWORD` antes de arrancar.

### 3. Frontend (`applyflow-frontend`)

```bash
cd applyflow-frontend
cp .env.example .env    # ajusta VITE_API_URL si tu backend no está en localhost:8080
pnpm install
pnpm dev
```

Abre `http://localhost:5173`.

---

## ⚙️ Variables de entorno

### Backend

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_NAME` | Nombre de la base de datos | `applyflow` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | *(vacía)* |
| `JPA_DDL_AUTO` | Estrategia de esquema (`update` solo en desarrollo; `validate` en producción) | `update` |
| `JPA_SHOW_SQL` | Mostrar SQL en consola | `false` |
| `OPENROUTER_API_KEY` | Clave de la API de OpenRouter | *(vacía)* |
| `SMTP_HOST` | Servidor SMTP saliente | *(vacío)* |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_USER` | Usuario SMTP | *(vacío)* |
| `SMTP_PASSWORD` | Contraseña SMTP | *(vacío)* |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos para el frontend (separados por comas) | `http://localhost:5173` |
| `OPENROUTER_REFERER` | URL pública reportada a OpenRouter | `http://localhost:8080` |

### Frontend

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL del backend | `http://localhost:8080` |

---

## 📄 Archivos que debes personalizar

El repositorio no incluye datos personales. Antes de usarlo, sustituye por tu propia información:

- **`applyflow-backend/src/main/resources/templates/cv_base.docx`** → tu currículum base. Es la plantilla de conocimiento que usa la IA para adaptar el CV.
- **`applyflow-frontend/public/mi-cv.pdf`** → el PDF que se descarga con el botón "Mi CV" del header.

---

## 🧪 Tests

```bash
cd applyflow-backend
./mvnw test
```

Los tests usan una base de datos H2 en memoria, por lo que no necesitan PostgreSQL.
