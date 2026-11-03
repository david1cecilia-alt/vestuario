# Vestuario

App web instalable (PWA) para recoger, en segundos, cómo han vivido el entrenamiento los jugadores de un equipo de **balonmano** o **baloncesto**. Pensada para niños y adultos: muy visual, botones grandes y nada de formularios aburridos.

## Qué hace

- **Equipos y plantillas** por deporte, en tarjetas 3D.
- **Reseña del jugador en menos de 20 segundos**: barra vertical de 1 a 10 (de rojo a verde), cuestionarios del día y botón de lesionado. Una sola reseña por jugador y día.
- **Zona del entrenador** protegida con PIN: cuestionarios para jugadores, para lesionados y personalizados (uno o varios jugadores), con cuatro estilos de respuesta (emoji, color, casillas y línea deslizante).
- **Gráficas**: evolución de la media por sesión, filtros por jugador, asistencia, resumen de cuestionarios y exportación a Excel, CSV, PDF o tabla.

## Tecnología

- Vite + JavaScript sin framework, `vite-plugin-pwa` (instalable y con caché sin conexión).
- Supabase: autenticación por correo y contraseña, PostgreSQL con un esquema propio (`vestuario`) y **Row Level Security**:
  - Lista blanca de entrenadores (`vestuario.coaches`): una cuenta que no esté ahí no ve ni escribe nada.
  - Cada fila lleva su `owner_id` y las políticas solo dejan acceder a su dueño.
  - La fecha de cada reseña la fija el servidor (hora de Madrid) y una restricción única impide dos reseñas del mismo jugador el mismo día.
- Exportación con SheetJS y jsPDF.

## Desarrollo

```bash
npm install
npm run dev
```

Las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` están en `.env`. La clave *publishable* es pública por diseño: la seguridad de los datos la garantizan las políticas RLS, no la clave.

## Despliegue

Cada push a `main` publica la app en GitHub Pages mediante GitHub Actions.
