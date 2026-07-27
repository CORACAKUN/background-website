const projects = [["Dot Field", "dot-field", "particles", "#b7ef79", "#537c55"], ["Constellation Field", "constellation-field", "space", "#7fe7ff", "#7b78ff"], ["Gravity Well", "gravity-well", "space", "#ff8750", "#8d54e8"], ["Liquid Mesh", "liquid-mesh", "fluid", "#cfff74", "#32bca7"], ["Wave Grid", "wave-grid", "geometry", "#73ddff", "#6557e8"], ["Particle Trails", "particle-trails", "particles", "#b8a4ff", "#f175d2"], ["Black Hole", "black-hole", "space", "#ff8648", "#7f45e9"], ["Flow Field", "flow-field", "particles", "#64e6bd", "#287c72"], ["Interactive Noise", "interactive-noise", "light", "#e8df72", "#6d7133"], ["Star Tunnel", "star-tunnel", "space", "#72baff", "#5846c9"], ["Aurora", "aurora", "light", "#77f1c8", "#735fe5"], ["Digital Rain", "digital-rain", "particles", "#52eea3", "#176848"], ["Elastic Fabric", "elastic-fabric", "geometry", "#eb82ff", "#773d93"], ["Spotlight Reveal", "spotlight-reveal", "light", "#f4d45e", "#ff6058"], ["Pixel Displacement", "pixel-displacement", "geometry", "#ffac5d", "#dc577e"], ["Ink Diffusion", "ink-diffusion", "fluid", "#a52d55", "#287c83"], ["Neon Fluid", "neon-fluid", "fluid", "#4ffff2", "#ff50dd"], ["Voronoi Cells", "voronoi-cells", "geometry", "#b7ed74", "#597a50"], ["Magnetic Typography", "magnetic-typography", "particles", "#ff805f", "#af3948"], ["Firefly Garden", "firefly-garden", "nature", "#dfff70", "#328d54"], ["Topographic Map", "topographic-map", "nature", "#758640", "#c5a465"], ["Glass Refraction", "glass-refraction", "light", "#376ddd", "#72c7cb"], ["Sand Dunes", "sand-dunes", "nature", "#ffc16e", "#9a512a"], ["Lightning Network", "lightning-network", "light", "#8cb6ff", "#5360dd"], ["Cosmic Dust", "cosmic-dust", "space", "#bd87ff", "#45a7d8"], ["Reaction Diffusion", "reaction-diffusion", "nature", "#f0a55c", "#9e3155"], ["Water Caustics", "water-caustics", "light", "#86f5ff", "#096e94"], ["Smoke Ribbons", "smoke-ribbons", "fluid", "#d8a8ff", "#6b799e"], ["Ferrofluid Spikes", "ferrofluid-spikes", "fluid", "#d7d7d0", "#363a3c"], ["Kinetic Clockwork", "kinetic-clockwork", "geometry", "#e5b553", "#71542e"], ["Bioluminescent Ocean", "bioluminescent-ocean", "nature", "#55f4df", "#076b83"], ["Crystal Growth", "crystal-growth", "nature", "#76dfff", "#5473d5"], ["Lava Lamp", "lava-lamp", "fluid", "#ff6c85", "#9d3edf"], ["Hyperspace Lattice", "hyperspace-lattice", "geometry", "#768bff", "#3ee7dc"], ["Northern Star Map", "northern-star-map", "space", "#9fc4ff", "#354b87"], ["Paper Cut Layers", "paper-cut-layers", "nature", "#d99179", "#44536a"], ["Audio Visualizer", "audio-visualizer", "light", "#e16cff", "#50a5ff"], ["Generative Kaleidoscope", "generative-kaleidoscope", "geometry", "#ff8f68", "#b43dca"], ["Circuit Board", "circuit-board", "geometry", "#5dffb0", "#2a745d"], ["Weather System", "weather-system", "nature", "#91c8ed", "#4b647e"], ["Portal Distortion", "portal-distortion", "space", "#ffad63", "#7e4cff"], ["Motherboard Network", "motherboard-network", "geometry", "#5dffb0", "#28896a"], ["Atomic Orbitals", "atomic-orbitals", "particles", "#45e8ff", "#ff6fab"], ].map(([name, slug, category, accent, accent2], index) => ( {
  name, slug, category, accent, accent2,
  index: index + 1,
}));
const gallery = document.querySelector("#gallery");
const searchInput = document.querySelector("#search");
const filters = document.querySelector("#filters");
const emptyState = document.querySelector("#empty-state");
const dialog = document.querySelector("#preview-dialog");
const frame = document.querySelector("#preview-frame");
const previewTitle = document.querySelector("#preview-title");
const previewCategory = document.querySelector("#preview-category");
const openProject = document.querySelector("#open-project");
const closePreview = document.querySelector("#close-preview");
let activeFilter = "all";
let query = "";
function cardMarkup(project) {
  const number = String(project.index).padStart(2, "0");
  return `
    <article
      class="card"
      tabindex="0"
      role="button"
      aria-label="Preview ${project.name}"
      data-slug="${project.slug}"
      data-category="${project.category}"
      style="--accent:${project.accent};--accent-2:${project.accent2};--index:${project.index}"
    >
      <div class="card-art">
        <span class="card-index">${number} / ${projects.length}</span>
        <span class="card-play">↗</span>
      </div>
      <div class="card-info">
        <small>${project.category}</small>
        <strong>${project.name}</strong>
        <span>Interactive</span>
      </div>
    </article>
  `;
}
function render() {
  const visible = projects.filter((project) => {
    const matchesFilter = activeFilter === "all" || project.category === activeFilter;
    const searchable = `${project.name} ${project.category} ${project.slug}`;
    return matchesFilter && searchable.toLowerCase().includes(query);
  });
  gallery.innerHTML = visible.map(cardMarkup).join("");
  emptyState.hidden = visible.length > 0;
  gallery.querySelectorAll(".card").forEach((card) => {
    const open = () => showPreview(card.dataset.slug);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}
function showPreview(slug) {
  const project = projects.find((item) => item.slug === slug);
  if (!project) return;
  frame.classList.remove("loaded");
  previewTitle.textContent = project.name;
  previewCategory.textContent = project.category;
  openProject.href = `${project.slug}/index.html`;
  frame.src = `${project.slug}/index.html`;
  if (!dialog.open) dialog.showModal();
}
frame.addEventListener("load", () => frame.classList.add("loaded"));
closePreview.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => {
  frame.src = "about:blank";
  frame.classList.remove("loaded");
});
filters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  filters.querySelector(".active")?.classList.remove("active");
  button.classList.add("active");
  activeFilter = button.dataset.filter;
  render();
});
searchInput.addEventListener("input", () => {
  query = searchInput.value.trim().toLowerCase();
  render();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== searchInput) {
    event.preventDefault();
    searchInput.focus();
  }
});
document.querySelector("#featured").addEventListener("click", () => {
  showPreview("wave-grid");
});
document.querySelector("#header-count").textContent = projects.length;
render();
