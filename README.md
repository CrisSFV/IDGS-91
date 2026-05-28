# IDGS-91

Proyectos de DESARROLLO WEB INTEGRAL 2026.

## NutriCrispy

Sistema web estatico para registrar pacientes, calcular IMC y guardar consultas nutricionales en `sessionStorage`.

## Entrega

- Repositorio publico: https://github.com/CrisSFV/IDGS-91
- URL de produccion: pendiente de despliegue en Vercel, Netlify o Render

## Estructura

- `index.html`: entrada principal con redireccion a la aplicacion.
- `nutri-sistema.html`: interfaz del sistema.
- `css/nutricrispy.css`: estilos visuales.
- `js/nutricrispy.js`: logica de sesion, pacientes, IMC e historial.

## Despliegue

La aplicacion no requiere build ni dependencias. Para publicar en Netlify o Vercel, configurar:

- Framework preset: `Other` o `Static`
- Build command: vacio
- Publish directory: `.`

Las rutas de CSS y JavaScript usan referencias relativas (`./css/...` y `./js/...`) para funcionar correctamente en produccion.
