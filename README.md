# Prueba Técnica Doricode – Listado de Tareas

Este proyecto es una **solución técnica para el manejo de notas personales con soporte offline**, construida bajo una **arquitectura de sincronización de estado**. El enfoque principal es *Offline‑First*, asegurando que la aplicación funcione incluso sin conexión y sincronice los datos cuando esta esté disponible.

---

## Cómo ejecutar el proyecto

Para simular un entorno con **1 servidor y 2 clientes**, sigue los pasos a continuación.

### Servidor (Backend)

```bash
cd server
npm install
npm run dev
```

El servidor se levantará en:

```
http://localhost:4000
```

---

### Clientes (Frontend)

En la raíz del proyecto:

```bash
npm install
npm run dev
```

El frontend se ejecutará en:

```
http://localhost:5173
```

#### Simulación de dos clientes

* **Cliente 1:** Abre `http://localhost:5173` en una ventana normal.
* **Cliente 2:** Abre la misma URL en una **ventana de incógnito** para disponer de un `localStorage` independiente.

---

## Arquitectura y Decisiones Técnicas

La solución se basa en una arquitectura **Offline‑First**, donde el cliente puede operar de forma autónoma y sincronizar su estado con el servidor cuando la conexión esté disponible.

---

### 1️. Sincronización y Consistencia Eventual

Se implementa un modelo de **Sincronización de Estado Completo** mediante el endpoint:

```
/sync
```

Esto permite que el usuario:

* Cree
* Edite
* Elimine notas

sin necesidad de conexión.

Cuando se recupera el acceso al servidor, el cliente envía **un lote de cambios en una sola petición**, optimizando:

* Uso de puertos de red
* Tráfico de datos

---

### 2️. Resolución de Conflictos – Last Write Wins (LWW)

Para manejar conflictos entre múltiples clientes, se implementa la estrategia **Last Write Wins**.

* Cada nota incluye un campo `updatedAt` (timestamp).
* El servidor compara el `updatedAt` recibido con el que posee en memoria.
* **Solo se aceptan los cambios si el timestamp del cliente es estrictamente mayor.**

Esto garantiza consistencia eventual entre todos los clientes.

---

### 3️. Soporte Offline y Soft Delete

####  Persistencia Local

* Se utiliza `localStorage` como caché local.
* La aplicación **siempre carga primero los datos locales**, asegurando disponibilidad sin conexión.

#### Borrado Lógico (Soft Delete)

* Las notas **no se eliminan físicamente** cuando el cliente está offline.
* Se marcan con la propiedad:

```ts
deleted: true
```

* Esto permite que el servidor reciba y procese correctamente el borrado durante el siguiente ciclo de sincronización.

---

### 4️. Finite State Machine (FSM)

El **Dashboard** funciona como una **Máquina de Estados Finita (FSM)** para manejar la interfaz de usuario de manera clara y predecible, facilitando:

* Control de estados de carga
* Sincronización
* Errores
* Vista offline / online

---

## Tecnologías Utilizadas

### Frontend

* **React**
* **TypeScript**
* **Tailwind CSS**

### Backend

* **Node.js**
* **Express**
* **TypeScript**

### Comunicación

* **Polling** cada **10 segundos** para garantizar que:

  * El Cliente A reciba eventualmente los cambios realizados por el Cliente B.

---

## Conceptos Aplicados

* **Arquitectura Offline‑First**
* **Consistencia Eventual**
* **Last Write Wins (LWW)**
* **Soft Delete**
* **Sincronización de Estado**
* **Finite State Machine (FSM)**
* **Puertos de Red y CORS**

  * Configuración para permitir comunicación entre:

    * `5173` (Vite – Frontend)
    * `4000` (Express – Backend)

---

## Resultado

La aplicación permite trabajar con notas de manera fluida, incluso sin conexión, manteniendo la consistencia entre múltiples clientes y garantizando una experiencia robusta y predecible.

---

**Prueba Técnica – Doricode**


Comunicación: Polling (Sondeo) cada 10 segundos para garantizar que el Cliente A reciba los cambios del Cliente B eventualmente.

Conceptos Aplicados
Puertos de Red: Configuración de CORS para permitir comunicación entre el puerto 5173 (Vite) y 4000 (Express).
