+++
title = 'Why were PS1 graphics so wobbly?'
date = '2026-05-26T19:20:00+02:00'
description = 'Texture warping, polygon jitter, and popping were separate consequences of how the original PlayStation rendered 3D scenes.'
summary = 'The characteristic PS1 wobble was not one artifact. It was the visible result of several deliberate shortcuts in the console’s graphics pipeline.'
featured = true
+++

Move a camera through a PlayStation game and the world rarely stays still. Walls bend. Character silhouettes twitch. A floor polygon briefly appears over the object standing on it. Distant textures sparkle as if every surface is covered in glitter.

{{< video src="media/ff7-ps1-artifacts.mp4" poster="media/ff7-ps1-artifacts-poster.jpg" >}}
Watch the floor and character edges as the camera settles. [Gameplay source](https://youtu.be/D6-lbtqQ7oY).
{{< /video >}}

These effects are often grouped together as "PS1 wobble," but they do not have a common cause. They come from different stages of the console's graphics pipeline, and each reveals a different piece of information that was discarded along the way.

## A 3D front end and a 2D renderer

The PlayStation splits graphics work between two main components. The Geometry Transformation Engine (GTE), a coprocessor attached to the CPU, handles matrix operations, lighting, and perspective projection. The GPU then draws polygons, lines, and rectangles into video memory.

The boundary between the two matters. The GTE works with 3D vertices, but the GPU receives polygons that have already been projected onto the screen. A polygon command contains whole-number X and Y positions, texture coordinates, colors, and some drawing state. It does not contain a Z coordinate for each vertex.

In simplified form, the pipeline looks like this:

```text
3D vertices
    -> GTE transformation and projection
    -> software depth ordering
    -> 2D GPU commands
    -> framebuffer in VRAM
```

The GPU is therefore closer to a very fast 2D polygon painter than a modern 3D GPU. Once depth and fractional screen positions have been removed from a command, the rasterizer cannot recover them.

## Whole pixels make geometry wobble

Imagine that a projected vertex moves horizontally from `120.2` pixels to `120.8` pixels over several frames. On a rasterizer with subpixel vertex precision, that fractional movement is retained while the triangle is converted into pixels. On the PlayStation, the GPU receives only a whole-number screen position. The vertex remains at one coordinate, then snaps to the next.

One snapping vertex is subtle. A model is made of many connected vertices, though, and their rounding thresholds are not reached at the same time. As the camera moves, silhouettes jitter and small triangles appear to change shape. Low display resolutions make every one-pixel step proportionally larger and easier to see.

This is often blamed on the PlayStation having no floating-point unit. That explanation is incomplete. The GTE uses fixed-point numbers, but fixed-point numbers can still represent fractions. Its transformation matrices, screen offsets, and intermediate calculations all contain fractional precision. The visible discontinuity occurs when the projected result becomes the integer X/Y coordinate consumed by the GPU.

An FPU would not fix an interface that only accepts whole pixels.

## Affine textures make surfaces swim

Texture warping is separate from geometry wobble. An untextured polygon can wobble, and a motionless textured polygon can still be mapped incorrectly.

Each vertex of a textured polygon has a pair of texture coordinates, usually called U and V. The rasterizer must determine the U/V value for every pixel inside the triangle. The PlayStation does this by linearly interpolating them across the already-projected 2D shape. This is **affine texture mapping**.

For screen-space weights `a`, `b`, and `c`, the affine calculation is approximately:

```text
u = a*u0 + b*u1 + c*u2
```

Correct perspective mapping must account for each vertex's depth. Conceptually, it interpolates `u/z` and `1/z`, then reconstructs U at each pixel:

```text
u = (a*u0/z0 + b*u1/z1 + c*u2/z2)
    / (a/z0 + b/z1 + c/z2)
```

The first calculation is much cheaper, but it assumes the texture lies flat in screen space. The error becomes obvious on a large polygon receding into the distance, such as a floor, road, or wall viewed at an angle. A checkerboard that should compress toward the horizon instead bends around the two triangles forming the surface.

Movement makes the distortion more conspicuous. Every frame produces a slightly different projected triangle, then fits a new affine mapping onto it. Combined with vertices snapping between pixels, the texture seems to swim over the geometry.

The standard workaround was subdivision. Splitting one large polygon into many small ones gives each affine approximation a smaller depth range, bringing it closer to the perspective-correct result. [Sony's libraries included routines for this](https://archive.org/download/SCE-RunTimeLibRef-Sep1999/LIBREF46.PDF), and later games often tessellated important surfaces aggressively. The tradeoff was more vertices to transform, sort, store, and draw.

Daniel Ilett's [affine texture mapping demonstration](https://www.danielilett.com/2021-11-06-tut5-21-ps1-affine-textures/) reproduces the same effect on a modern GPU by explicitly disabling its normal perspective correction.

## No depth buffer makes polygons pop

A modern depth buffer stores a depth value for every screen pixel. Before drawing a new pixel, the GPU compares its depth with the value already stored and keeps whichever surface is closer.

The PlayStation GPU has no such buffer. It paints commands in order, and a later polygon overwrites an earlier one. Games generally handled this with an **ordering table** in main memory: assign each primitive to a depth bucket, then send distant buckets to the GPU before nearby ones.

The GTE even has instructions for calculating the average depth of three or four vertices. But one average value cannot describe every part of a large polygon. Primitive-level sorting also cannot always resolve intersecting surfaces or three polygons that overlap cyclically. Two primitives in the same coarse bucket still need an arbitrary order.

When that approximation changes from one frame to the next, a whole polygon can suddenly jump in front of another. This is the source of characteristic surface popping and flickering intersections. The missing depth buffer creates the problem, but the visible result depends on each game's sorting code and scene design.

## Crisp, shimmering, and dithered

The rest of the PS1 look comes largely from texture sampling and color output.

The GPU samples textures without bilinear filtering. When a texture is enlarged, one source texel becomes a hard-edged block of screen pixels instead of blending with its neighbors. The GPU also has no native mipmapping. When a detailed texture becomes smaller than a pixel, tiny camera movements select different texels and produce shimmer.

Neither limitation causes texture warping. Affine interpolation determines _where_ the texture is sampled; filtering and mipmapping determine _how_ nearby samples are combined.

Normal drawing uses five bits for each red, green, and blue channel. Smooth gradients therefore have only 32 levels per channel and can form visible bands. The GPU can add a repeating 4x4 dither pattern before reducing colors to that format. At normal viewing distance, especially through an analog signal on a CRT, the pattern helps adjacent color levels blend perceptually. Enlarged on a modern display, the ordered noise becomes an artifact of its own.

Low framebuffer resolutions amplify all of these effects, but there was no single "PS1 resolution." Games selected modes according to their memory and performance needs.

## Constraints became game design

These omissions make more sense in the context of the machine. The PlayStation has 1 MB of VRAM shared by framebuffers, textures, and color lookup tables. At `320x240`, a 16-bit depth buffer would consume another 150 KiB, before accounting for the bandwidth needed to read and update it for every pixel. Perspective correction and filtering would require more interpolation hardware, texture reads, and cache capacity.

This is an engineering inference rather than a documented statement of Sony's intent, but the trade is visible: the hardware favors a simple command stream and high practical drawing throughput, while difficult cases are left to software and game design.

Developers responded in different ways. They subdivided prominent surfaces, kept problematic geometry away from the camera, used fog to shorten sight lines, and built custom sorting and clipping systems. Naughty Dog went further with _Crash Bandicoot_: its rail camera made it possible to precompute visibility and polygon ordering, while shaded, mostly untextured character geometry avoided the worst texture stretching. [Andy Gavin's development retrospective](https://all-things-andy-gavin.com/2011/02/04/making-crash-bandicoot-part-3/) describes those constraints as inputs to the game's visual design, not defects discovered at the end.

{{< video src="media/crash-bandicoot-ps1-artifacts.mp4" poster="media/crash-bandicoot-ps1-artifacts-poster.jpg" >}}
In _Crash Bandicoot_, the shaded character holds together while the textured path and scenery crawl and snap as the rail camera advances. [Gameplay source](https://www.youtube.com/watch?v=xK-h4M4Aetg&t=140s).
{{< /video >}}

## The artifact is the architecture

Modern emulators provide a useful experiment. Subpixel precision can reduce geometry wobble without fixing affine textures. Perspective-correct texturing can straighten surfaces without fixing polygon sorting. Enhanced depth handling addresses a third problem again. Toggle each feature independently and the supposedly singular "PS1 wobble" separates into its component parts.

The original image is what happens when all those parts interact: whole-pixel geometry carrying affine textures, painted in approximate depth order, sampled without filtering, and reduced to a small dithered color space.

What looks today like a coherent aesthetic was not one rendering effect. It was the architecture made visible.

## Further reading

- [PlayStation Specifications: Geometry Transformation Engine](https://psx-spx.consoledev.net/geometrytransformationenginegte/)
- [PlayStation Specifications: Graphics Processing Unit](https://psx-spx.consoledev.net/graphicsprocessingunitgpu/)
- [Rodrigo Copetti's PlayStation architecture analysis](https://www.copetti.org/writings/consoles/playstation/)
- [Modern Vintage Gamer's overview of PS1 warping and wobbling](https://www.youtube.com/watch?v=x8TO-nrUtSI)
- [Beetle PSX HW documentation for PGXP enhancements](https://docs.libretro.com/library/beetle_psx_hw/)
