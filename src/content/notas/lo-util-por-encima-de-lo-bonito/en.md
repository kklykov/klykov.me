---
title: Useful over pretty
description: Why a pretty interface that doesn't help is just decoration.
date: 2026-10-01
tags: [UX, DX]
slug: useful-over-pretty
draft: false
---

A pretty interface that doesn't help the user is just decoration. And so is an elegant stack with bad DX.

I've been building for the web for more than ten years, and one idea keeps coming back at every stage: if it doesn't help, it goes. It doesn't matter whether it's an animation, a gradient or one more layer of abstraction in the code.

## Pretty is not the same as useful

An interface can be beautiful and still fail at the basics: letting people understand where they are, what they can do and what will happen when they press a button. When that fails, looks can't make up for it.

> If an animation doesn't direct attention or tell you something, it's noise.

## DX is UX too

Developers are the users of a stack. A project with good DX is quick to understand, safe to change and ships without rituals. A poorly planned one turns every change into a negotiation, even if it uses the trendiest library or the newest `framework`.

```js title="regla.js"
// Before adding anything, one question:
if (!ayudaAlUsuario(idea)) {
  descartar(idea);
}
```

This site tries to live by it: it loads fast, makes sense without animations and allows itself a single artistic moment, the timeline on the home page.
