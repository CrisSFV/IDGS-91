# IDGS-91

Proyectos de DESARROLLO WEB INTEGRAL 2026.

## NutriCrispy

Sistema web estatico para registrar pacientes, calcular IMC y guardar consultas nutricionales en `sessionStorage`.

## Entrega

- Repositorio publico: https://github.com/CrisSFV/IDGS-91
- URL de produccion: pegar aqui la URL activa de Render cuando termine el despliegue

## Estructura

- `index.html`: entrada principal con redireccion a la aplicacion.
- `nutri-sistema.html`: interfaz del sistema.
- `css/nutricrispy.css`: estilos visuales.
- `js/nutricrispy.js`: logica de sesion, pacientes, IMC e historial.

## Despliegue

La aplicacion no requiere build ni dependencias. Para publicar en Render, usar el archivo [render.yaml](render.yaml) incluido en el repositorio.

- Tipo de servicio: `Static Site` o `Web` con runtime `static`
- Publish directory: `.`
- Build command: `echo "Sitio estatico sin compilacion"`

Las rutas de CSS y JavaScript usan referencias relativas (`./css/...` y `./js/...`) para funcionar correctamente en produccion.
