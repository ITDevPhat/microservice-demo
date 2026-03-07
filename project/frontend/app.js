const SECTION_TO_BLOCK_ID = {
  FILTER: "section-filter",
  SCOPE: "section-scope",
  HEADER_FOOTER: "section-header-footer",
  REPORT_BODY: "section-report-body",
};

function showConfiguredSections(sections) {
  sections.forEach((section) => {
    const blockId = SECTION_TO_BLOCK_ID[section.key];
    if (blockId) {
      document.getElementById(blockId)?.classList.remove("hidden");
    }
  });
}

function createLookupOptions(selectEl, label, items) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = `Select ${label}`;
  selectEl.appendChild(placeholder);

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    selectEl.appendChild(option);
  });
}

function buildTreeData(sections) {
  const entityMap = new Map();

  sections.forEach((section) => {
    section.entities.forEach((entity) => {
      if (!entityMap.has(entity.id)) {
        entityMap.set(entity.id, entity);
      }
    });
  });

  return Array.from(entityMap.values()).map((entity) => ({
    text: entity.name,
    state: { opened: false },
    children: entity.fields.map((field) => ({
      text: `<span class=\"field-item\" data-entity=\"${entity.name}\" data-field=\"${field.key}\">${field.display_name}</span>`,
      icon: false,
    })),
  }));
}

function togglePlaceholder(zone) {
  const placeholder = zone.querySelector(".drop-placeholder");
  if (!placeholder) return;
  placeholder.classList.toggle("hidden", zone.querySelectorAll(".field-tag").length > 0);
}

function makeTag(label) {
  const tag = document.createElement("span");
  tag.className = "field-tag";
  tag.innerHTML = `${label}<button type=\"button\" class=\"remove-tag\" aria-label=\"remove\">×</button>`;
  tag.querySelector(".remove-tag").addEventListener("click", () => {
    const zone = tag.closest(".drop-zone");
    tag.remove();
    if (zone) togglePlaceholder(zone);
  });
  return tag;
}

function initDropZones() {
  document.querySelectorAll(".drop-zone").forEach((zone) => {
    Sortable.create(zone, {
      group: { name: "report-builder", put: true },
      animation: 150,
      onAdd: (evt) => {
        const dropped = evt.item;
        if (!dropped.classList.contains("field-tag")) {
          const entity = dropped.dataset.entity;
          const field = dropped.dataset.field;
          dropped.remove();
          if (entity && field) {
            zone.appendChild(makeTag(`[${entity}.${field}]`));
          }
        }
        togglePlaceholder(zone);
      },
      onSort: () => togglePlaceholder(zone),
    });
  });
}

function initTreeDrag() {
  Sortable.create(document.getElementById("schema-tree"), {
    group: { name: "report-builder", pull: "clone", put: false },
    sort: false,
    draggable: ".field-item",
    animation: 150,
    fallbackOnBody: true,
  });
}

async function loadLookups() {
  const [datatypes, sponsors, therapeuticAreas] = await Promise.all([
    fetchDataTypes(),
    fetchSponsors(),
    fetchTherapeuticAreas(),
  ]);

  createLookupOptions(document.getElementById("datatype-select"), "Data Type", datatypes.items || []);
  createLookupOptions(document.getElementById("sponsor-select"), "Sponsor", sponsors.items || []);
  createLookupOptions(document.getElementById("therapeutic-area-select"), "Therapeutic Area", therapeuticAreas.items || []);
}

async function init() {
  initDropZones();

  try {
    const schemaResponse = await fetchSchema();
    const sections = schemaResponse.sections || [];

    showConfiguredSections(sections);

    $("#schema-tree")
      .on("ready.jstree", function () {
        initTreeDrag();
      })
      .jstree({
        core: {
          data: buildTreeData(sections),
          check_callback: true,
        },
      });

    await loadLookups();
  } catch (error) {
    document.getElementById("schema-tree").innerHTML = `<p class=\"text-sm text-red-600\">${error.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
