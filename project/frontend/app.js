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

function flattenEntities(sections) {
  const entityMap = new Map();

  sections.forEach((section) => {
    (section.entities || []).forEach((entity) => {
      if (!entityMap.has(entity.id)) {
        entityMap.set(entity.id, {
          ...entity,
          fields: [...(entity.fields || [])],
        });
        return;
      }

      const existing = entityMap.get(entity.id);
      const seenFieldKeys = new Set(existing.fields.map((field) => field.key));
      (entity.fields || []).forEach((field) => {
        if (!seenFieldKeys.has(field.key)) {
          existing.fields.push(field);
          seenFieldKeys.add(field.key);
        }
      });
    });
  });

  return Array.from(entityMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function buildTreeData(sections) {
  const entities = flattenEntities(sections);

  return entities.map((entity) => ({
    text: entity.name,
    type: "entity",
    state: { opened: false },
    children: entity.fields
      .slice()
      .sort((a, b) => a.display_name.localeCompare(b.display_name))
      .map((field) => ({
        text: `<span class=\"field-item\" data-entity=\"${entity.name}\" data-field=\"${field.key}\" data-display-name=\"${field.display_name}\" data-datatype=\"${field.datatype || "unknown"}\" data-is-measure=\"${field.is_measure ? "1" : "0"}\">${field.display_name}</span>`,
        type: "field",
        icon: "fa-regular fa-square-check text-slate-500",
      })),
  }));
}

function togglePlaceholder(zone) {
  const placeholder = zone.querySelector(".drop-placeholder");
  if (!placeholder) return;
  placeholder.classList.toggle("hidden", zone.querySelectorAll(".field-tag").length > 0);
}

function makeTag(payload) {
  const tag = document.createElement("span");
  tag.className = "field-tag";
  tag.title = `Display: ${payload.displayName}\nDatatype: ${payload.datatype}\nMeasure: ${payload.isMeasure ? "Yes" : "No"}`;
  tag.innerHTML = `[${payload.entity}.${payload.field}]<button type=\"button\" class=\"remove-tag\" aria-label=\"remove\">×</button>`;

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
          const payload = {
            entity: dropped.dataset.entity,
            field: dropped.dataset.field,
            displayName: dropped.dataset.displayName,
            datatype: dropped.dataset.datatype,
            isMeasure: dropped.dataset.isMeasure === "1",
          };

          dropped.remove();

          if (payload.entity && payload.field) {
            zone.appendChild(makeTag(payload));
          }
        }
        togglePlaceholder(zone);
      },
      onSort: () => togglePlaceholder(zone),
    });
  });
}

function initTreeDrag() {
  const treeContainer = document.getElementById("schema-tree");
  Sortable.create(treeContainer, {
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
        plugins: ["types", "wholerow"],
        core: {
          data: buildTreeData(sections),
          check_callback: true,
          themes: { dots: false },
        },
        types: {
          entity: { icon: "fa-solid fa-table-list text-slate-600" },
          field: { icon: "fa-regular fa-square-check text-slate-500" },
        },
      });

    await loadLookups();
  } catch (error) {
    document.getElementById("schema-tree").innerHTML = `<p class=\"text-sm text-red-600\">${error.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
