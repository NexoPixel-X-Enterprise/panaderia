Este es un proyecto [Next.js](https://nextjs.org) hecho con [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Para administrador de paquetes utilizar **únicamente** `pnpm`. **NO USAR NPM**

## Para comenzar

Primero, realiza la instalación de las dependencias y librerías del proyecto:

```bash
    pnpm install
```

Segundo, corre el servidor de desarrollo:

```bash
pnpm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

El archivo `app/page.tsx` es el encargado de renderizar todo el contenido de la página principal.

La carpeta `/catalogo` es un ejemplo de como se deben crear las distintas páginas a visitar dentro de la aplicación:
- El archivo `catalogo/page.tsx` es donde se renderizará todo lo relacionado a la página **Catálogo**.
- La carpeta `components/catalogo` contendrá los archivos de su página correspondiente (inicio, barra de búsqueda, lista de productos, etc).
- Para crear una nueva página únicamente se crea una carpeta con el nombre de dicha página dentro de `/app` que contenga un archivo **page.tsx**.
En el archivo `app/layout.tsx` únicamente se renderizarán el **Header** y el **Footer**.

La carpeta `components/home` contendrá los elementos **.tsx** de la pagina inicial.

La carpeta `components/layout` únicamente contendrá `header.tsx` y `footer.tsx`.

Este proyecto usa [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) para optimizar y cargar automáticamente las fuentes.
Las fuentes ya estan asignadas, por lo que no hace falta cambiar nada.

## Buenas prácticas para SEO

- Siempre utiliza **Image** (`import Image from "next/image"`) a la hora de poner imágenes para la carga optimizada.
- Englobar contenido de componentes en etiquetas semánticas (`<section></section>`).

## Buenas prácticas para Accesibilidad

- Usar `aria-label` únicamente en etiquetas `<button></button>`, `<a></a>` y `<Link></Link>` cuando sea realmente necesario:
    - Si la etiqueta es descriptiva (`<button> Comprar </button>`), no es necesario el uso de `aria-label`.
    - Si la etiqueta no es descriptiva (`<button> <IconoDeBarras /> </button>`), usar aria label de forma correcta:
        - `aria-label="Boton menu"` ❌.
        - `aria-label="Desplegar menu de navegacion"` :white_check_mark:.

## Información extra

Para más información sobre Next.js, échale un vistazo a los siguientes recursos:

- [Documentación de Next.js](https://nextjs.org/docs) - Aprende sobre Next.js y APIs.
- [Aprende Next.js](https://nextjs.org/learn) - Un tutorial interactivo de Next.js.