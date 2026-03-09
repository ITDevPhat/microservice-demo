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

  return Array.from(entityMap.values()).map((entity) => {

    // First map standard fields
    let children = entity.fields.map((field) => {
      const isMeasure = field.is_measure || field.RF_IsMeasure === true;
      let iconHtml = '<i class="fa-regular fa-square text-[14px] text-[#605e5c] opacity-80"></i>';
      const dt = (field.datatype || "").toLowerCase();

      if (isMeasure) {
        iconHtml = '<i class="fa-solid fa-calculator text-[14px] text-[#605e5c]"></i>';
      } else if (dt.includes("int") || dt.includes("numeric") || dt.includes("float") || dt.includes("decimal")) {
        iconHtml = '<span class="inline-flex justify-center items-center w-[14px] font-serif italic text-sm font-bold text-[#605e5c]">&Sigma;</span>';
      } else if (dt.includes("date") || dt.includes("time")) {
        iconHtml = '<i class="fa-regular fa-calendar text-[14px] text-[#605e5c]"></i>';
      }

      const tooltip = `${field.display_name}&#10;Datatype: ${field.datatype || 'unknown'}&#10;Entity: ${entity.name}&#10;Measure: ${isMeasure}`;

      return {
        text: `<span class="field-item tooltip-trigger flex items-center gap-4 py-0.5" title="${tooltip}" data-entity="${entity.name}" data-field="${field.key}" data-display="${field.display_name}">${iconHtml} <span class="field-name-text text-sm">${field.display_name}</span></span>`,
        icon: false,
      };
    });

    // Detect numeric fields for implicit measures
    const implicitMeasures = [];
    const preCalculatedMeasures = [];

    // Separate fields into pre-calculated measures vs raw fields for dynamic aggregation
    entity.fields.forEach(field => {
      if (field.is_measure || field.RF_IsMeasure === true) {
        preCalculatedMeasures.push(field);
      }
    });

    const measureIconHtml = '<i class="fa-solid fa-calculator text-[14px] text-[#0078d4]"></i>';
    const gearIconHtml = '<i class="fa-solid fa-gear text-[14px] text-[#252423]"></i>';

    // Build the Nested Metrics Hierarchy (Option 1: Low-level dynamic DAX style)
    const metricNodes = [];
    const aggFunctions = ['SUM', 'MAX', 'MIN', 'COUNT', 'AVG'];

    // Group ALL fields into ALL functions as requested
    aggFunctions.forEach(funcName => {
      const validFieldsNodes = [];

      entity.fields.forEach(field => {
        const pbiTag = `[${funcName} ${entity.name} ${field.display_name}]`;
        validFieldsNodes.push({
          text: `<span class="field-item tooltip-trigger flex items-center gap-2 py-0.5 metric" title="${pbiTag}" data-entity="${entity.name}" data-field="${field.key}" data-display="${field.display_name}" data-function="${funcName}" data-type="metric">${measureIconHtml} <span class="field-name-text text-sm">${field.display_name}</span></span>`,
          icon: false
        });
      });

      if (validFieldsNodes.length > 0) {
        metricNodes.push({
          text: `<span class="flex items-center gap-2 py-0.5" style="transform: translateY(-1px)">${gearIconHtml}<span class="font-medium text-[#252423] text-sm">${funcName}</span></span>`,
          icon: false,
          state: { opened: false },
          children: validFieldsNodes
        });
      }
    });

    // Also include any custom functions that came strictly from the backend
    if (entity.metrics && Object.keys(entity.metrics).length > 0) {
      Object.entries(entity.metrics).forEach(([funcName, funcFields]) => {
        if (!aggFunctions.includes(funcName)) {
          const funcFieldsNodes = funcFields.map(field => {
            const pbiTag = `[${funcName} ${entity.name} ${field.display_name}]`;
            return {
              text: `<span class="field-item tooltip-trigger flex items-center gap-2 py-0.5 metric" title="${pbiTag}" data-entity="${entity.name}" data-field="${field.key}" data-display="${field.display_name}" data-function="${funcName}" data-type="metric">${measureIconHtml} <span class="field-name-text text-sm">${field.display_name}</span></span>`,
              icon: false
            };
          });
          if (funcFieldsNodes.length > 0) {
            metricNodes.push({
              text: `<span class="flex items-center gap-2 py-0.5" style="transform: translateY(-1px)">${gearIconHtml}<span class="font-medium text-[#252423] text-sm">${funcName}</span></span>`,
              icon: false,
              state: { opened: false },
              children: funcFieldsNodes
            });
          }
        }
      });
    }

    // Append Pre-Calculated Measures directly under the Measures folder (Option 2: High-level aggregated views)
    preCalculatedMeasures.forEach(field => {
      const pbiTag = `[${entity.name} ${field.display_name}]`;
      metricNodes.push({
        text: `<span class="field-item tooltip-trigger flex items-center gap-2 py-0.5 metric" title="${pbiTag}" data-entity="${entity.name}" data-field="${field.key}" data-display="${field.display_name}" data-type="metric">${measureIconHtml} <span class="field-name-text text-sm">${field.display_name}</span></span>`,
        icon: false
      });
    });

    if (metricNodes.length > 0) {
      children.push({
        text: `<span class="flex items-center gap-2 py-0.5" style="transform: translateY(-1px)"><i class="fa-solid fa-folder text-[14px] text-[#dcb67a]"></i><span class="font-medium text-[#605e5c] text-sm">Measures</span></span>`,
        icon: false,
        state: { opened: false },
        children: metricNodes
      });
    }

    return {
      text: `<span class="flex items-center gap-2" style="transform: translateY(-1px)"><i class="fa-solid fa-border-all text-[15px] text-[#3b3a39]"></i><span>${entity.name}</span></span>`,
      icon: false,
      state: { opened: true },
      children: children
    };
  });
}

function togglePlaceholder(zone) {
  const placeholder = zone.querySelector(".drop-placeholder");
  if (!placeholder) return;
  placeholder.classList.toggle("hidden", zone.querySelectorAll(".field-tag").length > 0);
}

function makeTag(label, iconHtml, zoneType, isNumeric) {
  const tag = document.createElement("div");
  tag.className = "field-tag group flex items-center justify-between transition-colors";

  const iconSpan = iconHtml ? `<span class="mr-1.5 inline-flex items-center">${iconHtml}</span>` : '';

  let innerContent = `
    <div class="flex items-center min-w-0">
        ${iconSpan}<span class="truncate" title="${label}">${label}</span>
    </div>
  `;

  // Provide dropdown if dropped standard numeric field into columns (as values was removed)
  if (zoneType === 'columns' && isNumeric) {
    innerContent = `
        <div class="flex items-center min-w-0">
            ${iconSpan}
            <select class="text-xs bg-transparent border-none outline-none text-[#0078d4] font-semibold cursor-pointer pr-1">
               <option value="COUNT">COUNT</option>
               <option value="SUM">SUM</option>
               <option value="MAX">MAX</option>
               <option value="MIN">MIN</option>
               <option value="AVG">AVG</option>
            </select>
            <span class="truncate ml-1" title="${label}">${label}</span>
        </div>
     `;
  }

  // Provide Filter builder if dropped into filters
  if (zoneType === 'filters') {
    innerContent = `
        <div class="flex flex-col w-full px-1 py-0.5 space-y-1.5">
            <div class="flex items-center min-w-0 font-medium">
               ${iconSpan}<span class="truncate" title="${label}">${label}</span>
            </div>
            <div class="flex items-center gap-1.5">
               <select class="text-xs border border-slate-300 rounded px-1 py-0.5 outline-none bg-slate-50 text-slate-700 w-16 cursor-pointer">
                  <option>=</option>
                  <option>!=</option>
                  <option>IN</option>
                  <option>LIKE</option>
               </select>
               <input type="text" placeholder="Value..." class="text-xs border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:border-[#0078d4] w-24 flex-1">
            </div>
        </div>
     `;
  }

  tag.innerHTML = `
    ${innerContent}
    <button type="button" class="remove-tag text-slate-400 hover:text-red-500 rounded p-1 focus:outline-none flex items-center justify-center shrink-0 ml-2" aria-label="remove">
      <i class="fa-solid fa-times text-[10px]"></i>
    </button>
  `;

  // Stop drag event when interacting with dropdowns/inputs
  const inputs = tag.querySelectorAll('select, input');
  inputs.forEach(input => {
    input.addEventListener('mousedown', (e) => e.stopPropagation());
  });

  tag.querySelector(".remove-tag").addEventListener("click", () => {
    const zone = tag.closest(".drop-zone");
    tag.remove();
    if (zone) togglePlaceholder(zone);
  });
  return tag;
}

function initDropZones() {
  document.querySelectorAll(".drop-zone").forEach((zone) => {

    // Add drag-over highlights explicitly via native events
    zone.addEventListener("dragenter", (e) => {
      e.preventDefault();
      zone.classList.add("drag-over");
    });
    // dragover must be prevented to allow drops via native API, Sortable uses fallback too
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      // Add it here too just in case dragenter fired too early or missed
      zone.classList.add("drag-over");
    });
    zone.addEventListener("dragleave", (e) => {
      // Only remove if we really left the zone, not entered a child
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove("drag-over");
      }
    });
    zone.addEventListener("drop", () => {
      zone.classList.remove("drag-over");
    });

    Sortable.create(zone, {
      group: { name: "fields", put: true, pull: true },
      animation: 150,
      ghostClass: "drag-ghost",
      chosenClass: "drag-chosen",
      dragClass: "dragging",
      filter: ".drop-placeholder, select, input", // Prevent dragging by inputs
      preventOnFilter: false,
      sort: true, // Allow reordering within the bucket
      onAdd: (evt) => {
        const dropped = evt.item;
        const zone = evt.to;

        let entity, field, display, dataType, func, isNumeric, iconHtml;

        // Determine if dragging moving tag or new field from panel
        if (dropped.classList.contains('field-tag')) {
          entity = dropped.getAttribute('data-entity');
          field = dropped.getAttribute('data-field');
          display = dropped.getAttribute('data-display');
          dataType = dropped.getAttribute('data-type');
          func = dropped.getAttribute('data-function');
          isNumeric = dropped.getAttribute('data-numeric') === 'true';
          const iconEl = dropped.querySelector('i') || dropped.querySelector('span.font-serif');
          iconHtml = iconEl ? iconEl.outerHTML : '';
        } else {
          // It's coming from the JSTree Data Panel
          const fieldItemElement = dropped.querySelector('.field-item') || dropped;
          entity = fieldItemElement.getAttribute('data-entity');
          field = fieldItemElement.getAttribute('data-field');
          display = fieldItemElement.getAttribute('data-display') || field;
          dataType = fieldItemElement.getAttribute('data-type');
          func = fieldItemElement.getAttribute('data-function');
          const fieldSqlType = (fieldItemElement.getAttribute('title') || '').toLowerCase();
          isNumeric = fieldSqlType.includes('int') || fieldSqlType.includes('float') || fieldSqlType.includes('decimal') || fieldSqlType.includes('numeric');
          const iconEl = fieldItemElement.querySelector('i') || fieldItemElement.querySelector('span.font-serif');
          iconHtml = iconEl ? iconEl.outerHTML : '';
        }

        const targetZone = zone.getAttribute('data-zone');
        const accepts = zone.getAttribute('data-accepts') || 'field';

        if (entity && field) {
          const isMetric = dataType === 'metric';

          // Validate Bucket Rules
          if (isMetric && accepts !== 'any' && accepts !== 'metric') {
            alert(`Metrics cannot be placed in ${targetZone.toUpperCase()}. Place metrics in Columns.`);
            dropped.remove();
            togglePlaceholder(zone);
            return;
          }

          if (!isMetric && accepts === 'metric' && !isNumeric) {
            alert(`Only metrics or numeric fields can be placed here.`);
            dropped.remove();
            togglePlaceholder(zone);
            return;
          }

          // Create the new tag
          let newTag;
          if (isMetric) {
            if (func) {
              newTag = makeTag(`${func} ${display.replace(func + ' ', '')}`, iconHtml, targetZone, false);
            } else {
              newTag = makeTag(`${display}`, iconHtml, targetZone, false);
            }
          } else {
            newTag = makeTag(`${entity}.${display}`, iconHtml, targetZone, isNumeric);
          }

          // Bind attributes heavily to allow re-dragging between columns
          newTag.setAttribute('data-entity', entity);
          newTag.setAttribute('data-field', field);
          newTag.setAttribute('data-display', display);
          newTag.setAttribute('data-type', dataType || 'field');
          if (func) newTag.setAttribute('data-function', func);
          newTag.setAttribute('data-numeric', isNumeric ? 'true' : 'false');
          newTag.classList.add('field-tag');

          // Swap the dragged original element with our new rendered Tag box exactly where it belongs
          const parent = dropped.parentNode;
          if (parent) {
            const newIndex = Array.from(parent.children).indexOf(dropped);
            parent.replaceChild(newTag, dropped);
          } else {
            zone.appendChild(newTag);
            dropped.remove();
          }

        } else {
          // Invalid dragged element (maybe an entity folder somehow escaped)
          dropped.remove();
        }

        zone.classList.remove("drag-over");
        togglePlaceholder(zone);
      },
      onSort: () => togglePlaceholder(zone),
      onEnd: () => {
        zone.classList.remove("drag-over");
      }
    });
  });
}

function initTreeDrag() {
  // Wait a tick for jsTree to render nodes
  setTimeout(() => {
    Sortable.create(document.getElementById("schema-tree"), {
      group: { name: "fields", pull: "clone", put: false },
      sort: false,
      draggable: ".jstree-node", // drag the whole node wrapper
      filter: function (evt, target) {
        // Resolve strictly by finding the closest jstree anchor. Prevent folders!
        const li = target.closest('li.jstree-node');
        if (li) {
          return !li.classList.contains('jstree-leaf'); // Block if it's not a leaf
        }
        return false;
      },
      animation: 150,
      ghostClass: "drag-ghost",
      chosenClass: "drag-chosen",
      fallbackOnBody: true,
      swapThreshold: 0.65
    });
  }, 500);
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
        plugins: ["search"],
        search: {
          show_only_matches: true,
          show_only_matches_children: true
        }
      });

    let searchTimeout = false;
    document.getElementById('field-search').addEventListener('keyup', function () {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function () {
        const v = document.getElementById('field-search').value;
        $('#schema-tree').jstree(true).search(v);
      }, 250);
    });

    await loadLookups();
  } catch (error) {
    document.getElementById("schema-tree").innerHTML = `<p class=\"text-sm text-red-600\">${error.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
