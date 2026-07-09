# JazzBank — Mini Banco Digital (React + Firebase)

Proyecto de evaluación TI3V31 · Programación reactiva y manejo de eventos.

Permite registrarse, iniciar sesión, ver el saldo en tiempo real, transferir
dinero a otros usuarios y revisar el historial de movimientos.

## Stack

- React 18 + Vite
- Firebase Authentication (email/contraseña)
- Cloud Firestore (con `onSnapshot` para tiempo real)

## Estructura del proyecto

```
src/
├── firebase/config.js       → inicialización de Firebase (usa .env)
├── services/                → toda la lógica de Firebase, sin JSX
│   ├── authService.js       → registro, login, logout
│   ├── userService.js       → saldo del usuario, búsqueda por email
│   ├── transferService.js   → transferencias (transacción atómica)
│   └── movementsService.js  → historial + depósito/retiro
├── context/AuthContext.jsx  → sesión global (useReducer + useContext)
├── hooks/
│   ├── useSaldo.js          → suscripción al saldo (onSnapshot)
│   └── useMovimientos.js    → suscripción al historial (onSnapshot)
└── components/
    ├── Login.jsx / Register.jsx
    ├── Dashboard.jsx / Navbar.jsx
    ├── TransferForm.jsx / History.jsx
    └── DepositoRetiro.jsx   → bonus
```

## Cómo correrlo en local

### 1. Crear el proyecto en Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto.
2. Activa **Authentication → Email/contraseña**.
3. Activa **Firestore Database** (modo producción; luego pega las reglas de `firestore.rules`).
4. En **Configuración del proyecto → Tus apps**, registra una app web y copia el objeto `firebaseConfig`.

### 2. Configurar las variables de entorno

```bash
cp .env.example .env
```

Abre `.env` y pega los valores de tu proyecto Firebase:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**`.env` nunca se sube a GitHub** — ya está en `.gitignore`. Ver sección
"Seguridad de las credenciales" más abajo.

### 3. Instalar y correr

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Usuarios de prueba

Crea estas dos cuentas usando el formulario de **Registro** de la app (no
existen de antemano, se generan al registrarte):

| Nombre  | Email                | Contraseña |
|---------|-----------------------|------------|
| Shorter | shorter@jazzbank.cl  | 123456     |
| Jaco | jaco@jazzbank.cl  | 123456     |

Ambas parten con saldo de **$100.000**. Inicia sesión con una, transfiere a
la otra por email, y abre una segunda pestaña con la otra cuenta para ver
el saldo actualizarse solo (gracias a `onSnapshot`).

## Modelo de datos

```
users/{uid}
  nombre: string
  email: string
  saldo: number

movimientos/{id}
  emisorUid: string
  emisorEmail: string
  receptorUid: string
  receptorEmail: string
  monto: number
  descripcion: string
  fecha: Timestamp (serverTimestamp)
  participantes: [emisorUid, receptorUid]   // permite un solo query con
                                            // array-contains para leer el
                                            // historial de ambos lados
```

## Seguridad de las credenciales (importante)

- **Nunca se sube la `apiKey` ni el resto de la config de Firebase al
  repositorio.** El archivo `.env` está en `.gitignore` y solo existe en
  tu máquina.
- Se incluye `.env.example` con las claves vacías, para que cualquiera
  sepa qué variables debe configurar sin exponer valores reales.
- Antes de tu primer `git add`, revisa con `git status` que `.env` NO
  aparezca en la lista de archivos a subir.
- Si en algún commit anterior quedó una `.env` subida por error, no basta
  con borrarla y subir un commit nuevo: sigue en el historial. Hay que
  reescribir el historial (`git filter-repo` o similar) **y** rotar la
  API key desde la consola de Firebase.
- Las reglas de Firestore (`firestore.rules`, incluidas en este repo)
  exigen que el usuario esté autenticado y solo pueda escribir su propio
  documento — así, aunque alguien viera la configuración pública de
  Firebase, no podría leer ni modificar datos de otros usuarios sin
  loguearse.

## Uso de IA

Usé IA para generar la estructura inicial del proyecto (servicios,
hooks y componentes) a partir de los requisitos de la pauta. Tuve que
revisar y ajustar la lógica de la transacción de transferencia (usar
`runTransaction` en vez de dos `updateDoc` separados) y entender bien por
qué el historial usa un campo `participantes` con `array-contains` en vez
de dos listeners distintos. Cada función la repasé línea por línea antes
de integrarla.
