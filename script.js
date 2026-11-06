// A simple chapter navigator with browser history, so each step can be revisited.
const CHAPTERS = [...document.querySelectorAll(".chapter")];
const CHAPTER_IDS = CHAPTERS.map((chapter) => chapter.id);
const PASSCODE = "0708";

const progressLabel = document.querySelector("#progress-label");
const progressCount = document.querySelector("#progress-count");
const progressBar = document.querySelector(".progress-track");
const progressFill = document.querySelector(".progress-fill");
const entryGate = document.querySelector("#entry-gate");
const passcodeScreen = document.querySelector("#passcode-screen");
const giftIntro = document.querySelector("#gift-intro");
const passcodeInput = document.querySelector("#passcode-input");
const passcodeError = document.querySelector("#passcode-error");
const whatButton = document.querySelector("#what-button");
const whatReveal = document.querySelector("#what-reveal");
const choiceArea = document.querySelector("#choice-area");
const noButton = document.querySelector("#no-button");
const noMessage = document.querySelector("#no-message");

function goToChapter(id, addHistory = true) {
  const index = CHAPTER_IDS.indexOf(id);
  if (index < 0) return;
  CHAPTERS.forEach((chapter, chapterIndex) => {
    const isCurrent = chapterIndex === index;
    chapter.hidden = !isCurrent;
    chapter.classList.toggle("active", isCurrent);
  });
  const chapter = CHAPTERS[index];
  progressLabel.textContent = chapter.dataset.title;
  progressCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(CHAPTERS.length).padStart(2, "0")}`;
  progressFill.style.width = `${((index + 1) / CHAPTERS.length) * 100}%`;
  progressBar.setAttribute("aria-valuenow", String(index + 1));
  if (addHistory && window.location.hash !== `#${id}`) {
    window.history.pushState({ chapter: id }, "", `#${id}`);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// This client-side passcode is a playful gate, not security for private content.
document.querySelector("#passcode-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (passcodeInput.value === PASSCODE) {
    passcodeScreen.hidden = true;
    giftIntro.hidden = false;
    passcodeError.textContent = "";
    passcodeInput.value = "";
    return;
  }
  passcodeError.textContent = "That isn't quite it, lovely. Try again ♡";
  passcodeInput.value = "";
  passcodeInput.focus();
});

whatButton.addEventListener("click", () => {
  const isOpening = whatReveal.hidden;
  whatReveal.hidden = !isOpening;
  whatButton.setAttribute("aria-expanded", String(isOpening));
  whatButton.textContent = isOpening ? "I want to hear it again ♡" : "What?";
});

noButton.addEventListener("click", () => {
  const area = choiceArea.getBoundingClientRect();
  const button = noButton.getBoundingClientRect();
  const maxLeft = Math.max(0, area.width - button.width);
  const maxTop = Math.max(0, area.height - button.height);
  const yesButton = document.querySelector("#yes-button").getBoundingClientRect();
  const yesCenter = { x: yesButton.left + yesButton.width / 2 - area.left, y: yesButton.top + yesButton.height / 2 - area.top };
  let destination = { left: 0, top: 0 };
  let bestDistance = -1;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = { left: Math.random() * maxLeft, top: Math.random() * maxTop };
    const center = { x: candidate.left + button.width / 2, y: candidate.top + button.height / 2 };
    const distance = Math.hypot(center.x - yesCenter.x, center.y - yesCenter.y);
    if (distance > bestDistance) {
      bestDistance = distance;
      destination = candidate;
    }
  }
  noButton.classList.add("is-escaping");
  noButton.style.left = `${destination.left}px`;
  noButton.style.top = `${destination.top}px`;
  noMessage.textContent = "Hehe, maybe try that again? ♡";
});

document.querySelector("#yes-button").addEventListener("click", () => {
  entryGate.hidden = true;
  document.querySelector("#story").hidden = false;
  document.querySelector(".site-header").hidden = false;
  goToChapter("home");
});

document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => {
    const index = CHAPTER_IDS.indexOf(button.closest(".chapter").id);
    if (index < CHAPTER_IDS.length - 1) goToChapter(CHAPTER_IDS[index + 1]);
  });
});

document.querySelectorAll("[data-prev]").forEach((button) => {
  button.addEventListener("click", () => {
    const index = CHAPTER_IDS.indexOf(button.closest(".chapter").id);
    if (index > 0) goToChapter(CHAPTER_IDS[index - 1]);
  });
});

window.addEventListener("hashchange", () => {
  if (document.querySelector("#story").hidden) return;
  const requestedChapter = window.location.hash.slice(1);
  if (CHAPTER_IDS.includes(requestedChapter)) goToChapter(requestedChapter, false);
});

window.addEventListener("popstate", () => {
  if (document.querySelector("#story").hidden) return;
  const requestedChapter = window.location.hash.slice(1);
  goToChapter(CHAPTER_IDS.includes(requestedChapter) ? requestedChapter : "home", false);
});

const initialChapter = window.location.hash.slice(1);
// Don't open chapter content directly from a copied hash before the gift is unlocked.
CHAPTERS.forEach((chapter) => {
  chapter.hidden = true;
  chapter.classList.remove("active");
});
document.querySelector("#story").hidden = true;
document.querySelector(".site-header").hidden = true;
if (initialChapter && CHAPTER_IDS.includes(initialChapter)) {
  window.history.replaceState({ chapter: "home" }, "", "#home");
}

const surpriseButton = document.querySelector("#surprise-button");
const surpriseMessage = document.querySelector("#surprise-message");
surpriseButton.addEventListener("click", () => {
  const isOpening = surpriseMessage.hidden;
  surpriseMessage.hidden = !isOpening;
  surpriseButton.setAttribute("aria-expanded", String(isOpening));
  surpriseButton.innerHTML = isOpening ? "Close my little note <span>♡</span>" : "Open your last little note <span>♡</span>";
});

document.querySelector("#restart-story").addEventListener("click", () => goToChapter("home"));
