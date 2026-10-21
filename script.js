(() => {
"use strict";

const KEY = "unsentMuseumMessages";
const $ = s => document.querySelector(s);

const originals = [
["Love","I still look for you in rooms you've never been in."],
["Regret","I wish I had been kinder when you were trying your best."],
["Goodbye","I practiced saying goodbye until it sounded like I meant it."],
["Longing","Some days I miss you. Other days I miss who I was with you."],
["Unspoken","I had a thousand things to say, and all I said was 'it's fine.'"],
["Love","I hope life is gentle with you, even if I don't get to be there for it."],
["Regret","I waited for the perfect moment until every moment had passed."],
["Goodbye","You can be grateful for a chapter and still close the book."],
["Longing","I wonder if a song ever surprises you with the memory of me."],
["Unspoken","I wasn't asking you to fix anything. I just wanted you to listen."],
["Love","If we had met at a different time, would we have become different people?"],
["Goodbye","This is me letting go, even if a small part of me hopes you turn around."]
].map(([category,message],i)=>({id:`original-${i+1}`,category,message,permanent:true}));

let submissions = load();
let filter = "All";
let selecting = false;
const selected = new Set();

const grid = $("#exhibitGrid");
const toolbar = $("#selectionToolbar");
const dialog = $("#exhibitDialog");

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data.filter(x =>
      x && typeof x.id === "string" &&
      typeof x.message === "string" &&
      typeof x.category === "string" && !x.permanent
    ) : [];
  } catch { return []; }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(submissions));
    return true;
  } catch {
    $("#formStatus").textContent = "Unable to save in this browser.";
    return false;
  }
}

function allItems() {
  return [...originals, ...submissions];
}

function visibleItems() {
  return allItems().filter(x => filter === "All" || x.category === filter);
}

function numberOf(item) {
  if (item.permanent) return Number(item.id.split("-")[1]);
  return 13 + submissions.findIndex(x => x.id === item.id);
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function openItem(item) {
  $("#dialogCategory").textContent = item.category.toUpperCase();
  $("#dialogNumber").textContent = `EXHIBIT NO. ${String(numberOf(item)).padStart(3,"0")}`;
  $("#dialogMessage").textContent = item.message;
  if (dialog.showModal) dialog.showModal();
  else alert(item.message);
}

function render() {
  const items = visibleItems();
  grid.replaceChildren();
  $("#collectionCount").textContent = `${items.length} ${items.length === 1 ? "EXHIBIT" : "EXHIBITS"}`;
  $("#emptyState").hidden = items.length > 0;

  items.forEach((item,i) => {
    const card = el("article","exhibit-card");
    card.dataset.id = item.id;
    card.style.animationDelay = `${Math.min(i*35,350)}ms`;
    if (selected.has(item.id)) card.classList.add("is-selected");

    const top = el("div","card-top");
    top.append(el("span","card-category",item.category),
      el("span","card-number",`NO. ${String(numberOf(item)).padStart(3,"0")}`));

    const message = el("p","card-message",item.message);
    const bottom = el("div","card-bottom");
    bottom.append(el("span","",item.permanent ? "PERMANENT EXHIBIT" : "COMMUNITY SUBMISSION"));

    const actions = el("div","card-actions");
    const read = el("button","card-open","↗");
    read.type = "button";
    read.setAttribute("aria-label","Read exhibit");
    read.addEventListener("click",e => { e.stopPropagation(); openItem(item); });
    actions.append(read);

    if (!item.permanent) {
      const pick = el("button","select-exhibit-btn",selected.has(item.id) ? "Selected ✓" : "Select");
      pick.type = "button";
      pick.setAttribute("aria-pressed",String(selected.has(item.id)));
      pick.addEventListener("click",e => {
        e.stopPropagation();
        selecting = true;
        selected.has(item.id) ? selected.delete(item.id) : selected.add(item.id);
        render();
      });

      const remove = el("button","delete-exhibit","Delete");
      remove.type = "button";
      remove.addEventListener("click",e => {
        e.stopPropagation();
        if (!confirm("Delete this submitted exhibit?")) return;
        submissions = submissions.filter(x => x.id !== item.id);
        selected.delete(item.id);
        save();
        render();
      });
      actions.append(pick,remove);
    }

    bottom.append(actions);
    card.append(top,message,bottom);
    card.addEventListener("click",() => openItem(item));
    grid.append(card);
  });

  toolbar.hidden = !selecting;
  $("#selectionCount").textContent = `${selected.size} selected`;
  $("#deleteSelectedButton").disabled = selected.size === 0;
  $("#nextExhibitNumber").textContent = String(13+submissions.length).padStart(3,"0");
}

$("#filterList").addEventListener("click",e => {
  const button = e.target.closest("[data-filter]");
  if (!button) return;
  filter = button.dataset.filter;
  $("#filterList").querySelectorAll("[data-filter]").forEach(b => {
    b.classList.toggle("active",b === button);
    b.setAttribute("aria-pressed",String(b === button));
  });
  render();
});

$("#randomButton").addEventListener("click",() => {
  const items = visibleItems();
  if (!items.length) return;
  const item = items[Math.floor(Math.random()*items.length)];
  const card = [...grid.children].find(c => c.dataset.id === item.id);
  if (card) card.scrollIntoView({behavior:"smooth",block:"center"});
  openItem(item);
});

$("#selectAllButton").addEventListener("click",() => {
  selecting = true;
  visibleItems().filter(x => !x.permanent).forEach(x => selected.add(x.id));
  render();
});

$("#cancelSelectionButton").addEventListener("click",() => {
  selecting = false;
  selected.clear();
  render();
});

$("#deleteSelectedButton").addEventListener("click",() => {
  const count = submissions.filter(x => selected.has(x.id)).length;
  if (!count || !confirm(`Delete ${count} selected submission(s)? Original exhibits will remain.`)) return;
  submissions = submissions.filter(x => !selected.has(x.id));
  selected.clear();
  selecting = false;
  save();
  render();
});

$("#dialogClose").addEventListener("click",() => dialog.close());
$("#dialogDone").addEventListener("click",() => dialog.close());
dialog.addEventListener("click",e => {
  if (e.target === dialog) dialog.close();
});

$("#messageText").addEventListener("input",e => {
  $("#characterCount").textContent = `${e.target.value.length} / 1000`;
});

$("#messageForm").addEventListener("submit",e => {
  e.preventDefault();
  const message = $("#messageText").value.trim();
  const category = $("#messageCategory").value;
  if (!message) {
    $("#formStatus").textContent = "Write a few words first.";
    return;
  }

  const item = {
    id:`submission-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    category,message,permanent:false
  };
  submissions.push(item);
  if (!save()) {
    submissions.pop();
    return;
  }

  filter = "All";
  $("#filterList").querySelectorAll("[data-filter]").forEach(b => {
    b.classList.toggle("active",b.dataset.filter === "All");
  });
  $("#messageForm").reset();
  $("#characterCount").textContent = "0 / 1000";
  $("#formStatus").textContent = "Your words have found a place here.";
  render();
  $("#collection").scrollIntoView({behavior:"smooth"});
});

render();
})();
