Prueba Técnica Doricode Listado de Tareas:

Este proyecto es una solución técnica para el manejo de notas personales con soporte offline, construida bajo una arquitectura de sincronización de estado.

🚀 Cómo ejecutar el proyecto
Para simular el entorno de 1 servidor y 2 clientes, sigue estos pasos:

Servidor:

Bash

cd server
npm install
npm run dev  # Corre en http://localhost:4000
Clientes (Frontend):

Bash

# Terminal principal
npm install
npm run dev  # Corre en http://localhost:5173
Cliente 1: Abre http://localhost:5173 en tu navegador.

Cliente 2: Abre la misma URL en una ventana de incógnito (para tener un localStorage independiente).

Arquitectura y Decisiones Técnicas
La solución se basa en una arquitectura Offline-First, donde el cliente es capaz de operar de forma autónoma y sincronizar su estado con el servidor cuando la conexión está disponible.

1. Sincronización y Consistencia Eventual
Para el proyecto se usó un modelo de Sincronización de Estado Completo mediante el endpoint /sync.Permitiendo que el usuario realice múltiples cambios (crear, editar, borrar) sin conexión. Al recuperar el acceso, se envía el lote de cambios en una sola petición, optimizando los puertos de red y el tráfico.

2. Last Write Wins (LWW)
Para resolver conflictos entre múltiples clientes, se implementó la estrategia Last Write Wins.

Cada nota posee un campo updatedAt (timestamp).

El servidor compara el updatedAt de la nota entrante con la versión que posee en memoria. Solo se aceptan cambios si el timestamp del cliente es estrictamente mayor.

3. Soporte Offline y Soft Delete
Persistencia: Se utiliza localStorage como caché local. La aplicación siempre carga primero los datos locales para garantizar disponibilidad inmediata.

Borrado Lógico: Las notas no se eliminan físicamente del cliente mientras está offline; se marcan con deleted: true. Esto permite que el servidor se entere del borrado durante el próximo ciclo de sincronización.

4. Finite State Machine (FSM)
El Dashboard actúa como una máquina de estados  para gestionar la UI de forma predecible.

Tecnologías utilizadas
Frontend: React, TypeScript, Tailwind CSS (estilos modernos y responsivos).

Backend: Node.js, Express, TypeScript.

Comunicación: Polling (Sondeo) cada 10 segundos para garantizar que el Cliente A reciba los cambios del Cliente B eventualmente.

Conceptos Aplicados
Puertos de Red: Configuración de CORS para permitir comunicación entre el puerto 5173 (Vite) y 4000 (Express).
