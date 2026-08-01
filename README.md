# 💳 CreditMate

**CreditMate** es una aplicación de escritorio multiplataforma desarrollada con **Electron + React + SQLite/PostgreSQL** para la gestión simple y rápida de créditos y finanzas personales.

## 🚀 Características

- ✅ Gestión de clientes y créditos
- ✅ Reportes básicos de ingresos y egresos
- ✅ Almacenamiento local con SQLite
- ✅ Soporte para modo **oscuro / claro**
- ✅ Interfaz moderna y minimalista con React

## 🛠️ Tecnologías utilizadas

- [Electron](https://www.electronjs.org/) – Contenedor para apps de escritorio
- [React](https://react.dev/) – Frontend moderno
- [SQLite](https://www.sqlite.org/) – Base de datos ligera
- [Zustand](https://zustand-demo.pmnd.rs/) – Manejo de estado global
- [Vite](https://vitejs.dev/) – Empaquetador rápido

## 📦 Instalación y uso

Clona el repositorio:

```bash
git clone https://github.com/acristhian1411/creditmate.git
cd creditmate
```

Instala las dependencias de electron:

```bash
pnpm install
```

Instala dependencias de react:

```bash
cd frontend
pnpm install
```

Ejecuta en modo desarrollo desde la carpeta raiz:

```bash
pnpm run dev
```

Compila la app:

```bash
pnpm run build --win o --linux
```

## 📂 Estructura del proyecto

```
creditmate/
├── electron/        # Archivos principales de Electron (main, preload)
├── frontend/             # Código React (frontend)
├── dist/            # Carpeta de salida tras compilación
├── package.json
└── README.md
```

## 📸 Logo

![CreditMate Logo](./frontend/src/assets/AppLogo.png)

## 📄 Licencia

Este proyecto está bajo la licencia MIT – libre para usar y modificar.

---
