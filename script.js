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
    card.style.animationDelay = `${Math.min(index * 45, 350)}ms`;

    const top = document.createElement("div");
    top.className = "card-top";

    const category = document.createElement("span");
    category.className = "card-category";
    category.textContent = exhibit.category;

    const number = document.createElement("span");
    number.className = "card-number";
    number.textContent = `NO. ${getNumber(exhibit.number - 1)}`;

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

actions.appendChild(arrow);

if (exhibit.createdAt) {
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-exhibit";
  deleteBtn.textContent = "Delete";
  deleteBtn.type = "button";
  deleteBtn.setAttribute("aria-label", "Delete this exhibit");

  deleteBtn.addEventListener("click", event => {
    event.stopPropagation();

    if (!confirm("Delete this exhibit from your browser?")) return;

    const saved = loadSubmissions();
    const index = saved.findIndex(item =>
      item.createdAt === exhibit.createdAt &&
      item.message === exhibit.message &&
      item.category === exhibit.category
    );

    if (index === -1) return;

    saved.splice(index, 1);

    try {
      localStorage.setItem(
        "unsentMuseumMessages",
        JSON.stringify(saved)
      );
      renderExhibits();
    } catch {
      alert("Unable to delete this exhibit.");
    }
  });

  actions.appendChild(deleteBtn);
}

bottom.append(note, actions);
card.append(top, msg, bottom);

    function openCard() {
      openExhibit(exhibit, card);
    }

    card.addEventListener("click", openCard);

    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCard();
      }
    });

    grid.appendChild(card);
  });

  emptyState.hidden = currentExhibits.length !== 0;
  collectionCount.textContent =
    `${currentExhibits.length} OBJECTS IN THE COLLECTION`;

  newExhibitNumber.textContent = getNumber(allExhibits.length);
}

function openExhibit(exhibit, card) {
  lastOpenedCard = card || null;

  dialogCategory.textContent =
    exhibit.category.toUpperCase();

  dialogNumber.textContent =
    `NO. ${getNumber(exhibit.number - 1)}`;

  dialogMessage.textContent = `“${exhibit.message}”`;

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

filters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");

  if (!button) return;

  activeCategory = button.dataset.category;

  filters.querySelectorAll(".filter").forEach(filter => {
    const isActive = filter === button;
    filter.classList.toggle("active", isActive);
    filter.setAttribute("aria-pressed", String(isActive));
  });

  renderExhibits();
});

randomBtn.addEventListener("click", () => {
  if (currentExhibits.length === 0) {
    return;
  }

  const randomIndex = Math.floor(
    Math.random() * currentExhibits.length
  );

  const exhibit = currentExhibits[randomIndex];
  const card = grid.children[randomIndex];

  openExhibit(exhibit, card);
});

messageInput.addEventListener("input", () => {
  charCount.textContent = `${messageInput.value.length} / 500`;
});

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
    createdAt: new Date().toISOString()
  };

  savedMessages.push(newMessage);

  if (!saveSubmissions(savedMessages)) {
    formStatus.textContent =
      "Your browser couldn't save this message. Check your browser storage settings.";
    return;
  }

  activeCategory = "All";

  filters.querySelectorAll(".filter").forEach(button => {
    const isActive = button.dataset.category === "All";
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
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

renderExhibits();
