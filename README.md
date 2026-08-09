# Fields

**Fields** is a curated gallery of 61 interactive and generative web
backgrounds. Every experiment is built with plain HTML, CSS, and JavaScript,
with no framework or build step required.

Move, click, drag, or tap through particle systems, fluid simulations,
geometric fields, natural environments, lighting studies, and space-inspired
visuals.

## Gallery

The root `index.html` contains the main gallery. It provides:

- Search across all experiments
- Category filters
- Animated project covers
- On-demand live previews
- Full-page experience links
- Keyboard-accessible project cards
- Responsive desktop and mobile layouts
- Reduced-motion support

The gallery does not run every simulation simultaneously. Live projects are
loaded only when their preview is opened, keeping the collection responsive.

## Quick start

No installation or compilation is necessary.

### Open directly

Open `index.html` in a modern browser.

### Run through a local server

Using Python:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

Using VS Code, the repository can also be opened with the Live Server
extension.

Running through a local server is recommended for the most consistent iframe,
audio, and browser permission behavior.

## Controls

Most experiments use one or more of these controls:

| Input | Common behavior |
| --- | --- |
| Move | Bend, attract, repel, illuminate, or redirect the field |
| Click or tap | Generate ripples, pigment, lightning, crystals, or impulses |
| Press and hold | Charge an effect or increase its intensity |
| Drag | Stretch a surface or draw through a particle field |
| Microphone | Drive the Audio Visualizer after browser permission is granted |

Each project includes a short on-screen description of its specific
interaction.

## Collection

### Particles

| Project | Description |
| --- | --- |
| [Dot Field](background/particles/dot-field/) | A spring-loaded dot grid with repel and magnetize modes |
| [Particle Trails](background/particles/particle-trails/) | Light particles that paint fading cursor trails |
| [Flow Field](background/particles/flow-field/) | Particles traveling through an invisible vector current |
| [Digital Rain](background/particles/digital-rain/) | A falling symbol stream that parts around the cursor |
| [Magnetic Typography](background/particles/magnetic-typography/) | Floating letters drawn into cursor-centered arrangements |
| [Atomic Orbitals](background/particles/atomic-orbitals/) | Interactive electrons orbiting responsive atomic nuclei |
| [Nuclear Fission](background/particles/nuclear-fission/) | A particle-based visualization of splitting atomic nuclei |
| [Matrix Code](background/particles/matrix-code/) | width=device-width, initial-scale=1 |
| [Network Monitor](background/particles/network-monitor/) | Animated terminals, packet streams, binary signals, and live graphs |

### Fluid

| Project | Description |
| --- | --- |
| [Liquid Mesh](background/fluid/liquid-mesh/) | Blended color masses stretched by cursor motion |
| [Ink Diffusion](background/fluid/ink-diffusion/) | Click-driven pigment blooms on a paper-like surface |
| [Neon Fluid](background/fluid/neon-fluid/) | Luminous pigment stirred by fast gestures |
| [Smoke Ribbons](background/fluid/smoke-ribbons/) | Soft volumetric trails folded through movement |
| [Ferrofluid Spikes](background/fluid/ferrofluid-spikes/) | Magnetic liquid spikes aligned toward the pointer |
| [Lava Lamp](background/fluid/lava-lamp/) | Warm, viscous blobs that rise, merge, and follow heat |

### Geometry

| Project | Description |
| --- | --- |
| [Wave Grid](background/geometry/wave-grid/) | A dimensional grid with hover waves and click ripples |
| [Elastic Fabric](background/geometry/elastic-fabric/) | A connected mesh that can be stretched and released |
| [Pixel Displacement](background/geometry/pixel-displacement/) | A raster composition that scatters and reconstructs |
| [Voronoi Cells](background/geometry/voronoi-cells/) | Organic cells that reorganize around the cursor |
| [Kinetic Clockwork](background/geometry/kinetic-clockwork/) | Interconnected gears driven by cursor momentum |
| [Hyperspace Lattice](background/geometry/hyperspace-lattice/) | A steerable rotating wireframe corridor |
| [Generative Kaleidoscope](background/geometry/generative-kaleidoscope/) | Twelve-fold mirrored geometry controlled by movement |
| [Circuit Board](background/geometry/circuit-board/) | Electrical packets routing across a living circuit |
| [Motherboard Network](background/geometry/motherboard-network/) | A central CPU exchanging live data with GPU, RAM, NVMe, power, chipset, and I/O |
| [Cyberpunk Road](background/geometry/cyberpunk-road/) | An endless neon highway with steering and hold-to-boost overdrive |
| [Radar System](background/geometry/radar-system/) | A tactical rotating sweep with moving contacts, echoes, and placed waypoints |
| [Analog Control System](background/geometry/analog-control-system/) | A complete control deck with gauges, digital displays, lights, switches, buttons, gyro, level, and power lever |
| [Live Speedometer](background/geometry/live-speedometer/) | A live speed and RPM simulation with six automatic gears and visible shifts |
| [Architectural Blueprint](background/geometry/architectural-blueprint/) | A living floor plan with dimensions, drafting cursor, and placed structural columns |
| [Parametric Facade](background/geometry/parametric-facade/) | A building-skin grid that bends dynamically around environmental pressure |
| [Isometric City](background/geometry/isometric-city/) | An endless field of animated architectural massing |
| [Piston Engine](background/geometry/piston-engine/) | A synchronized four-cylinder crankshaft and combustion cycle |
| [Turbine Flow](background/geometry/turbine-flow/) | A boostable turbine cutaway with rotating blades and airflow particles |
| [Mechanical Linkage](background/geometry/mechanical-linkage/) | Connected flywheels, cams, and rods transferring continuous motion |

### Nature

| Project | Description |
| --- | --- |
| [Firefly Garden](background/nature/firefly-garden/) | A curious swarm of softly glowing insects |
| [Topographic Map](background/nature/topographic-map/) | Animated contour lines raised by the pointer |
| [Sand Dunes](background/nature/sand-dunes/) | Wind-shaped grains disturbed by movement |
| [Reaction Diffusion](background/nature/reaction-diffusion/) | A Gray–Scott-style organic pattern simulation |
| [Bioluminescent Ocean](background/nature/bioluminescent-ocean/) | Waves and glowing plankton awakened by motion |
| [Crystal Growth](background/nature/crystal-growth/) | Branching mineral structures seeded by clicks |
| [Paper Cut Layers](background/nature/paper-cut-layers/) | A layered landscape with pointer-driven parallax |
| [Weather System](background/nature/weather-system/) | Interactive wind, rain, atmosphere, and lightning |
| [Interactive Butterflies](background/nature/interactive-butterflies/) | A curious butterfly swarm with gathering, scattering, and pollen trails |
| [Contour Mountain Map](background/nature/contour-mountain-map/) | A flat cartographic landscape of nested mountain contours and survey markers |

### Space

| Project | Description |
| --- | --- |
| [Constellation Field](background/space/constellation-field/) | Drifting stars with proximity-based connections |
| [Gravity Well](background/space/gravity-well/) | Particles pulled into luminous cursor-centered orbits |
| [Black Hole](background/space/black-hole/) | A chargeable singularity that consumes the field |
| [Star Tunnel](background/space/star-tunnel/) | A steerable depth field with hold-to-warp acceleration |
| [Cosmic Dust](background/space/cosmic-dust/) | Colored nebula particles curling into the cursor wake |
| [Northern Star Map](background/space/northern-star-map/) | A rotating labeled sky with pointer parallax |
| [Portal Distortion](background/space/portal-distortion/) | A movable portal revealing another animated world |
| [Digital Globe](background/space/digital-globe/) | A rotating connected world with city nodes and live data routes |

### Light

| Project | Description |
| --- | --- |
| [Interactive Noise](background/light/interactive-noise/) | A signal field warped like heat around the cursor |
| [Aurora](background/light/aurora/) | Layered atmospheric ribbons leaning toward movement |
| [Spotlight Reveal](background/light/spotlight-reveal/) | A cursor light exposing a hidden graphic composition |
| [Glass Refraction](background/light/glass-refraction/) | A movable lens that magnifies and shifts the scene |
| [Lightning Network](background/light/lightning-network/) | Electrical branches that search for the pointer |
| [Water Caustics](background/light/water-caustics/) | Refracted light bands moving across an aquatic surface |
| [Audio Visualizer](background/light/audio-visualizer/) | A circular field driven by ambient motion or microphone input |
| [Nuclear Fusion](background/light/nuclear-fusion/) | Luminous nuclei merging into a high-energy fusion reaction |
| [Shockwave Explosion](background/light/shockwave-explosion/) | width=device-width, initial-scale=1 |

## Project structure

```text
background-website/
├── index.html                 # Gallery
├── style.css                  # Gallery styles
├── script.js                  # Catalog, filters, search, and previews
├── README.md
└── background/
    ├── particles/
    │   ├── dot-field/
    │   │   ├── index.html
    │   │   ├── style.css
    │   │   └── script.js
    │   └── ...
    ├── fluid/
    ├── geometry/
    ├── nature/
    ├── space/
    └── light/
```

Every background is independent and contains:

```text
background/category/project-name/
├── index.html
├── style.css
└── script.js
```

This makes each experiment easy to copy, customize, embed, or deploy by
itself.

## Technology

- Semantic HTML
- Responsive CSS
- Canvas 2D rendering
- CSS gradients, filters, masks, and animations
- Pointer and touch events
- Native `<dialog>` and `<iframe>` elements
- Web Audio API in the Audio Visualizer
- No external runtime dependencies

## Browser support

A current version of Chrome, Edge, Firefox, or Safari is recommended.

Some visual details depend on modern browser features such as:

- Canvas 2D
- CSS `color-mix()`
- CSS masks and filters
- Native dialog elements
- Pointer events
- Web Audio and microphone permissions

The Audio Visualizer requires user permission before it can access microphone
input. Browsers generally require microphone access to run from `localhost` or
a secure HTTPS origin.

## Customizing an experiment

Each project is self-contained. Common values can be adjusted near the top of
its `script.js`, including:

- Particle count or density
- Interaction radius
- Attraction or repulsion strength
- Velocity and damping
- Grid spacing
- Color values
- Trail duration
- Animation speed

Typography, page copy, layout, and supporting colors live in the project's
`style.css` and `index.html`.

For better performance on lower-powered devices:

- Reduce particle counts
- Increase grid spacing
- Lower the device-pixel-ratio cap
- Reduce blur radius
- Avoid loading multiple live simulations simultaneously

## Adding another background

1. Create a kebab-case folder inside `background/<category>/`.
2. Add `index.html`, `style.css`, and `script.js`.
3. Ensure the experience fills the viewport and supports pointer input.
4. Add a project entry to the `projects` array in the root `script.js`.
5. Assign one of the gallery categories:
   - `particles`
   - `fluid`
   - `geometry`
   - `nature`
   - `space`
   - `light`
6. Provide two accent colors for its gallery cover.
7. Update the displayed project totals in the gallery and this README.

Example catalog entry:

```js
[
  "Project Name",
  "project-folder",
  "particles",
  "#b7ef79",
  "#537c55",
]
```

## Accessibility and motion

The gallery includes:

- Keyboard-focusable project cards
- Enter and Space activation
- Escape-to-close native preview dialog behavior
- Search keyboard shortcut using `/`
- Responsive touch targets
- A reduced-motion media query

The individual backgrounds are primarily decorative visual experiences.
Descriptive page text remains available above each canvas.

## Performance notes

The gallery uses generated CSS artwork for its cards instead of running 61
canvas simulations at once. A background is loaded into an iframe only when
the user opens its live preview. Closing the preview unloads that iframe.

Canvas resolution is capped in many projects to reduce high-density display
costs. Particle counts and grid density are also responsive where appropriate.

## License

opensource

