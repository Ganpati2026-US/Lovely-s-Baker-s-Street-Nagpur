# Burger texture assets

Generated with the built-in imagegen tool on 2026-10-10 and encoded as WebP for the local website. These are AI-generated material references, not scans of the restaurant's food. The burger remains procedural, rotatable 3D geometry.

| Saved asset | Use |
| --- | --- |
| `public/textures/brioche-skin-v2.webp` | Outer crust of both buns; object-space colour and bump projection |
| `public/textures/seared-patty-v2.webp` | Retained earlier seared-patty texture; no longer used by the current patty |
| `public/textures/tomato-cut-v2.webp` | Upper and lower tomato cut faces |
| `public/textures/lettuce-leaf-v2.webp` | Leaf colour, fine veins, and bump |

The current patty uses the existing `public/textures/chicken-coating.webp` at a finer texture scale, with its colour remapped to toasted brown. Its rounded surface uses a subtle bump and has no separate raised crumb meshes.

## Brioche prompt

Use case: photorealistic-natural. Asset type: seamless square albedo texture for the outer crust of a brioche burger bun in a real-time 3D renderer. Generate a single edge-to-edge, flat orthographic macro photograph of smooth baked egg-washed brioche crust, rich caramel golden orange with natural subtle amber mottling, thousands of tiny fine pores and delicate tiny shallow irregular wrinkles. This is ONLY the thin OUTSIDE SKIN of a soft bakery burger bun, NOT the porous inside crumb, not toast, not a whole bun. Very fine organic detail at roughly a 12cm by 12cm physical sample. Even diffuse cross-polarized lighting without shiny white highlights, no strong directional shadows or gradients, uniform brightness across frame. Mostly smooth continuous baked skin with microscopic pinprick bubbles, restrained variation; no large cracks, no large cells, no scales. Texture fills entire square; no background, no border, no sesame seeds, no objects, no text, no logo. Seamless tiling on every edge. High-resolution real food photography detail, warm edible rich orange brown color.

## Patty prompt

Use case: photorealistic-natural. Asset type: seamless square albedo texture for a seared burger patty 3D material. Edge-to-edge flat orthographic macro photograph showing only the richly browned surface of a finely ground burger patty, dark mahogany and chestnut brown sear, very fine craggy caramelized crispy crust, tiny natural irregular cracks and pinprick pores, small juicy reddish-brown bits between darker charred edges. Real food texture, appetizing. No chunks larger than a few millimeters. Entire image represents a 15cm by 15cm patch of the cooked surface. Cross-polarized soft diffuse lighting, no shadows or hot highlights baked into texture. No grill stripes, no breading, no crumbs, no cheese, no fat blobs, no sesame, no plate, no outline of a patty, no black background, no text. Flat even illumination and focus, fine detailed organic texture fills all edges, seamless tiling.

## Tomato prompt

Use case: photorealistic-natural. Asset type: texture map of a single tomato cut face for the circular cap of a 3D sliced tomato. A perfectly circular ripe red tomato cross section viewed directly from above in a true orthographic view, circle precisely centered in a square image, tomato diameter filling 99 percent of image width and height. Only ONE flat cut face, no thickness visible, no perspective. Botanical photograph of fresh ripe tomato flesh with subtly asymmetric natural seed chambers, golden pale seeds suspended in translucent wet red orange gel, finely granular bright scarlet flesh, pale coral central core and fine fleshy radial walls. Sharp edge-to-edge macro detail. Thin red skin at perimeter. Corners outside circle solid matching tomato red. Cross polarized flat diffuse illumination with no shadows, no specular white highlights. No stems, no green, no onions, no other objects, no text, no illustration. Must look like real sliced tomato photographed on a copy stand.

## Lettuce prompt

Use case: photorealistic-natural. Asset type: full square macro albedo texture for a fresh green lettuce leaf 3D material. Flat orthographic directly overhead macro photograph of the interior surface of ONE fresh green leaf lettuce leaf, chartreuse green and leafy yellow green, natural very fine translucent tissue, a thin pale green central midrib running vertically up the center, gently curved branching side veins reaching left and right, finest delicate vein network across the whole surface, very fine natural puckering. The entire square is filled with this one continuous leaf surface; NO outer leaf edges, no borders, no background, no other leaves, no water droplets, no text. Diffuse cross polarized even lighting, no hot white highlights, no large folds or dark shadows. Delicious crisp tender lettuce, real botanical food photography, all detail sharp and fine. Leaf midrib subtle and narrow, not a thick white stem.

## Chef glove placement

Asset: `public/textures/chef-glove-pinch.webp`. Generated with the built-in imagegen tool on 2026-10-10, then encoded as WebP with alpha preserved. This photographic cutout is animated on a subdivided plane: the fingertips open before the hand withdraws. The wooden rod and flag remain 3D geometry. The glove appears only during placement and is omitted with reduced motion.

Prompt:

Use case: product-mockup. Asset: transparent photographic hand cutout for an animated restaurant website. A single anatomically realistic human right hand wearing a tight black nitrile chef glove, wrist entering diagonally from upper right, fingers pointing down toward lower left. Index finger curls down on left, thumb descends on right, their fingertips almost meet at bottom in a delicate downward precision pinch as if holding a thin vertical cocktail flag toothpick. Leave a tiny 3mm gap between fingertips. Other three fingers naturally curled into palm behind, not splayed. Entire hand and short wrist visible, cropped clean at upper-right wrist only. Photorealistic, detailed subtle glove wrinkles over knuckles and finger joints, matte charcoal black with soft studio highlights from upper left. Square canvas, hand fills frame with a little transparent margin; pinch point about 30% from left and 80% from top. No actual toothpick, no flag, no burger, no skin, no jewelry, no text, no watermark. Genuinely transparent background.
