---
title: Lo útil por encima de lo bonito
description: Por qué una interfaz bonita que no ayuda es solo decoración.
date: 2026-10-01
tags: [UX, DX]
draft: false
---

Una interfaz bonita que no ayuda al usuario es solo decoración. Y un stack elegante con mala DX, también.

Llevo más de diez años haciendo web y hay una idea que se repite en cada etapa: lo que no ayuda, sobra. Da igual que sea una animación, un degradado o una capa más de abstracción en el código.

## Bonito no es lo mismo que útil

Una interfaz puede ser preciosa y aun así fallar en lo básico: que el usuario entienda dónde está, qué puede hacer y qué pasará cuando pulse un botón. Cuando eso falla, la estética no lo compensa.

> Si una animación no dirige la atención ni cuenta algo, es ruido.

## La DX también es UX

El desarrollador es el usuario del stack. Un proyecto con buena DX se entiende rápido, se cambia sin miedo y se despliega sin rituales. Uno mal planteado convierte cada cambio en una negociación, aunque use la librería de moda o el `framework` más reciente.

```js title="regla.js"
// Antes de añadir algo, una pregunta:
if (!ayudaAlUsuario(idea)) {
  descartar(idea);
}
```

Esta web intenta aplicarlo: carga rápido, se entiende sin animaciones y solo se permite un momento artístico, la línea temporal de la portada.
