const exhibits = [
  {
    category: "Almost Said",
    message: "I wonder if you ever typed my name and then deleted it, too."
  },
  {
    category: "Unspoken Love",
    message: "You were my favourite person to tell everything to. Until you weren't."
  },
  {
    category: "Goodbyes",
    message: "I didn't know that was the last time. I would have hugged you longer."
  },
  {
    category: "Apologies",
    message: "I'm sorry I made you feel like asking for the bare minimum was asking for too much."
  },
  {
    category: "What If",
    message: "What if we had met at a time when neither of us was afraid of being loved?"
  },
  {
    category: "Almost Said",
    message: "I had a whole conversation with you in my head. You never even knew."
  },
  {
    category: "Unspoken Love",
    message: "I memorised the little things about you that you probably don't even remember telling me."
  },
  {
    category: "Goodbyes",
    message: "I stopped texting first. Not because I stopped caring, but because I wanted to know if you did."
  },
  {
    category: "Apologies",
    message: "I wish I had been kinder when you were trying your best."
  },
  {
    category: "What If",
    message: "Maybe in another universe, we didn't ruin something that could have been beautiful."
  },
  {
    category: "Almost Said",
    message: "Sometimes I still open our chat. I just don't know what I'm looking for anymore."
  },
  {
    category: "Unspoken Love",
    message: "I think a part of me will always be happy that someone like you existed in my life."
  }
];

const grid = document.getElementById("exhibitGrid");
const filters = document.getElementById("filters");
const randomBtn = document.getElementById("randomBtn");
const emptyState = document.getElementById("emptyState");
const collectionCount = document.getElementById("collectionCount");
const dialog = document.getElementById("exhibitDialog");
const dialogClose = document.getElementById("dialogClose");
const dialogCategory = document.getElementById("dialogCategory");
const dialogNumber = document.getElementById("dialogNumber");
const dialogMessage = document.getElementById("dialogMessage");
const understoodBtn = document.getElementById("understoodBtn");
const form = document.getElementById("messageForm");
const categoryInput = document.getElementById("messageCategory");
const messageInput = document.getElementById("messageText");
const charCount = document.getElementById("charCount");
const formStatus = document.getElementById("formStatus");
const newExhibitNumber = document.getElementById("newExhibitNumber");

let activeCategory = "All";
let currentExhibits = [];
let lastOpenedCard = null;
let selectionMode = false;

const selectedExhibits = new Set();

function loadSubmissions() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("unsentMuseumMessages") || "[]"
    );

    return Array.isArray(saved)
      ? saved.filter(item =>
          item &&
          typeof item.message === "string" &&
          typeof item.category === "string"
        )
      : [];
  } catch {
    return [];
  }
}

function saveSubmissions(messages) {
  try {
    localStorage.setItem(
      "unsentMuseumMessages",
      JSON.stringify(messages)
    );
    return true;
  } catch {
    return false;
  }
}

function getAllExhibits() {
  return [...exhibits, ...loadSubmissions()];
}

function getNumber(index) {
  return String(index + 1).padStart(3, "0");
}

/* BULK SELECTION TOOLBAR */

const toolbar = document.createElement("div");
toolbar.className = "selection-toolbar";

toolbar.innerHTML = `
  <button type="button" class="select-mode-btn">
    Select
  </button>

  <div class="selection-actions" hidden>
    <label class="select-all-label">
      <input type="checkbox" class="select-all-checkbox">
      <span>Select All</span>
    </label>

    <span class="selection-count" aria-live="polite">
      0 selected
    </span>

    <button type="button" class="delete-selected-btn" disabled>
      Delete Selected
    </button>

    <button type="button" class="cancel-selection-btn">
      Cancel
    </button>
  </div>
`;

grid.parentNode.insertBefore(toolbar, grid);

const selectModeBtn = toolbar.querySelector(".select-mode-btn");
const selectionActions = toolbar.querySelector(".selection-actions");
const selectAllCheckbox = toolbar.querySelector(".select-all-checkbox");
const selectionCount = toolbar.querySelector(".selection-count");
const deleteSelectedBtn = toolbar.querySelector(".delete-selected-btn");
const cancelSelectionBtn = toolbar.querySelector(".cancel-selection-btn");

function getVisibleSubmissions() {
  return currentExhibits.filter(exhibit =>
    Boolean(exhibit.createdAt)
  );
}

function updateSelectionToolbar() {
  const allSaved = loadSubmissions();

  const savedIds = new Set(
    allSaved.map(item => item.createdAt).filter(Boolean)
  );

  // Remove selections for confessions that no longer exist.
  for (const id of selectedExhibits) {
    if (!savedIds.has(id)) {
      selectedExhibits.delete(id);
    }
  }

  const visible = getVisibleSubmissions();

  const selectedVisible = visible.filter(exhibit =>
    selectedExhibits.has(exhibit.createdAt)
  );

  selectionCount.textContent =
    `${selectedExhibits.size} selected`;

  selectAllCheckbox.checked =
    visible.length > 0 &&
    selectedVisible.length === visible.length;

  selectAllCheckbox.indeterminate =
    selectedVisible.length > 0 &&
    selectedVisible.length < visible.length;

  selectAllCheckbox.disabled = visible.length === 0;

  deleteSelectedBtn.disabled =
    selectedExhibits.size === 0;

  deleteSelectedBtn.textContent =
    selectedExhibits.size > 0
      ? `Delete Selected (${selectedExhibits.size})`
      : "Delete Selected";
}

selectModeBtn.addEventListener("click", () => {
  selectionMode = true;
  selectModeBtn.hidden = true;
  selectionActions.hidden = false;
  renderExhibits();
});

cancelSelectionBtn.addEventListener("click", () => {
  selectionMode = false;
  selectedExhibits.clear();

  selectModeBtn.hidden = false;
  selectionActions.hidden = true;

  selectAllCheckbox.checked = false;
  selectAllCheckbox.indeterminate = false;

  renderExhibits();
});

selectAllCheckbox.addEventListener("change", () => {
  const visible = getVisibleSubmissions();

  visible.forEach(exhibit => {
    if (selectAllCheckbox.checked) {
      selectedExhibits.add(exhibit.createdAt);
    } else {
      selectedExhibits.delete(exhibit.createdAt);
    }
  });

  renderExhibits();
});

deleteSelectedBtn.addEventListener("click", () => {
  const idsToDelete = new Set(selectedExhibits);

  if (idsToDelete.size === 0) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete ${idsToDelete.size} selected confession(s)? This cannot be undone.`
  );

  if (!confirmed) return;

  const saved = loadSubmissions();

  const remaining = saved.filter(exhibit =>
    !idsToDelete.has(exhibit.createdAt)
  );

  const deletedCount = saved.length - remaining.length;

  if (deletedCount === 0) {
    selectedExhibits.clear();
    renderExhibits();
    return;
  }

  if (!saveSubmissions(remaining)) {
    alert("Unable to delete confessions. Please try again.");
    return;
  }

  selectedExhibits.clear();
  selectionMode = false;

  selectModeBtn.hidden = false;
  selectionActions.hidden = true;

  renderExhibits();

  formStatus.textContent =
    `${deletedCount} confession(s) deleted successfully.`;
});

/* RENDER EXHIBITS */

function renderExhibits() {
  const allExhibits = getAllExhibits();

  currentExhibits = allExhibits
    .map((exhibit, index) => ({
      ...exhibit,
      number: index + 1
    }))
    .filter(exhibit =>
      activeCategory === "All" ||
      exhibit.category === activeCategory
    );

  grid.replaceChildren();

  currentExhibits.forEach((exhibit, index) => {
    const card = document.createElement("article");

    card.className = "exhibit-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    card.setAttribute(
      "aria-label",
      `Open exhibit ${getNumber(exhibit.number - 1)}`
    );

    card.style.animationDelay =
      `${Math.min(index * 45, 350)}ms`;

    const top = document.createElement("div");
    top.className = "card-top";

    const category = document.createElement("span");
    category.className = "card-category";
    category.textContent = exhibit.category;

    const number = document.createElement("span");
    number.className = "card-number";
    number.textContent =
      `NO. ${getNumber(exhibit.number - 1)}`;

    top.append(category, number);

    const message = document.createElement("p");
    message.className = "card-message";
    message.textContent = `“${exhibit.message}”`;

    const bottom = document.createElement("div");
    bottom.className = "card-bottom";

    const note = document.createElement("span");
    note.textContent = "LEFT HERE BY SOMEONE, SOMEWHERE";

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const arrow = document.createElement("span");
    arrow.className = "card-open";
    arrow.textContent = "↗";
    arrow.setAttribute("aria-hidden", "true");

    /*
      Only submitted confessions have createdAt.
      The 12 original exhibits remain protected.
    */

    if (exhibit.createdAt) {
      if (selectionMode) {
        const label = document.createElement("label");
        label.className = "exhibit-select-label";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "exhibit-select-checkbox";

        checkbox.checked =
          selectedExhibits.has(exhibit.createdAt);

        checkbox.setAttribute(
          "aria-label",
          `Select confession ${getNumber(exhibit.number - 1)}`
        );

        checkbox.addEventListener("click", event => {
          event.stopPropagation();
        });

        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectedExhibits.add(exhibit.createdAt);
          } else {
            selectedExhibits.delete(exhibit.createdAt);
          }

          card.classList.toggle(
            "is-selected",
            checkbox.checked
          );

          updateSelectionToolbar();
        });

        label.appendChild(checkbox);
        card.appendChild(label);

        card.classList.toggle(
          "is-selected",
          checkbox.checked
        );
      } else {
        const deleteBtn = document.createElement("button");

        deleteBtn.type = "button";
        deleteBtn.className = "delete-exhibit";
        deleteBtn.textContent = "Delete";

        deleteBtn.setAttribute(
          "aria-label",
          "Delete this confession"
        );

        deleteBtn.addEventListener("click", event => {
          event.stopPropagation();

          const confirmed = window.confirm(
            "Delete this confession from this browser?"
          );

          if (!confirmed) return;

          const saved = loadSubmissions();

          const remaining = saved.filter(item =>
            !(
              item.createdAt === exhibit.createdAt &&
              item.message === exhibit.message &&
              item.category === exhibit.category
            )
          );

          if (saveSubmissions(remaining)) {
            selectedExhibits.delete(exhibit.createdAt);
            renderExhibits();

            formStatus.textContent =
              "Your confession has been deleted.";
          } else {
            alert("Unable to delete this confession.");
          }
        });

        actions.appendChild(deleteBtn);
      }
    }

    actions.appendChild(arrow);
    bottom.append(note, actions);

    // Correct variable name: message.
    card.append(top, message, bottom);

    function openCard() {
      if (selectionMode && exhibit.createdAt) {
        const checkbox =
          card.querySelector(".exhibit-select-checkbox");

        if (checkbox) checkbox.click();
        return;
      }

      openExhibit(exhibit, card);
    }

    card.addEventListener("click", openCard);

    card.addEventListener("keydown", event => {
      if (event.target !== card) return;

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openCard();
      }
    });

    grid.appendChild(card);
  });

  emptyState.hidden = currentExhibits.length !== 0;

  collectionCount.textContent =
    `${currentExhibits.length} OBJECTS IN THE COLLECTION`;

  newExhibitNumber.textContent =
    getNumber(allExhibits.length);

  updateSelectionToolbar();
}

/* EXHIBIT DIALOG */

function openExhibit(exhibit, card) {
  lastOpenedCard = card || null;

  dialogCategory.textContent =
    exhibit.category.toUpperCase();

  dialogNumber.textContent =
    `NO. ${getNumber(exhibit.number - 1)}`;

  dialogMessage.textContent =
    `“${exhibit.message}”`;

  if (!dialog.open) {
    dialog.showModal();
  }
}

function closeDialog() {
  if (dialog.open) {
    dialog.close();
  }
}

dialogClose.addEventListener("click", closeDialog);
understoodBtn.addEventListener("click", closeDialog);

dialog.addEventListener("close", () => {
  if (lastOpenedCard && lastOpenedCard.isConnected) {
    lastOpenedCard.focus();
  }
});

dialog.addEventListener("click", event => {
  if (event.target === dialog) {
    closeDialog();
  }
});

/* CATEGORY FILTERS */

filters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");

  if (!button) return;

  activeCategory = button.dataset.category;

  filters.querySelectorAll(".filter").forEach(filter => {
    const isActive = filter === button;

    filter.classList.toggle("active", isActive);

    filter.setAttribute(
      "aria-pressed",
      String(isActive)
    );
  });

  renderExhibits();
});

/* RANDOM EXHIBIT */

randomBtn.addEventListener("click", () => {
  if (currentExhibits.length === 0) return;

  const randomIndex = Math.floor(
    Math.random() * currentExhibits.length
  );

  openExhibit(
    currentExhibits[randomIndex],
    grid.children[randomIndex]
  );
});

/* CHARACTER COUNTER */

messageInput.addEventListener("input", () => {
  charCount.textContent =
    `${messageInput.value.length} / 500`;
});

/* SUBMIT A CONFESSION */

form.addEventListener("submit", event => {
  event.preventDefault();

  const message = messageInput.value.trim();
  const category = categoryInput.value;

  if (message.length < 5) {
    formStatus.textContent =
      "Give your words a little more room. Write at least 5 characters.";
    return;
  }

  if (message.length > 500) {
    formStatus.textContent =
      "Please keep your exhibit under 500 characters.";
    return;
  }

  const savedMessages = loadSubmissions();

  const newMessage = {
    category,
    message,
    createdAt:
      `${Date.now()}-${Math.random().toString(36).slice(2)}`
  };

  savedMessages.push(newMessage);

  if (!saveSubmissions(savedMessages)) {
    formStatus.textContent =
      "Your browser couldn't save this message. Check your browser storage settings.";
    return;
  }

  activeCategory = "All";
  selectedExhibits.clear();

  filters.querySelectorAll(".filter").forEach(button => {
    const isActive = button.dataset.category === "All";

    button.classList.toggle("active", isActive);

    button.setAttribute(
      "aria-pressed",
      String(isActive)
    );
  });

  renderExhibits();

  form.reset();
  charCount.textContent = "0 / 500";

  formStatus.textContent =
    "Your exhibit has been added to this browser's collection.";

  document.getElementById("museum").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

/* INITIALIZE */

renderExhibits();
