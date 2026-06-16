// Smash Up Card Selector Logic

// Unregister legacy service workers to bypass old Polymer caches
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister().then(() => {
        console.log('Legacy Service Worker unregistered successfully.');
      });
    }
  });
}

let cardData = { CardGroups: [] };
let selectedDecks = new Set();

// Fun emoji mapping for visual feedback on drawn decks
const emojiMap = {
  // Core
  "pirates": "🏴‍☠️",
  "ninja": "🥷",
  "zombies": "🧟",
  "robots": "🤖",
  "dinosaurs": "🦖",
  "wizards": "🧙",
  "tricksters": "🃏",
  "aliens": "👽",
  // Cthulhu
  "elder things": "👾",
  "innsmouth": "🐟",
  "cthulhu cultists": "🐙",
  "miskatonic university": "🏫",
  // Level 9000
  "bear cavalry": "🐻",
  "ghosts": "👻",
  "killer plants": "🌱",
  "steampunks": "⚙️",
  // SciFi
  "cyborg apes": "🦍",
  "shape shifters": "🎭",
  "super spies": "🕵️",
  "time travelers": "⏳",
  // Monster Smash
  "giant ants": "🐜",
  "mad scientists": "🧪",
  "vampires": "🦇",
  "werewolves": "🐺",
  // Pretty Pretty
  "fairies": "🧚",
  "kitty cats": "🐱",
  "mythic horses": "🦄",
  "princesses": "👑",
  // Munchkin
  "clerics": "🙏",
  "dwarves": "⛏️",
  "elves": "🧝",
  "halflings": "🍞",
  "mages": "🔮",
  "orcs": "👹",
  "thieves": "🗡️",
  "warriors": "🛡️",
  // It's Your Fault
  "dragons": "🐉",
  "mythic greeks": "🏛️",
  "sharks": "🦈",
  "superheroes": "🦸",
  "tornadoes": "🌪️",
  // Cease & Desist
  "star roamers": "🚀",
  "astro knights": "⚔️",
  "changerbots": "🚗",
  "ignobles": "🏰",
  // What Were We Thinking
  "teddybears": "🧸",
  "grandmas": "👵",
  "rock stars": "🎸",
  "explorers": "🤠",
  // Big in Japan
  "itty critters": "🐭",
  "kaiju": "🦖",
  "magical girls": "🌸",
  "mega troopers": "⚡",
  // That '70s
  "disco dancers": "🪩",
  "kung fu fighters": "🥋",
  "truckers": "🚚",
  "vigilantes": "🕶️",
  // Oops
  "ancient egyptians": "🏺",
  "cowboys": "🤠",
  "samurai": "⚔️",
  "vikings": "🪓",
  // World Tour: International Incident
  "luchadors": "🤼",
  "mounties": "🍁",
  "musketeers": "🤺",
  "sumo wrestlers": "🍲",
  // World Tour: Culture Shock
  "anansi tales": "🕷️",
  "ancient incas": "⛰️",
  "grimms' fairy tales": "📖",
  "polynesian voyagers": "🛶",
  "russian fairy tales": "❄️",
  // Marvel
  "avengers": "🅰️",
  "hydra": "🐙",
  "kree": "🛸",
  "masters of evil": "🦹",
  "s.h.i.e.l.d.": "🛡️",
  "sinister six": "🕸️",
  "spider-verse": "🕷️",
  "ultimates": "🌌",
  // Disney
  "aladdin": "🧞",
  "beauty and the beast": "🌹",
  "big hero 6": "⚪",
  "frozen": "❄️",
  "mulan": "🗡️",
  "the lion king": "🦁",
  "the nightmare before christmas": "🎃",
  "wreck-it ralph": "🕹️",
  // 10th Anniversary
  "mermaids": "🧜‍♀️",
  "skeletons": "🦴",
  "world champs": "🏆",
  // Movies
  "action heroes": "💥",
  "backtimers": "🚗",
  "extramorphs": "👽",
  "wraithrustlers": "👻",
  // Promos / Extras
  "geeks": "🤓",
  "geek and sundry": "🤓",
  "all-stars": "⭐️",
  "sheep": "🐑",
  "penguins": "🐧",
  "goblins": "👺",
  "knights of the round table": "🛡️",
  "teens": "🎒",
  "titans": "🪐"
};

function getEmojiForDeck(deckName) {
  const norm = deckName.toLowerCase().trim();
  return emojiMap[norm] || "🃏";
}

// Anti-synergy lists (factions that actively clash or make the game unfun/clunky if paired for a single player)
const antiSynergyPairs = [
  // Ghosts want empty hand; hoarding/drawing factions bloat it or require saving cards
  ["Ghosts", "Wizards"],
  ["Ghosts", "Mega Troopers"],
  ["Ghosts", "Elves"],
  ["Ghosts", "Mages"],
  ["Ghosts", "Kitty Cats"],
  ["Ghosts", "Geeks"],
  ["Ghosts", "Giant Ants"],
  ["Ghosts", "Mad Scientists"],
  
  // Innsmouth wants Locals; copy/deck-manipulation factions get dead value
  ["Innsmouth", "Shape Shifters"],
  ["Innsmouth", "Super Spies"],
  ["Innsmouth", "Teddybears"],
  
  // Steampunks focus heavily on base action attachments; Robots are purely minion swarm, creating hand blocks
  ["Steampunks", "Robots"],
  
  // Ignobles hand over control of minions; Elves rely on keeping value/cooperation setups that clash
  ["Ignobles", "Elves"]
];

function getBadPartners(deckName) {
  const norm = deckName.toLowerCase().trim();
  const partners = new Set();
  antiSynergyPairs.forEach(([d1, d2]) => {
    const nd1 = d1.toLowerCase().trim();
    const nd2 = d2.toLowerCase().trim();
    if (nd1 === norm) partners.add(nd2);
    if (nd2 === norm) partners.add(nd1);
  });
  return partners;
}

function resolveImagePath(path) {
  if (!path) return '';
  const isGitHubPages = window.location.hostname.endsWith('github.io');
  if (isGitHubPages) {
    const repoName = window.location.pathname.split('/')[1];
    if (repoName && !path.startsWith(`/${repoName}`) && !path.startsWith(`${repoName}`)) {
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      return `/${repoName}/${cleanPath}`;
    }
  }
  return path;
}

function getDeckSourceInfo(deckName) {
  if (!cardData || !cardData.CardGroups) return '';
  const group = cardData.CardGroups.find(g => g.Decks.includes(deckName));
  if (!group) return '';
  if (group.Decks.length === 1) {
    return 'Solo Deck';
  }
  return group.GroupTitle;
}

// Fetch cards metadata
async function loadCards() {
  try {
    const response = await fetch('./cards.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch cards: ${response.statusText}`);
    }
    cardData = await response.json();
    
    // Select all by default
    cardData.CardGroups.forEach(group => {
      group.Decks.forEach(deck => selectedDecks.add(deck));
    });

    renderExpansions();
    updateCounts();
  } catch (error) {
    console.error("Error loading Smash Up cards:", error);
    const container = document.getElementById('expansions-container');
    if (container) {
      container.innerHTML = `<div class="alert-error">Failed to load card database. Error: ${error.message}</div>`;
    }
  }
}

// Render expansions checklist
function renderExpansions() {
  const container = document.getElementById('expansions-container');
  if (!container) return;
  container.innerHTML = '';

  cardData.CardGroups.forEach((group, index) => {
    const card = document.createElement('div');
    card.className = 'expansion-card';

    // Cover image
    if (group.Image) {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'expansion-cover-wrapper';
      const img = document.createElement('img');
      img.src = resolveImagePath(group.Image);
      img.alt = `${group.GroupTitle} Box Art`;
      img.className = 'expansion-cover';
      img.referrerPolicy = 'no-referrer';
      imgWrapper.appendChild(img);
      card.appendChild(imgWrapper);
    }

    // Check if group is a solo deck
    const isSolo = group.Decks.length === 1;

    // Header with master checkbox
    const titleBar = document.createElement('div');
    titleBar.className = 'expansion-title-bar';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `expansion-check-${index}`;

    const label = document.createElement('label');
    label.setAttribute('for', checkbox.id);
    label.className = 'expansion-title';
    label.textContent = group.GroupTitle;
    label.style.cursor = 'pointer';

    titleBar.appendChild(checkbox);
    titleBar.appendChild(label);
    card.appendChild(titleBar);

    if (isSolo) {
      const singleDeck = group.Decks[0];
      const isSelected = selectedDecks.has(singleDeck);
      checkbox.checked = isSelected;
      if (isSelected) {
        card.classList.add('selected-card');
      }

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          selectedDecks.add(singleDeck);
          card.classList.add('selected-card');
        } else {
          selectedDecks.delete(singleDeck);
          card.classList.remove('selected-card');
        }
        updateCounts();
      });
      container.appendChild(card);
    } else {
      // Check if all decks in group are selected
      const allDecksSelected = group.Decks.every(deck => selectedDecks.has(deck));
      checkbox.checked = allDecksSelected;
      checkbox.indeterminate = !allDecksSelected && group.Decks.some(deck => selectedDecks.has(deck));

      // List of decks
      const list = document.createElement('div');
      list.className = 'deck-list';

      group.Decks.forEach(deck => {
        const isSelected = selectedDecks.has(deck);
        const item = document.createElement('label');
        item.className = `deck-item ${isSelected ? 'selected' : ''}`;

        const deckCheck = document.createElement('input');
        deckCheck.type = 'checkbox';
        deckCheck.checked = isSelected;
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'deck-name';
        nameSpan.textContent = `${getEmojiForDeck(deck)} ${deck}`;

        item.appendChild(deckCheck);
        item.appendChild(nameSpan);
        list.appendChild(item);

        // Event listener for single deck
        deckCheck.addEventListener('change', () => {
          if (deckCheck.checked) {
            selectedDecks.add(deck);
            item.classList.add('selected');
          } else {
            selectedDecks.delete(deck);
            item.classList.remove('selected');
          }
          
          // Update group master checkbox state
          const updatedAllSelected = group.Decks.every(d => selectedDecks.has(d));
          checkbox.checked = updatedAllSelected;
          checkbox.indeterminate = !updatedAllSelected && group.Decks.some(d => selectedDecks.has(d));
          
          updateCounts();
        });
      });

      card.appendChild(list);
      container.appendChild(card);

      // Event listener for master checkbox
      checkbox.addEventListener('change', () => {
        const checkAll = checkbox.checked;
        checkbox.indeterminate = false;

        const deckItems = list.querySelectorAll('.deck-item');
        group.Decks.forEach((deck, idx) => {
          const item = deckItems[idx];
          const deckCheck = item.querySelector('input[type="checkbox"]');
          deckCheck.checked = checkAll;

          if (checkAll) {
            selectedDecks.add(deck);
            item.classList.add('selected');
          } else {
            selectedDecks.delete(deck);
            item.classList.remove('selected');
          }
        });
        updateCounts();
      });
    }
  });
}

function updateCounts() {
  const activeCountBadge = document.getElementById('active-count');
  if (activeCountBadge) {
    activeCountBadge.textContent = selectedDecks.size;
  }
}

// Randomize assignment to players
function distributeDecks() {
  const playerSelect = document.getElementById('player-select');
  const errorContainer = document.getElementById('error-container');
  const resultsContainer = document.getElementById('results-container');
  const playersSection = document.getElementById('players-section');

  if (!playerSelect || !resultsContainer || !errorContainer || !playersSection) return;

  errorContainer.innerHTML = '';
  resultsContainer.innerHTML = '';
  
  const numPlayers = parseInt(playerSelect.value, 10);
  if (!numPlayers || numPlayers < 2) {
    errorContainer.innerHTML = `<div class="alert-error">Please select the number of players.</div>`;
    return;
  }

  const decksNeeded = numPlayers * 2;
  if (selectedDecks.size < decksNeeded) {
    errorContainer.innerHTML = `
      <div class="alert-error">
        Not enough decks! You have selected ${selectedDecks.size} decks, but need at least ${decksNeeded} decks for ${numPlayers} players.
      </div>`;
    return;
  }

  // Draw process
  const pool = [...selectedDecks];
  const assignments = [];
  const balanceCheck = document.getElementById('balance-check');
  const shouldBalance = balanceCheck ? balanceCheck.checked : true;

  for (let i = 0; i < numPlayers; i++) {
    // Pick first deck randomly
    const idx1 = Math.floor(Math.random() * pool.length);
    const deck1 = pool.splice(idx1, 1)[0];

    // Filter available pool for second deck if balancing is checked
    let availablePool = [...pool];
    if (shouldBalance) {
      const badPartners = getBadPartners(deck1);
      availablePool = availablePool.filter(d => !badPartners.has(d.toLowerCase().trim()));
    }

    // Fallback if no balanced decks remain in pool
    if (availablePool.length === 0) {
      availablePool = [...pool];
    }

    // Pick second deck randomly from available pool
    const idx2 = Math.floor(Math.random() * availablePool.length);
    const deck2 = availablePool[idx2];
    
    // Remove the chosen second deck from main pool
    const poolIdx = pool.indexOf(deck2);
    if (poolIdx > -1) {
      pool.splice(poolIdx, 1);
    }

    assignments.push({
      playerIndex: i + 1,
      deck1,
      deck2
    });
  }

  // Show section
  playersSection.removeAttribute('hidden');

  // Render assignments
  assignments.forEach((assignment, index) => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.style.animationDelay = `${index * 80}ms`;

    card.innerHTML = `
      <div class="player-header">
        <span class="player-name">Player ${assignment.playerIndex}</span>
        <span class="player-badge">Active</span>
      </div>
      <div class="player-decks">
        <div class="deck-badge">
          <span class="deck-badge-icon">${getEmojiForDeck(assignment.deck1)}</span>
          <span class="deck-badge-name">${assignment.deck1}</span>
          <span class="deck-badge-source" style="font-size: 0.725rem; color: var(--text-secondary); margin-top: 0.35rem; font-weight: 600;">${getDeckSourceInfo(assignment.deck1)}</span>
        </div>
        <div class="deck-badge">
          <span class="deck-badge-icon">${getEmojiForDeck(assignment.deck2)}</span>
          <span class="deck-badge-name">${assignment.deck2}</span>
          <span class="deck-badge-source" style="font-size: 0.725rem; color: var(--text-secondary); margin-top: 0.35rem; font-weight: 600;">${getDeckSourceInfo(assignment.deck2)}</span>
        </div>
      </div>
    `;

    resultsContainer.appendChild(card);
  });

  // Smooth scroll to results
  playersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Bind interactive events
document.addEventListener('DOMContentLoaded', () => {
  loadCards();

  const pickBtn = document.getElementById('pick-btn');
  if (pickBtn) {
    pickBtn.addEventListener('click', distributeDecks);
  }
});
