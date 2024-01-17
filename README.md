# M4D
## Descripción del Proyecto

M4D es una aplicación que proporciona una plataforma para la gestión de usuarios, publicaciones multimedia, comercios, chat en tiempo real y mapas. La arquitectura de esta aplicación está basada en microservicios para facilitar la escalabilidad y el mantenimiento.

## Servicios Principales

### 1. Servicio de Autenticación

- Gestiona el registro y el inicio de sesión de los usuarios.
- Asegura el acceso a los recursos protegidos.

### 2. Servicio de Usuarios

- Maneja la información del perfil del usuario.
- Proporciona funcionalidades relacionadas con el usuario.
- Permite la actualización del perfil y cambio de contraseña.

### 3. Servicio de Publicaciones

- Administra la creación, actualización, eliminación y consulta de publicaciones multimedia.
- Asocia publicaciones con usuarios y comercios.
  
### 4. Servicio de Comercios

- Maneja la información de los comercios, incluyendo la ubicación para el mapa.
- Puede estar asociado con usuarios y publicaciones.
  
### 5. Servicio de Chat

- Crea salas de chat y administra la adición de usuarios a estas salas.
- Maneja el envío y recepción de mensajes en tiempo real.

### 6. Servicio de Mapa

- Interactúa con la API de Google Maps para renderizar mapas y mostrar ubicaciones de comercios.
- Proporciona funciones para buscar comercios cercanos o filtrar por categorías.
