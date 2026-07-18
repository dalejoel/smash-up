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
  "titans": "🪐",
  "slashers": "🔪",
  "clowns": "🤡"
};

function getEmojiForDeck(deckName) {
  const norm = deckName.toLowerCase().trim();
  return emojiMap[norm] || "🃏";
}

const customDeckIcons = {
  "Geeks": "images/covers/geeks.png",
  "All-Stars": "images/covers/all-stars.png",
  "Sheep": "images/covers/sheep.png",
  "Penguins": "images/covers/penguins.png",
  "Goblins": "images/covers/goblins.png",
  "Knights of the Round Table": "images/covers/knightsoftheroundtable.png",
  "Mermaids": "images/covers/mermaids.png",
  "Skeletons": "images/covers/skeletons.png",
  "World Champs": "images/covers/worldchamps.png",
  "Teens": "images/covers/teens.png",
  "Slashers": "images/covers/slashers.png",
  "Clowns": "images/covers/clowns.png",
  
  // Cropped covers from divider photos
  "Teddybears": "images/covers/teddybears.png",
  "Dragons": "images/covers/dragons.png",
  "Princesses": "images/covers/princesses.png",
  "Mythic Greeks": "images/covers/mythicgreeks.png",
  "Itty Critters": "images/covers/ittycritters.png",
  "Mega Troopers": "images/covers/megatroopers.png",
  "Tricksters": "images/covers/tricksters.png",
  "Rock Stars": "images/covers/rockstars.png",
  "Ancient Egyptians": "images/covers/ancientegyptians.png",
  "Samurai": "images/covers/samurai.png",
  "Mad Scientists": "images/covers/madscientists.png",
  "Magical Girls": "images/covers/magicalgirls.png",
  "Innsmouth": "images/covers/innsmouth.png",
  "Time Travelers": "images/covers/timetravelers.png",
  "Ninja": "images/covers/ninja.png",
  "Cyborg Apes": "images/covers/cyborgapes.png",
  "Dinosaurs": "images/covers/dinosaurs.png",
  "Mythic Horses": "images/covers/mythichorses.png",
  "Kung Fu Fighters": "images/covers/kungfufighters.png",
  "Vigilantes": "images/covers/vigilantes.png",
  "Cowboys": "images/covers/cowboys.png",
  "Kaiju": "images/covers/kaiju.png",
  "Super Spies": "images/covers/superspies.png",
  "Shape Shifters": "images/covers/shapeshifters.png",
  "Miskatonic University": "images/covers/miskatonicuniversity.png",
  "Ghosts": "images/covers/ghosts.png",
  "Elder Things": "images/covers/elderthings.png",
  "Killer Plants": "images/covers/killerplants.png",
  "Cthulhu Cultists": "images/covers/cthulhucultists.png",
  "Steampunks": "images/covers/steampunks.png",
  "Changerbots": "images/covers/changerbots.png",
  "Star Roamers": "images/covers/starroamers.png",
  "Astro Knights": "images/covers/astroknights.png",
  "Superheroes": "images/covers/superheroes.png",
  "Sharks": "images/covers/sharks.png",
  "Kitty Cats": "images/covers/kittycats.png",
  "Giant Ants": "images/covers/giantants.png",
  "Ignobles": "images/covers/ignobles.png",
  "Bear Cavalry": "images/covers/bearcavalry.png",
  "Tornadoes": "images/covers/tornadoes.png",
  "Wizards": "images/covers/wizards.png",
  "Aliens": "images/covers/aliens.png",
  "Robots": "images/covers/robots.png",
  "Zombies": "images/covers/zombies.png",
  "Vikings": "images/covers/vikings.png",
  "Disco Dancers": "images/covers/discodancers.png",
  "Truckers": "images/covers/truckers.png",
  "Pirates": "images/covers/pirates.png",
  "Explorers": "images/covers/explorers.png",
  "Grandmas": "images/covers/grandmas.png",
  "Vampires": "images/covers/vampires.png",
  "Werewolves": "images/covers/werewolves.png",
  "Fairies": "images/covers/fairies.png",
  "Action Heroes": "images/covers/actionheroes.png",
  "Backtimers": "images/covers/backtimers.png",
  "Extramorphs": "images/covers/extramorphs.png",
  "Wraithrustlers": "images/covers/wraithrustlers.png",
  
  // Unowned decks official covers
  "Clerics": "images/covers/clerics.png",
  "Dwarves": "images/covers/dwarves.png",
  "Elves": "images/covers/elves.png",
  "Halflings": "images/covers/halflings.png",
  "Mages": "images/covers/mages.png",
  "Orcs": "images/covers/orcs.png",
  "Thieves": "images/covers/thieves.png",
  "Warriors": "images/covers/warriors.png",
  "Luchadors": "images/covers/luchadors.png",
  "Mounties": "images/covers/mounties.png",
  "Musketeers": "images/covers/musketeers.png",
  "Sumo Wrestlers": "images/covers/sumowrestlers.png",
  "Anansi Tales": "images/covers/anansitales.png",
  "Ancient Incas": "images/covers/ancientincas.png",
  "Grimms' Fairy Tales": "images/covers/grimmsfairytales.png",
  "Polynesian Voyagers": "images/covers/polynesianvoyagers.png",
  "Russian Fairy Tales": "images/covers/russianfairytales.png",
  "Adolescent Epic Geckos": "images/covers/adolescentepicgeckos.png",
  "G.I. Gerald": "images/covers/gigerald.png",
  "Pearl and the Images": "images/covers/pearlandtheimages.png",
  "Rulers of the Cosmos": "images/covers/rulersofthecosmos.png",

  // Marvel official covers
  "Avengers": "images/covers/avengers.jpg",
  "Hydra": "images/covers/hydra.png",
  "Kree": "images/covers/kree.jpg",
  "Masters of Evil": "images/covers/mastersofevil.jpg",
  "S.H.I.E.L.D.": "images/covers/shield.jpg",
  "Sinister Six": "images/covers/sinistersix.jpg",
  "Spider-Verse": "images/covers/spiderverse.jpg",
  "Ultimates": "images/covers/ultimates.jpg",

  // Disney official covers
  "Aladdin": "images/covers/aladdin.jpg",
  "Beauty and the Beast": "images/covers/beautyandthebeast.png",
  "Big Hero 6": "images/covers/bighero6.png",
  "Frozen": "images/covers/frozen.png",
  "Mulan": "images/covers/mulan.jpg",
  "The Lion King": "images/covers/thelionking.png",
  "The Nightmare Before Christmas": "images/covers/thenightmarebeforechristmas.jpg",
  "Wreck-It Ralph": "images/covers/wreckitralph.png"
};

const titanMap = {
  "Bear Cavalry": "Major Ursa",
  "Changerbots": "Mergacon",
  "Explorers": "Very Large Boulder",
  "Fairies": "Spirit of the Forest",
  "Ghosts": "Creampuff Man",
  "Giant Ants": "Death on Six Legs",
  "Ignobles": "The Hill that Strolls",
  "Innsmouth": "Dagon",
  "Cthulhu Cultists": "Cthulhu",
  "Pirates": "The Kraken",
  "Super Spies": "Moon Zero Three",
  "Time Travelers": "Time Box",
  "Tricksters": "Big Funny Giant",
  "Vampires": "Ancient Lord",
  "Werewolves": "Great Wolf Spirit",
  "Wizards": "Arcane Protector",
  "Itty Critters": "Rainboroc",
  "Kaiju": "Gorgodzolla",
  "Magical Girls": "Walking Castle",
  "Mega Troopers": "Megabot",
  "Penguins": "Emperor Penguin",
  "Ancient Egyptians": "Sphinx",
  "Cowboys": "Pecos Bill",
  "Dinosaurs": "Fort Titanosaurus",
  "Grandmas": "Great Grandma",
  "Killer Plants": "Killer Kudzu",
  "Kung Fu Fighters": "Sifu",
  "Mad Scientists": "The Bride",
  "Ninja": "Invisible Ninja",
  "Sharks": "Helicoprion",
  "Superheroes": "The Everything Glove",
  "Tornadoes": "Category 5",
};

const revisedFactions = [
  "Bear Cavalry", "Elder Things", "Giant Ants", "Miskatonic University", 
  "Vampires", "Vigilantes", "Tricksters", "Mega Troopers", "Penguins", "Super Spies"
];

const factionTags = {
  // Core
  "Pirates": ["movement"],
  "Ninja": ["disruption"],
  "Zombies": ["discardControl"],
  "Robots": ["extraPlays", "swarm"],
  "Dinosaurs": ["highPower"],
  "Wizards": ["extraPlays", "cardDraw"],
  "Tricksters": ["disruption"],
  "Aliens": ["disruption"],
  // Cthulhu
  "Elder Things": ["disruption"],
  "Innsmouth": ["swarm"],
  "Cthulhu Cultists": ["disruption"],
  "Miskatonic University": ["cardDraw"],
  // Level 9000
  "Bear Cavalry": ["movement", "disruption"],
  "Ghosts": ["handSize"],
  "Killer Plants": ["deckManipulation"],
  "Steampunks": ["actions"],
  // SciFi
  "Cyborg Apes": ["actions"],
  "Shape Shifters": ["copying"],
  "Super Spies": ["deckManipulation"],
  "Time Travelers": ["versatile"],
  // Monster Smash
  "Giant Ants": ["counters"],
  "Mad Scientists": ["counters"],
  "Vampires": ["counters", "disruption"],
  "Werewolves": ["highPower"],
  // Pretty Pretty
  "Fairies": ["versatile"],
  "Kitty Cats": ["control"],
  "Mythic Horses": ["swarm"],
  "Princesses": ["highPower"],
  // Munchkin
  "Clerics": ["discardControl"],
  "Dwarves": ["actions"],
  "Elves": ["sharing"],
  "Halflings": ["extraPlays", "swarm"],
  "Mages": ["actions"],
  "Orcs": ["combat"],
  "Thieves": ["sharing"],
  "Warriors": ["combat"],
  // It's Your Fault
  "Dragons": ["baseControl"],
  "Mythic Greeks": ["actions"],
  "Sharks": ["disruption"],
  "Superheroes": ["deckManipulation"],
  "Tornadoes": ["movement"],
  // Cease & Desist
  "Star Roamers": ["movement"],
  "Astro Knights": ["actions"],
  "Changerbots": ["versatile"],
  "Ignobles": ["control"],
  // What Were We Thinking
  "Teddybears": ["versatile"],
  "Grandmas": ["deckManipulation"],
  "Rock Stars": ["swarm"],
  "Explorers": ["movement"],
  // Big in Japan
  "Itty Critters": ["swarm"],
  "Kaiju": ["actions"],
  "Magical Girls": ["counters"],
  "Mega Troopers": ["handSize"],
  // That '70s
  "Disco Dancers": ["copying"],
  "Kung Fu Fighters": ["counters"],
  "Truckers": ["actions", "movement"],
  "Vigilantes": ["counters"],
  // Oops
  "Ancient Egyptians": ["burying"],
  "Cowboys": ["combat"],
  "Samurai": ["counters"],
  "Vikings": ["deckManipulation"],
  // World Tour 1
  "Luchadors": ["disruption"],
  "Mounties": ["movement"],
  "Musketeers": ["actions"],
  "Sumo Wrestlers": ["movement"],
  // World Tour 2
  "Anansi Tales": ["sharing"],
  "Ancient Incas": ["actions"],
  "Grimms' Fairy Tales": ["disruption"],
  "Polynesian Voyagers": ["movement"],
  "Russian Fairy Tales": ["copying"],
  // Marvel
  "Avengers": ["swarm"],
  "Hydra": ["swarm"],
  "Kree": ["actions"],
  "Masters of Evil": ["versatile"],
  "S.H.I.E.L.D.": ["swarm"],
  "Sinister Six": ["baseControl"],
  "Spider-Verse": ["movement"],
  "Ultimates": ["highPower"],
  // Disney
  "Aladdin": ["sharing"],
  "Beauty and the Beast": ["swarm"],
  "Big Hero 6": ["actions"],
  "Frozen": ["disruption"],
  "Mulan": ["counters"],
  "The Lion King": ["discardControl"],
  "The Nightmare Before Christmas": ["sharing"],
  "Wreck-It Ralph": ["baseControl"],
  // 10th Anniversary
  "Mermaids": ["movement"],
  "Skeletons": ["discardControl"],
  "World Champs": ["versatile"],
  // Movies
  "Action Heroes": ["actions"],
  "Backtimers": ["burying"],
  "Extramorphs": ["disruption"],
  "Wraithrustlers": ["control"],
  // Promos
  "Geeks": ["disruption"],
  "All-Stars": ["versatile"],
  "Goblins": ["versatile"],
  "Penguins": ["extraPlays", "swarm"],
  "Knights of the Round Table": ["versatile"],
  "Teens": ["versatile"],
  "Sheep": ["movement"],
  "Slashers": ["disruption"],
  "Clowns": ["disruption"],
  // Half the Battle
  "Adolescent Epic Geckos": ["movement"],
  "G.I. Gerald": ["versatile"],
  "Pearl and the Images": ["swarm"],
  "Rulers of the Cosmos": ["versatile"]
};

function evaluateSynergy(factionA, factionB, isRevampedA = false, isRevampedB = false) {
  if (!factionA || !factionB) return null;
  
  const pair = [factionA, factionB].sort();
  const key = pair.join(' / ');
  
  const overrides = {
    "Robots / Zombies": {
      tier: "s",
      ratingName: "God-Tier Combo",
      text: "Zombies can retrieve minions from the discard pile, allowing the Robots swarm to play extra low-power minions repeatedly. This combination is a classic powerhouse."
    },
    "Killer Plants / Zombies": {
      tier: "s",
      ratingName: "God-Tier Combo",
      text: "Killer Plants search your deck to pull out key minions, while Zombies retrieve them from the grave once they score or are destroyed. This creates an unbreakable, highly consistent minion engine."
    },
    "Ghosts / Wizards": {
      tier: "anti",
      ratingName: "Anti-Synergy",
      text: "Ghosts require keeping a very small (or empty) hand size to trigger their power spikes, whereas Wizards cycle cards rapidly and force you to draw extra cards, making it very difficult to empty your hand."
    },
    "Geeks / Ghosts": {
      tier: "anti",
      ratingName: "Anti-Synergy",
      text: "Geeks focus on holding a hand full of disruptive, reactive action cards to counter opponents, which directly conflicts with the Ghosts mechanic of emptying your hand."
    }
  };
  
  if (overrides[key]) {
    return overrides[key];
  }
  
  const tagsA = factionTags[factionA] || [];
  const tagsB = factionTags[factionB] || [];
  
  let score = 0;
  let reasons = [];
  
  const extraPlaysA = tagsA.includes("extraPlays");
  const extraPlaysB = tagsB.includes("extraPlays");
  const countersA = tagsA.includes("counters");
  const countersB = tagsB.includes("counters");
  const swarmA = tagsA.includes("swarm");
  const swarmB = tagsB.includes("swarm");
  const discardControlA = tagsA.includes("discardControl");
  const discardControlB = tagsB.includes("discardControl");
  const movementA = tagsA.includes("movement");
  const movementB = tagsB.includes("movement");
  const actionsA = tagsA.includes("actions");
  const actionsB = tagsB.includes("actions");
  
  if ((extraPlaysA && countersB) || (extraPlaysB && countersA)) {
    score += 3;
    reasons.push("Attacking with extra minion plays allows placing and distributing power counters rapidly.");
  }
  
  if ((discardControlA && (swarmB || extraPlaysB)) || (discardControlB && (swarmA || extraPlaysA))) {
    score += 3;
    reasons.push("Discard pile retrieval feeds the swarm/extra plays engine, allowing you to replay minions repeatedly.");
  }
  
  if (countersA && countersB) {
    score += 2;
    reasons.push("Both factions focus on +1 power counters, letting you stack massive minion threats.");
  }
  
  if (movementA && movementB) {
    score += 2;
    reasons.push("High mobility from both factions allows shifting minion presence to steal bases right before they score.");
  }
  
  if (actionsA && actionsB) {
    score += 1;
    reasons.push("Both factions rely heavily on action card attachments and combos.");
  }
  
  if (tagsA.includes("versatile") || tagsB.includes("versatile")) {
    score += 1;
  }
  
  // Specific Revamped vs Normal Faction adjustments
  const checkRevampedAdjustment = (name, isRevamped) => {
    if (name === "Vampires") {
      if (isRevamped) {
        score += 1;
        reasons.push("Vampires (Revamped) features fast counter placement and self-destruction synergy.");
      } else {
        score -= 2;
        reasons.push("Vampires (Normal) has slow counter generation and relies on destroying opposing minions, making it clunky to set up.");
      }
    }
    if (name === "Giant Ants") {
      if (isRevamped) {
        score += 1;
        reasons.push("Giant Ants (Revamped) can move counters much more fluidly.");
      } else {
        score -= 1;
        reasons.push("Giant Ants (Normal) is limited by slow counter transfer speeds.");
      }
    }
    if (name === "Bear Cavalry") {
      if (isRevamped) {
        score += 1;
        reasons.push("Bear Cavalry (Revamped) has much stronger base placement and movement destruction synergy.");
      }
    }
  };

  checkRevampedAdjustment(factionA, isRevampedA);
  checkRevampedAdjustment(factionB, isRevampedB);
  
  const isAntiSynergy = isPairAntiSynergistic(factionA, isRevampedA, factionB, isRevampedB) || score < 0;
  
  let isSubOptimal = false;
  
  if ((factionA === "Vampires" && isRevampedA && factionB === "Steampunks") || (factionB === "Vampires" && isRevampedB && factionA === "Steampunks")) {
    isSubOptimal = true;
    reasons.push("Vampires (Revamped) focuses on minion self-destruction and power counters, which conflicts with Steampunks' slow base action attachment strategy, leaving both engines running independently.");
  }

  if ((factionA === "Tricksters" && isRevampedA && factionB === "Robots") || (factionB === "Tricksters" && isRevampedB && factionA === "Robots")) {
    isSubOptimal = true;
    reasons.push("Tricksters (Revamped) focuses on base-cluttering disruption and slowing down opponents, which slows down the rapid base-racing speed of Robots.");
  }

  if ((factionA === "Super Spies" && isRevampedA && factionB === "Dinosaurs") || (factionB === "Super Spies" && isRevampedB && factionA === "Dinosaurs")) {
    isSubOptimal = true;
    reasons.push("Super Spies (Revamped) manipulates cards and decks, lacking the explosive power or counter synergy to support Dinosaurs' brute-force minions.");
  }

  if ((factionA === "Giant Ants" && isRevampedA && factionB === "Ignobles") || (factionB === "Giant Ants" && isRevampedB && factionA === "Ignobles")) {
    isSubOptimal = true;
    reasons.push("Giant Ants (Revamped) needs to stack power counters on its own minions. Ignobles constantly give away control of their minions, which would hand over your hard-earned power counters to the opponent.");
  }

  if ((factionA === "Bear Cavalry" && isRevampedA && factionB === "Ninja") || (factionB === "Bear Cavalry" && isRevampedB && factionA === "Ninja")) {
    isSubOptimal = true;
    reasons.push("Bear Cavalry (Revamped) moves minions and forces bases to trigger early, which disrupts the Ninjas' strategy of keeping cards hidden in hand for surprise base-scoring bursts.");
  }

  let tier = "c";
  let ratingName = "Standard / Fair";
  
  if (isAntiSynergy) {
    tier = "anti";
    ratingName = "Anti-Synergy";
    if (reasons.length === 0) {
      reasons.push("These factions have clashing playstyles, slow pacing, or opposing mechanics that make them clunky or anti-synergistic when played together.");
    }
  } else if (isSubOptimal) {
    tier = "d";
    ratingName = "Sub-Optimal / Weak";
  } else if (score >= 4) {
    tier = "a";
    ratingName = "Strong Synergy";
  } else if (score >= 2) {
    tier = "b";
    ratingName = "Good / Stable";
  } else {
    tier = "c";
    ratingName = "Standard / Fair";
  }
  
  let text = "";
  if (reasons.length > 0) {
    text = reasons.join(" ");
  } else {
    text = `This combination is standard and workable. Both factions can work together without conflicting mechanics, though they don't have direct special mechanical synergies.`;
  }
  
  return { tier, ratingName, text };
}

function getDeckIconHtml(deckName, locationClass = "deck-icon-img", enableClick = true) {
  const norm = deckName.trim();
  const customImg = customDeckIcons[norm];
  if (customImg) {
    const resolved = resolveImagePath(customImg);
    const clickAttr = enableClick ? `onclick="event.stopPropagation(); event.preventDefault(); openDeckArtModal('${norm.replace(/'/g, "\\'")}')"` : '';
    return `<img src="${resolved}" alt="${deckName} Icon" class="${locationClass}" ${clickAttr} referrerPolicy="no-referrer" />`;
  }
  return `<span class="deck-icon-emoji">${getEmojiForDeck(deckName)}</span>`;
}

function openDeckArtModal(deckName) {
  const customImg = customDeckIcons[deckName];
  if (!customImg) return;
  openExpansionModal({
    GroupTitle: deckName,
    Decks: [deckName],
    Image: customImg
  });
}

window.openDeckArtModal = openDeckArtModal;

// Anti-synergy checker taking revamped versions into account
function isPairAntiSynergistic(factionA, isRevampedA, factionB, isRevampedB) {
  const normA = factionA.trim();
  const normB = factionB.trim();
  
  // Standard clashing lists for Ghosts
  const ghostsClashList = ["Wizards", "Elves", "Mages", "Kitty Cats", "Geeks", "Mad Scientists"];
  if ((normA === "Ghosts" && ghostsClashList.includes(normB)) || (normB === "Ghosts" && ghostsClashList.includes(normA))) {
    return true;
  }
  
  // Ghosts + Mega Troopers: Mega Troopers Normal draws too many cards and clashes with Ghosts.
  // Mega Troopers Revamped is focused on power counters and action plays, resolving this hand bloat.
  if ((normA === "Ghosts" && normB === "Mega Troopers" && !isRevampedB) || (normB === "Ghosts" && normA === "Mega Troopers" && !isRevampedA)) {
    return true;
  }

  // Ghosts + Giant Ants: Giant Ants Normal clutters hand. Giant Ants Revamped is fine.
  if ((normA === "Ghosts" && normB === "Giant Ants" && !isRevampedB) || (normB === "Ghosts" && normA === "Giant Ants" && !isRevampedA)) {
    return true;
  }

  // Innsmouth clashes
  const innsmouthClashList = ["Shape Shifters", "Teddybears"];
  if ((normA === "Innsmouth" && innsmouthClashList.includes(normB)) || (normB === "Innsmouth" && innsmouthClashList.includes(normA))) {
    return true;
  }
  
  // Innsmouth + Super Spies: Normal Super Spies relies on deck manipulation that clashes with Innsmouth's rapid search of same name.
  if ((normA === "Innsmouth" && normB === "Super Spies" && !isRevampedB) || (normB === "Innsmouth" && normA === "Super Spies" && !isRevampedA)) {
    return true;
  }

  // Steampunks + Robots
  if ((normA === "Steampunks" && normB === "Robots") || (normB === "Steampunks" && normA === "Robots")) {
    return true;
  }

  // Ignobles + Elves
  if ((normA === "Ignobles" && normB === "Elves") || (normB === "Ignobles" && normA === "Elves")) {
    return true;
  }
  
  // Vampires (Normal) is too slow and clunky for fast tempo/swarm factions
  const normalVampiresClashes = ["Robots", "Mythic Horses", "Zombies", "Halflings"];
  if ((normA === "Vampires" && !isRevampedA && normalVampiresClashes.includes(normB)) || (normB === "Vampires" && !isRevampedB && normalVampiresClashes.includes(normA))) {
    return true;
  }

  return false;
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
  return group.GroupTitle;
}

const deckDescriptions = {
  // Core
  "Pirates": "Specializes in moving minions around the board to optimize scoring and destroying opposing small minions.",
  "Ninja": "Focuses on espionage, hand destruction, and playing cards from hand right before a base scores to steal the victory.",
  "Zombies": "Summons minions back from the grave (discard pile) repeatedly, overwhelming bases with relentless dead.",
  "Robots": "Swarms the board with low-power minions that buff each other, scoring bases rapidly in a single turn.",
  "Dinosaurs": "Overpowers your opponents with raw strength, massive minions, and power-boosting cards.",
  "Wizards": "Cycles through the deck rapidly by drawing cards and gaining extra actions to execute massive card plays.",
  "Tricksters": "Disrupts opponents by forcing discards, destroying cards, and placing hazards/traps on bases.",
  "Aliens": "Controls the field by bouncing minions back to players' hands and gains Victory Points directly.",
  // Cthulhu
  "Elder Things": "Forces opponents to take useless 'Madness' cards that clutter their hands and subtract from their final score.",
  "Innsmouth": "Summons a wave of 'The Locals' minions that call more copies of themselves from the deck.",
  "Cthulhu Cultists": "Uses Madness cards as a resource to accelerate power, sacrificing own minions for great rewards.",
  "Miskatonic University": "Gains and plays Madness cards, then studies them to draw cards or gain power before discarding them.",
  // Level 9000
  "Bear Cavalry": "Moves opponents' minions out of the way, destroying them when they enter bases guarded by your armored bears.",
  "Ghosts": "Rely on having a small hand or empty hand to unlock powerful effects and massive power spikes.",
  "Killer Plants": "Grows slowly and steadily over time, searching the deck for key minions and locking down bases.",
  "Steampunks": "Attaches powerful machinery to bases to boost power, draw cards, and destroy opponent cards.",
  // SciFi
  "Cyborg Apes": "Attaches action cards to minions to grant them permanent power boosts and special abilities.",
  "Shape Shifters": "Copies other minions' attributes, swaps minions on the field, and adapts to any opponent strategy.",
  "Super Spies": "Looks at and manipulates the top cards of the deck to control the flow of card draws.",
  "Time Travelers": "Returns cards from the field or discard pile back to the hand to replay them again and again.",
  // Monster Smash
  "Giant Ants": "Distributes and moves +1 power counters among your minions to build massive threats.",
  "Mad Scientists": "Experiments with +1 power counters, consuming them for powerful bonuses and extra plays.",
  "Vampires": "Destroys opposing minions to gain power counters, growing stronger by feeding on your enemies.",
  "Werewolves": "Relies on bursts of strength that trigger depending on the timing of your turns and base conditions.",
  // Pretty Pretty
  "Fairies": "Offers choices to opponents, gains extra actions, and chooses from multiple versatile card options.",
  "Kitty Cats": "Controls and charms opposing minions, forcing them to work for you before sacrificing them.",
  "Mythic Horses": "Gains power when your minions are grouped together, riding together to overwhelm bases.",
  "Princesses": "A few highly powerful, individual cards that dominate the field with grace and royalty.",
  // Munchkin
  "Clerics": "Prevents cards from entering the discard pile, heals your minions, and bypasses monster threats.",
  "Dwarves": "Hoards treasure cards and gains massive benefits from having lots of items.",
  "Elves": "Shares benefits with opponents to gain even larger bonuses for yourself.",
  "Halflings": "Relentless swarm tactics, playing extra minions and taking advantage of quick feet.",
  "Mages": "Casts powerful spells, discards cards for spell fuel, and manipulates base cards.",
  "Orcs": "Thrives on combat, gaining extra power when opposing minions are on the same base.",
  "Thieves": "Steals treasure cards and manipulates loot resources to your advantage.",
  "Warriors": "Focuses on defeating monsters on bases to claim treasures and glory.",
  // It's Your Fault
  "Dragons": "Dominates bases, reducing opponent minion power and locking down scoring conditions.",
  "Mythic Greeks": "Plays action cards to trigger chain reactions that boost your minions' power.",
  "Sharks": "Feeds on smaller minions, gaining power and moving quickly between bases when blood is in the water.",
  "Superheroes": "Searches the deck for power-5 minions and uses them to protect weaker cards.",
  "Tornadoes": "Moves minions and actions freely around the board to disrupt scoring and steal positions.",
  // Cease & Desist
  "Star Roamers": "Protects minions by returning them to hand, and manipulates base actions.",
  "Astro Knights": "Buffs single minions to cosmic power levels with laser sword attachments.",
  "Changerbots": "Shifts between different forms to gain power, armor, or mobility as needed.",
  "Ignobles": "Gives away control of minions to manipulate opponents, then betrays them to take them back.",
  // What Were We Thinking
  "Teddybears": "Redirects damage, protects minions, and benefits when opponents play cards on your bases.",
  "Grandmas": "Controls the top cards of the deck to prepare for future turns.",
  "Rock Stars": "Plays 'Groupies' that gather together in crowds to instantly score bases.",
  "Explorers": "Manipulates bases, moves between them, and gains bonuses from playing cards on new bases.",
  // Big in Japan
  "Itty Critters": "Summons cute little monsters from the deck for one turn before they return.",
  "Kaiju": "Massive monsters that attach actions to themselves and destroy bases.",
  "Magical Girls": "Stores power counters on actions and unleashes them for spell combos.",
  "Mega Troopers": "Uses hand size and quick reaction actions to fight off threats.",
  // That '70s
  "Disco Dancers": "Copies actions played on other minions, keeping the dance party going.",
  "Kung Fu Fighters": "Passes +1 power counters between minions, flowing like water.",
  "Truckers": "Moves bases around and attaches cargo actions to them.",
  "Vigilantes": "Triggers strong effects whenever your opponents play cards that affect your minions.",
  // Oops
  "Ancient Egyptians": "Buries cards face down under bases to trigger delayed, powerful effects.",
  "Cowboys": "Initiates duels with opposing minions, winning them to gain power and victory points.",
  "Samurai": "Gains honor counters when minions die or bases score, converting honor to power.",
  "Vikings": "Steals cards directly from opponents' decks or discard piles to use them as your own.",
  // World Tour: International Incident
  "Luchadors": "Pins opposing minions down, setting them up for massive wrestling moves.",
  "Mounties": "Moves around the board to assist, gaining power when opposing minions are present.",
  "Musketeers": "Chains action plays to gain huge temporary power boosts.",
  "Sumo Wrestlers": "Pushes opposing minions off bases to secure solo scoring.",
  // World Tour: Culture Shock
  "Anansi Tales": "Gives card control to opponents to trigger trickster effects.",
  "Ancient Incas": "Builds massive structures on bases that provide ongoing benefits.",
  "Grimms' Fairy Tales": "Uses stories to buff your minions and penalize opponents.",
  "Polynesian Voyagers": "Explores and navigates bases, placing extra bases into play.",
  "Russian Fairy Tales": "Transforms minions into other creatures to adapt to conditions.",
  // Marvel
  "Avengers": "Assembles a team of heroes that buff each other when united on a base.",
  "Hydra": "Swarms the board by destroying your own minions to spawn more.",
  "Kree": "Enhances troops with advanced alien technology and directives.",
  "Masters of Evil": "Gains bonuses when scoring bases, even if you don't win first place.",
  "S.H.I.E.L.D.": "Deploys agents to support each other and control bases.",
  "Sinister Six": "Dominates bases by manipulating base scoring thresholds.",
  "Spider-Verse": "Swings around the board, moving minions and attacking quickly.",
  "Ultimates": "Focuses on high-power cards that secure victories.",
  // Disney
  "Aladdin": "Steals resources, grants wishes, and manipulates actions.",
  "Beauty and the Beast": "Synergizes between high-power and low-power minions.",
  "Big Hero 6": "Upgrades hero minions with microbots and tech actions.",
  "Frozen": "Freezes opposing minions, preventing them from moving or attacking.",
  "Mulan": "Trains minions to gain honor and combat strength.",
  "The Lion King": "Benefits from minions entering the discard pile (the circle of life).",
  "The Nightmare Before Christmas": "Spreads holiday cheer (or fear) to manipulate points.",
  "Wreck-It Ralph": "Breaks bases and fixes them to gain rewards.",
  // 10th Anniversary
  "Mermaids": "Lures opposing minions to different bases and controls their movements.",
  "Skeletons": "Manipulates the discard pile and revives bony minions.",
  "World Champs": "Master-tier cards that represent high-level competitive mechanics.",
  // Movies
  "Action Heroes": "Chains actions to perform cinematic stunts and explosive plays.",
  "Backtimers": "Manipulates time, replaying cards and resetting actions.",
  "Extramorphs": "Parasitic minions that evolve and feed on opposing minions.",
  "Wraithrustlers": "Traps spirits and opposing minions, containing them for points.",
  // Half the Battle
  "Adolescent Epic Geckos": "Tags minions in and out of play, taking advantage of quick swaps and powerful two-action turns.",
  "G.I. Gerald": "Utilizes specialized military options and introduces new card-type synergies for versatile play.",
  "Pearl and the Images": "Builds rhythm and plays like an 80s girl band, synergizing together to buff each other's power.",
  "Rulers of the Cosmos": "Deploys powerful cosmic talents and rules the board with ongoing command abilities.",
  // Promos / Extras
  "Geeks": "Rulebook lawyering! Cancels actions, controls decks, and disrupts standard rules.",
  "All-Stars": "High-synergy deck featuring the best cards from across various factions.",
  "Goblins": "Gambles and flips coins/draws cards for high-risk, high-reward plays.",
  "Penguins": "Swarms the deck, drawing and playing extra cards from the top.",
  "Knights of the Round Table": "Follows quests and codes of honor to score extra points.",
  "Titans": "Summons massive Titan cards that dominate bases.",
  "Teens": "Rely on teenage angst, text messages, and mood swings for unexpected shifts.",
  "Sheep": "Connects minions together, forming a flock that moves and scores bases in unison.",
  "Slashers": "Relentlessly hunts down and eliminates opposing minions with horror movie execution tactics.",
  "Clowns": "Disrupts and mocks opponents, redirecting their attacks and causing chaotic board shifts."
};

function openExpansionModal(group) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  const content = document.createElement('div');
  content.className = 'modal-content-box';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => overlay.remove());
  content.appendChild(closeBtn);
  
  const modalLayout = document.createElement('div');
  modalLayout.className = 'modal-layout';
  
  const imgCol = document.createElement('div');
  imgCol.className = 'modal-img-col';
  if (group.Image) {
    const img = document.createElement('img');
    img.src = resolveImagePath(group.Image);
    img.alt = `${group.GroupTitle} Box Art`;
    img.className = 'modal-cover-img';
    img.referrerPolicy = 'no-referrer';
    imgCol.appendChild(img);
  } else if (group.GroupTitle === "Promos & Solo Decks") {
    const promoPlaceholder = document.createElement('div');
    promoPlaceholder.className = 'modal-promo-placeholder';
    promoPlaceholder.innerHTML = '🎁';
    imgCol.appendChild(promoPlaceholder);
  }
  modalLayout.appendChild(imgCol);
  
  const detailsCol = document.createElement('div');
  detailsCol.className = 'modal-details-col';
  
  const title = document.createElement('h3');
  title.className = 'modal-title';
  title.textContent = group.GroupTitle;
  detailsCol.appendChild(title);
  
  const subtitle = document.createElement('p');
  subtitle.className = 'modal-subtitle';
  subtitle.textContent = `${group.Decks.length} Factions Included:`;
  detailsCol.appendChild(subtitle);
  
  const list = document.createElement('div');
  list.className = 'modal-deck-desc-list';
  
  group.Decks.forEach(deck => {
    const item = document.createElement('div');
    item.className = 'modal-deck-desc-item';
    
    const iconHtml = getDeckIconHtml(deck, "deck-icon-img", false);
    const isRevised = revisedFactions.includes(deck);
    const badgeHtml = isRevised ? '<span class="revamped-badge">✨ Revamped</span>' : '';
    const desc = deckDescriptions[deck] || "No description available for this faction.";
    
    item.innerHTML = `
      <div class="modal-deck-desc-header">
        <span class="modal-deck-emoji">${iconHtml}</span>
        <span class="modal-deck-name">${deck}${badgeHtml}</span>
      </div>
      <div class="modal-deck-desc-body">${desc}</div>
    `;
    list.appendChild(item);
  });
  
  detailsCol.appendChild(list);
  modalLayout.appendChild(detailsCol);
  content.appendChild(modalLayout);
  overlay.appendChild(content);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
  
  document.body.appendChild(overlay);
}

function openSynergyModal(deck1, deck2, synergy, isRev1, isRev2) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  const content = document.createElement('div');
  content.className = 'modal-content-box synergy-modal-content';
  content.style.maxWidth = '550px';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => overlay.remove());
  content.appendChild(closeBtn);

  const title = document.createElement('h3');
  title.className = 'modal-title synergy-modal-title';
  title.style.marginBottom = '1rem';
  
  const name1 = deck1 + (isRev1 ? ' (Revamped)' : '');
  const name2 = deck2 + (isRev2 ? ' (Revamped)' : '');
  title.innerHTML = `${name1} &amp; ${name2}`;
  content.appendChild(title);

  const badgeWrapper = document.createElement('div');
  badgeWrapper.style.marginBottom = '1.5rem';
  badgeWrapper.innerHTML = `<span class="synergy-tier-badge tier-${synergy.tier}" style="font-size: 0.9rem; padding: 0.35rem 0.85rem; cursor: default;">${synergy.ratingName}</span>`;
  content.appendChild(badgeWrapper);

  const desc = document.createElement('div');
  desc.className = 'synergy-modal-desc';
  desc.style.fontSize = '1.1rem';
  desc.style.lineHeight = '1.7';
  desc.style.color = '#e2e8f0';
  desc.innerHTML = synergy.text;
  content.appendChild(desc);

  if (isRev1 || isRev2) {
    const revisedList = [];
    if (isRev1) revisedList.push(`<strong>${deck1} (Revamped)</strong>`);
    if (isRev2) revisedList.push(`<strong>${deck2} (Revamped)</strong>`);
    
    const revisedAlert = document.createElement('div');
    revisedAlert.className = 'synergy-revised-section';
    revisedAlert.style.marginTop = '1.5rem';
    revisedAlert.innerHTML = `
      <div class="synergy-revised-title" style="font-weight: 700; color: #fbbf24; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>✨</span> Revised Faction Alert
      </div>
      <div class="synergy-revised-desc" style="font-size: 0.9rem; color: #94a3b8; line-height: 1.5;">
        This pairing includes the revised/revamped balance printings for ${revisedList.join(' and ')}. 
        AEG redesigned these factions to refine their mechanics, making them far more interactive and viable.
      </div>
    `;
    content.appendChild(revisedAlert);
  }

  overlay.appendChild(content);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
  
  document.body.appendChild(overlay);
}

const profiles = {
  "joel-dale": {
    name: "Joel Dale",
    excludeGroups: [
      "Smash Up: Disney Edition",
      "Munchkin",
      "World Tour: International Incident",
      "World Tour: Culture Shock",
      "Goblins Promo Deck",
      "Knights of the Round Table Promo Deck",
      "Teens Promo Deck",
      "Clowns Promo Deck",
      "Slashers Promo Deck",
      "Half the Battle"
    ]
  },
  "all-decks": {
    name: "Complete Collection",
    excludeGroups: []
  }
};

function applyProfile(profileId) {
  const profileSelect = document.getElementById('profile-select');
  if (profileSelect) {
    profileSelect.value = profileId;
  }
  localStorage.setItem('smashup-profile', profileId);

  const titanFilterCheck = document.getElementById('titan-filter-check');
  const filterTitans = titanFilterCheck ? titanFilterCheck.checked : false;

  if (profileId === 'custom') {
    const savedDecks = localStorage.getItem('smashup-custom-decks');
    if (savedDecks) {
      selectedDecks.clear();
      JSON.parse(savedDecks).forEach(deck => {
        if (!filterTitans || !!titanMap[deck]) {
          selectedDecks.add(deck);
        }
      });
    }
    return;
  }

  selectedDecks.clear();
  const profile = profiles[profileId];
  if (!profile) return;

  cardData.CardGroups.forEach(group => {
    if (!profile.excludeGroups.includes(group.GroupTitle)) {
      group.Decks.forEach(deck => {
        if (!filterTitans || !!titanMap[deck]) {
          selectedDecks.add(deck);
        }
      });
    }
  });
}

function handleSelectionChange() {
  const profileSelect = document.getElementById('profile-select');
  if (profileSelect && profileSelect.value !== 'custom') {
    profileSelect.value = 'custom';
    localStorage.setItem('smashup-profile', 'custom');
  }
  localStorage.setItem('smashup-custom-decks', JSON.stringify([...selectedDecks]));
  updateCounts();
}

// Fetch cards metadata
async function loadCards() {
  try {
    const response = await fetch('./cards.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch cards: ${response.statusText}`);
    }
    const rawData = await response.json();
    
    // Filter out "Titans Pack" completely as Titans are modifiers, not a standalone deck
    cardData = {
      CardGroups: rawData.CardGroups.filter(group => group.GroupTitle !== "Titans Pack")
    };
    
    // Load profile from localStorage or default to 'joel-dale'
    const savedProfile = localStorage.getItem('smashup-profile') || 'joel-dale';
    applyProfile(savedProfile);

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

  const filterTitans = document.getElementById('titan-filter-check') ? document.getElementById('titan-filter-check').checked : false;

  const soloGroups = cardData.CardGroups.filter(g => g.Decks.length === 1);
  const standardGroups = cardData.CardGroups.filter(g => g.Decks.length > 1);

  // Render standard expansions
  standardGroups.forEach((group, index) => {
    let visibleDecks = group.Decks;
    if (filterTitans) {
      visibleDecks = group.Decks.filter(deck => !!titanMap[deck]);
    }
    if (visibleDecks.length === 0) return; // Skip rendering this card

    const card = document.createElement('div');
    card.className = 'expansion-card collapsed-mobile';

    // Cover image
    if (group.Image) {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'expansion-cover-wrapper';
      imgWrapper.style.cursor = 'pointer';
      imgWrapper.title = 'Click to view expansion details & deck descriptions';
      imgWrapper.addEventListener('click', () => openExpansionModal(group));
      
      const img = document.createElement('img');
      img.src = resolveImagePath(group.Image);
      img.alt = `${group.GroupTitle} Box Art`;
      img.className = 'expansion-cover';
      img.referrerPolicy = 'no-referrer';
      imgWrapper.appendChild(img);
      card.appendChild(imgWrapper);
    }

    // Header with master checkbox
    const titleBar = document.createElement('div');
    titleBar.className = 'expansion-title-bar';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `expansion-check-${index}`;

    const label = document.createElement('span');
    label.className = 'expansion-title';
    label.textContent = group.GroupTitle;
    label.style.cursor = 'pointer';

    const countBadge = document.createElement('span');
    countBadge.className = 'selection-count-badge';
    countBadge.style.fontSize = '0.8rem';
    countBadge.style.color = 'var(--text-secondary)';
    countBadge.style.marginLeft = '0.5rem';
    countBadge.style.fontWeight = '600';
    
    const updateCountBadge = () => {
      const selectedCount = visibleDecks.filter(d => selectedDecks.has(d)).length;
      countBadge.textContent = ` (${selectedCount}/${visibleDecks.length} Selected)`;
    };
    updateCountBadge();

    const toggleArrow = document.createElement('span');
    toggleArrow.className = 'expansion-toggle-arrow';
    toggleArrow.textContent = '▼';

    titleBar.appendChild(checkbox);
    titleBar.appendChild(label);
    titleBar.appendChild(countBadge);
    titleBar.appendChild(toggleArrow);
    card.appendChild(titleBar);

    // Toggle collapse state on mobile when clicking header (excluding checkbox)
    titleBar.style.cursor = 'pointer';
    titleBar.addEventListener('click', (e) => {
      if (e.target === checkbox) return;
      card.classList.toggle('collapsed-mobile');
    });

    // Check if all decks in group are selected
    const allDecksSelected = visibleDecks.every(deck => selectedDecks.has(deck));
    const anyDecksSelected = visibleDecks.some(deck => selectedDecks.has(deck));
    checkbox.checked = allDecksSelected;
    checkbox.indeterminate = !allDecksSelected && anyDecksSelected;

    if (anyDecksSelected) {
      card.classList.add('selected-card');
    }

    // List of decks
    const list = document.createElement('div');
    list.className = 'deck-list';

    visibleDecks.forEach(deck => {
      const isSelected = selectedDecks.has(deck);
      const item = document.createElement('label');
      item.className = `deck-item ${isSelected ? 'selected' : ''}`;

      const deckCheck = document.createElement('input');
      deckCheck.type = 'checkbox';
      deckCheck.checked = isSelected;
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'deck-name';
      
      const iconSpan = document.createElement('span');
      iconSpan.className = 'deck-icon-wrapper';
      iconSpan.innerHTML = getDeckIconHtml(deck);
      
      const textSpan = document.createElement('span');
      textSpan.className = 'deck-text';
      textSpan.textContent = titanMap[deck] ? `${deck} / ${titanMap[deck]}` : deck;
      
      if (revisedFactions.includes(deck)) {
        const badge = document.createElement('span');
        badge.className = 'revamped-badge';
        badge.innerHTML = '✨ Revamped';
        textSpan.appendChild(badge);
      }
      
      nameSpan.appendChild(iconSpan);
      nameSpan.appendChild(textSpan);

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
        
        // Update card visual selection state
        const updatedAnySelected = visibleDecks.some(d => selectedDecks.has(d));
        if (updatedAnySelected) {
          card.classList.add('selected-card');
        } else {
          card.classList.remove('selected-card');
        }

        // Update group master checkbox state
        const updatedAllSelected = visibleDecks.every(d => selectedDecks.has(d));
        checkbox.checked = updatedAllSelected;
        checkbox.indeterminate = !updatedAllSelected && updatedAnySelected;
        
        updateCountBadge();
        handleSelectionChange();
      });
    });

    card.appendChild(list);
    container.appendChild(card);

    // Event listener for master checkbox
    checkbox.addEventListener('change', () => {
      const checkAll = checkbox.checked;
      checkbox.indeterminate = false;

      const deckItems = list.querySelectorAll('.deck-item');
      visibleDecks.forEach((deck, idx) => {
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

      if (checkAll) {
        card.classList.add('selected-card');
      } else {
        card.classList.remove('selected-card');
      }

      updateCountBadge();
      handleSelectionChange();
    });
  });

  // Render combined Promos & Solo Decks card
  let visibleSoloGroups = soloGroups;
  if (filterTitans) {
    visibleSoloGroups = soloGroups.filter(g => !!titanMap[g.Decks[0]]);
  }

  if (visibleSoloGroups.length > 0) {
    const card = document.createElement('div');
    card.className = 'expansion-card promo-card collapsed-mobile';

    // Mini collage of promo images
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'expansion-cover-wrapper';
    imgWrapper.style.cursor = 'pointer';
    imgWrapper.title = 'Click to view promo details & deck descriptions';
    
    const allPromoDecks = visibleSoloGroups.map(g => g.Decks[0]);
    imgWrapper.addEventListener('click', () => {
      openExpansionModal({
        GroupTitle: "Promos & Solo Decks",
        Decks: allPromoDecks,
        Image: null
      });
    });
    
    const coversGrid = document.createElement('div');
    coversGrid.className = 'promo-covers-grid';
    
    visibleSoloGroups.forEach(g => {
      if (g.Image) {
        const miniImg = document.createElement('img');
        miniImg.src = resolveImagePath(g.Image);
        miniImg.alt = `${g.GroupTitle} Box Art`;
        miniImg.className = 'promo-mini-cover';
        miniImg.referrerPolicy = 'no-referrer';
        coversGrid.appendChild(miniImg);
      }
    });
    imgWrapper.appendChild(coversGrid);
    card.appendChild(imgWrapper);

    // Header with master checkbox
    const titleBar = document.createElement('div');
    titleBar.className = 'expansion-title-bar';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'expansion-check-promos';

    const label = document.createElement('span');
    label.className = 'expansion-title';
    label.textContent = "Promos & Solo Decks";
    label.style.cursor = 'pointer';

    const countBadge = document.createElement('span');
    countBadge.className = 'selection-count-badge';
    countBadge.style.fontSize = '0.8rem';
    countBadge.style.color = 'var(--text-secondary)';
    countBadge.style.marginLeft = '0.5rem';
    countBadge.style.fontWeight = '600';
    
    const updateCountBadge = () => {
      const selectedCount = allPromoDecks.filter(d => selectedDecks.has(d)).length;
      countBadge.textContent = ` (${selectedCount}/${allPromoDecks.length} Selected)`;
    };
    updateCountBadge();

    const toggleArrow = document.createElement('span');
    toggleArrow.className = 'expansion-toggle-arrow';
    toggleArrow.textContent = '▼';

    titleBar.appendChild(checkbox);
    titleBar.appendChild(label);
    titleBar.appendChild(countBadge);
    titleBar.appendChild(toggleArrow);
    card.appendChild(titleBar);

    // Toggle collapse state on mobile when clicking header (excluding checkbox)
    titleBar.style.cursor = 'pointer';
    titleBar.addEventListener('click', (e) => {
      if (e.target === checkbox) return;
      card.classList.toggle('collapsed-mobile');
    });

    // List of promo decks
    const list = document.createElement('div');
    list.className = 'deck-list';

    const allSelected = allPromoDecks.every(deck => selectedDecks.has(deck));
    const anySelected = allPromoDecks.some(deck => selectedDecks.has(deck));
    checkbox.checked = allSelected;
    checkbox.indeterminate = !allSelected && anySelected;

    if (anySelected) {
      card.classList.add('selected-card');
    }

    visibleSoloGroups.forEach(g => {
      const deck = g.Decks[0];
      const isSelected = selectedDecks.has(deck);
      const item = document.createElement('label');
      item.className = `deck-item ${isSelected ? 'selected' : ''}`;

      const deckCheck = document.createElement('input');
      deckCheck.type = 'checkbox';
      deckCheck.checked = isSelected;
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'deck-name';
      
      const iconSpan = document.createElement('span');
      iconSpan.className = 'deck-icon-wrapper';
      iconSpan.innerHTML = getDeckIconHtml(deck);
      
      const textSpan = document.createElement('span');
      textSpan.className = 'deck-text';
      textSpan.textContent = titanMap[deck] ? `${deck} / ${titanMap[deck]}` : deck;
      
      if (revisedFactions.includes(deck)) {
        const badge = document.createElement('span');
        badge.className = 'revamped-badge';
        badge.innerHTML = '✨ Revamped';
        textSpan.appendChild(badge);
      }
      
      nameSpan.appendChild(iconSpan);
      nameSpan.appendChild(textSpan);

      item.appendChild(deckCheck);
      item.appendChild(nameSpan);
      list.appendChild(item);

      deckCheck.addEventListener('change', () => {
        if (deckCheck.checked) {
          selectedDecks.add(deck);
          item.classList.add('selected');
        } else {
          selectedDecks.delete(deck);
          item.classList.remove('selected');
        }
        
        const updatedAnySelected = allPromoDecks.some(d => selectedDecks.has(d));
        if (updatedAnySelected) {
          card.classList.add('selected-card');
        } else {
          card.classList.remove('selected-card');
        }

        const updatedAllSelected = allPromoDecks.every(d => selectedDecks.has(d));
        checkbox.checked = updatedAllSelected;
        checkbox.indeterminate = !updatedAllSelected && updatedAnySelected;
        
        updateCountBadge();
        handleSelectionChange();
      });
    });

    card.appendChild(list);
    container.appendChild(card);

    // Master checkbox listener
    checkbox.addEventListener('change', () => {
      const checkAll = checkbox.checked;
      checkbox.indeterminate = false;

      const deckItems = list.querySelectorAll('.deck-item');
      allPromoDecks.forEach((deck, idx) => {
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

      if (checkAll) {
        card.classList.add('selected-card');
      } else {
        card.classList.remove('selected-card');
      }

      updateCountBadge();
      handleSelectionChange();
    });
  }
}

// Graph matching helper to check if a valid draft exists with current settings
function checkValidDraftExists(activeDecks, allowedTiers, numPlayers) {
  const adj = new Map();
  activeDecks.forEach(d => adj.set(d, []));
  
  let edgeCount = 0;
  for (let i = 0; i < activeDecks.length; i++) {
    const d1 = activeDecks[i];
    const isRev1 = revisedFactions.includes(d1);
    for (let j = i + 1; j < activeDecks.length; j++) {
      const d2 = activeDecks[j];
      const isRev2 = revisedFactions.includes(d2);
      const synergy = evaluateSynergy(d1, d2, isRev1, isRev2);
      if (allowedTiers.includes(synergy.tier)) {
        adj.get(d1).push(d2);
        adj.get(d2).push(d1);
        edgeCount++;
      }
    }
  }

  if (edgeCount < numPlayers) {
    return false;
  }

  const used = new Set();
  const deckList = [...activeDecks];
  
  function dfs(deckIdx, matchesFound) {
    if (matchesFound === numPlayers) {
      return true;
    }
    if (deckIdx >= deckList.length) {
      return false;
    }
    
    const deck = deckList[deckIdx];
    if (used.has(deck)) {
      return dfs(deckIdx + 1, matchesFound);
    }
    
    // Try matching deck with each of its unused neighbors
    const neighbors = adj.get(deck);
    for (const neighbor of neighbors) {
      if (!used.has(neighbor)) {
        used.add(deck);
        used.add(neighbor);
        if (dfs(deckIdx + 1, matchesFound + 1)) {
          return true;
        }
        used.delete(deck);
        used.delete(neighbor);
      }
    }
    
    // Try leaving deck unmatched
    return dfs(deckIdx + 1, matchesFound);
  }
  
  return dfs(0, 0);
}

// Randomized maximum matching draft generator using backtracking
function generateRandomDraft(activeDecks, allowedTiers, numPlayers) {
  const adj = new Map();
  activeDecks.forEach(d => adj.set(d, []));
  
  for (let i = 0; i < activeDecks.length; i++) {
    const d1 = activeDecks[i];
    const isRev1 = revisedFactions.includes(d1);
    for (let j = i + 1; j < activeDecks.length; j++) {
      const d2 = activeDecks[j];
      const isRev2 = revisedFactions.includes(d2);
      const synergy = evaluateSynergy(d1, d2, isRev1, isRev2);
      if (allowedTiers.includes(synergy.tier)) {
        adj.get(d1).push(d2);
        adj.get(d2).push(d1);
      }
    }
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const shuffledDecks = shuffle([...activeDecks]);
  const used = new Set();
  const assignments = [];

  function dfs(deckIdx, matchesFound) {
    if (matchesFound === numPlayers) {
      return true;
    }
    if (deckIdx >= shuffledDecks.length) {
      return false;
    }
    
    const deck = shuffledDecks[deckIdx];
    if (used.has(deck)) {
      return dfs(deckIdx + 1, matchesFound);
    }
    
    // Try matching deck with each of its unused neighbors in random order
    const neighbors = shuffle([...adj.get(deck)]);
    for (const neighbor of neighbors) {
      if (!used.has(neighbor)) {
        used.add(deck);
        used.add(neighbor);
        assignments.push({
          playerIndex: matchesFound + 1,
          deck1: deck,
          deck2: neighbor
        });
        
        if (dfs(deckIdx + 1, matchesFound + 1)) {
          return true;
        }
        
        assignments.pop();
        used.delete(deck);
        used.delete(neighbor);
      }
    }
    
    // Try leaving deck unmatched
    return dfs(deckIdx + 1, matchesFound);
  }

  if (dfs(0, 0)) {
    return assignments;
  }
  return null;
}

function getSelectedTiers() {
  const activeChips = document.querySelectorAll('.synergy-chip.active');
  return Array.from(activeChips).map(chip => chip.dataset.tier);
}

function applyPreset(presetName) {
  const chips = document.querySelectorAll('.synergy-chip');
  chips.forEach(chip => {
    const tier = chip.dataset.tier;
    let active = false;
    
    if (presetName === 'chaos') {
      active = true;
    } else if (presetName === 'standard') {
      active = ['s', 'a', 'b', 'c'].includes(tier);
    } else if (presetName === 'mid') {
      active = ['b', 'c'].includes(tier);
    } else if (presetName === 'competitive') {
      active = ['s', 'a'].includes(tier);
    }
    
    if (active) {
      chip.classList.add('active');
      chip.classList.add(`active-${tier}`);
    } else {
      chip.classList.remove('active');
      chip.classList.remove(`active-${tier}`);
    }
  });
  
  updateBalanceModeDropdown();
}

function handleChipToggle(chip) {
  const tier = chip.dataset.tier;
  const isActive = chip.classList.contains('active');
  
  if (isActive) {
    chip.classList.remove('active');
    chip.classList.remove(`active-${tier}`);
  } else {
    chip.classList.add('active');
    chip.classList.add(`active-${tier}`);
  }
  
  // Deactivate preset buttons
  const presets = document.querySelectorAll('.preset-btn');
  presets.forEach(p => p.classList.remove('active'));
  
  checkPresetMatches();
  updateBalanceModeDropdown(true);
}

function checkPresetMatches() {
  const activeChips = Array.from(document.querySelectorAll('.synergy-chip.active')).map(c => c.dataset.tier).sort();
  const presets = document.querySelectorAll('.preset-btn');
  
  presets.forEach(p => {
    if (p.disabled) {
      p.classList.remove('active');
      return;
    }
    const name = p.dataset.preset;
    let target = [];
    if (name === 'chaos') target = ['s', 'a', 'b', 'c', 'd', 'anti'];
    else if (name === 'standard') target = ['s', 'a', 'b', 'c'];
    else if (name === 'mid') target = ['b', 'c'];
    else if (name === 'competitive') target = ['s', 'a'];
    
    target.sort();
    
    if (activeChips.length === target.length && activeChips.every((val, index) => val === target[index])) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
}

function updateBalanceModeDropdown(isManualToggle = false) {
  const playerSelect = document.getElementById('player-select');
  const badge = document.getElementById('allowed-pairs-badge');
  const pickBtn = document.getElementById('pick-btn');
  const errorContainer = document.getElementById('error-container');
  if (!playerSelect) return;

  const numPlayers = parseInt(playerSelect.value, 10);
  const activeDecks = [...selectedDecks];
  const decksNeeded = numPlayers ? numPlayers * 2 : 0;

  let s_a_count = 0;
  let s_a_b_count = 0;
  let s_a_b_c_count = 0;
  let s_a_b_c_d_count = 0;
  let mid_tier_count = 0;

  const strongFactions = new Set();
  const goodFactions = new Set();
  const standardFactions = new Set();
  const noAntiFactions = new Set();
  const midTierFactions = new Set();

  for (let i = 0; i < activeDecks.length; i++) {
    for (let j = i + 1; j < activeDecks.length; j++) {
      const isRev1 = revisedFactions.includes(activeDecks[i]);
      const isRev2 = revisedFactions.includes(activeDecks[j]);
      const synergy = evaluateSynergy(activeDecks[i], activeDecks[j], isRev1, isRev2);
      
      const t = synergy.tier;
      if (t === 's' || t === 'a') {
        s_a_count++;
        strongFactions.add(activeDecks[i]);
        strongFactions.add(activeDecks[j]);
      }
      if (t === 's' || t === 'a' || t === 'b') {
        s_a_b_count++;
        goodFactions.add(activeDecks[i]);
        goodFactions.add(activeDecks[j]);
      }
      if (t === 's' || t === 'a' || t === 'b' || t === 'c') {
        s_a_b_c_count++;
        standardFactions.add(activeDecks[i]);
        standardFactions.add(activeDecks[j]);
      }
      if (t !== 'anti') {
        s_a_b_c_d_count++;
        noAntiFactions.add(activeDecks[i]);
        noAntiFactions.add(activeDecks[j]);
      }
      if (t === 'b' || t === 'c') {
        mid_tier_count++;
        midTierFactions.add(activeDecks[i]);
        midTierFactions.add(activeDecks[j]);
      }
    }
  }

  const activeTiers = getSelectedTiers();
  let allowedPairsCount = 0;
  const activeUniqueFactions = new Set();

  for (let i = 0; i < activeDecks.length; i++) {
    for (let j = i + 1; j < activeDecks.length; j++) {
      const isRev1 = revisedFactions.includes(activeDecks[i]);
      const isRev2 = revisedFactions.includes(activeDecks[j]);
      const synergy = evaluateSynergy(activeDecks[i], activeDecks[j], isRev1, isRev2);
      if (activeTiers.includes(synergy.tier)) {
        allowedPairsCount++;
        activeUniqueFactions.add(activeDecks[i]);
        activeUniqueFactions.add(activeDecks[j]);
      }
    }
  }

  if (badge) {
    badge.textContent = `${allowedPairsCount} Pairs (${activeUniqueFactions.size} Decks)`;
  }

  const effectivePlayers = numPlayers || 2;
  const effectiveDecksNeeded = effectivePlayers * 2;

  const presetChaos = document.querySelector('.preset-btn[data-preset="chaos"]');
  const presetStandard = document.querySelector('.preset-btn[data-preset="standard"]');
  const presetMid = document.querySelector('.preset-btn[data-preset="mid"]');
  const presetCompetitive = document.querySelector('.preset-btn[data-preset="competitive"]');

  if (presetStandard) {
    const isUnavailable = s_a_b_c_count < effectivePlayers || standardFactions.size < effectiveDecksNeeded;
    presetStandard.disabled = isUnavailable;
    presetStandard.textContent = `Workable (${isUnavailable ? 'Unavailable: ' : ''}${s_a_b_c_count} pairs, ${standardFactions.size} decks)`;
  }
  if (presetMid) {
    const isUnavailable = mid_tier_count < effectivePlayers || midTierFactions.size < effectiveDecksNeeded;
    presetMid.disabled = isUnavailable;
    presetMid.textContent = `Mid-Tier (${isUnavailable ? 'Unavailable: ' : ''}${mid_tier_count} pairs, ${midTierFactions.size} decks)`;
  }
  if (presetCompetitive) {
    const isUnavailable = s_a_count < effectivePlayers || strongFactions.size < effectiveDecksNeeded;
    presetCompetitive.disabled = isUnavailable;
    presetCompetitive.textContent = `Elite Only (${isUnavailable ? 'Unavailable: ' : ''}${s_a_count} pairs, ${strongFactions.size} decks)`;
  }

  if (!isManualToggle) {
    const activePreset = document.querySelector('.preset-btn.active');
    if (activePreset && activePreset.disabled) {
      activePreset.classList.remove('active');
      if (presetStandard && !presetStandard.disabled) {
        presetStandard.classList.add('active');
        applyPreset('standard');
      } else {
        if (presetChaos) {
          presetChaos.classList.add('active');
          applyPreset('chaos');
        }
      }
    }
  }

  // Pre-validation block (Drafting State Machine)
  if (pickBtn && errorContainer) {
    // Reset defaults first
    pickBtn.disabled = false;
    pickBtn.className = 'btn-primary';
    pickBtn.innerHTML = `<span>⚡</span> Pick Decks`;
    errorContainer.innerHTML = '';

    if (!numPlayers) {
      // State 1: NO_PLAYERS (Initial Load)
      pickBtn.disabled = true;
      pickBtn.className = 'btn-primary btn-disabled-state';
      pickBtn.innerHTML = `<span>👥</span> Select Player Count`;
      return;
    }

    if (activeDecks.length < decksNeeded) {
      // State 2: INSUFFICIENT_DECKS
      const diff = decksNeeded - activeDecks.length;
      pickBtn.disabled = true;
      pickBtn.className = 'btn-primary btn-warning-state';
      pickBtn.innerHTML = `<span>⚠️</span> Select ${diff} More Deck${diff > 1 ? 's' : ''}`;
      errorContainer.innerHTML = `
        <div class="alert-error">
          Not enough decks selected! You have selected <strong>${activeDecks.length}</strong> decks, but need at least <strong>${decksNeeded}</strong> decks for <strong>${numPlayers}</strong> players.
        </div>`;
      return;
    }

    const validDraftExists = checkValidDraftExists(activeDecks, activeTiers, numPlayers);
    if (!validDraftExists) {
      // State 3: INVALID_SYNERGY
      pickBtn.disabled = true;
      pickBtn.className = 'btn-primary btn-warning-state';
      pickBtn.innerHTML = `<span>⚠️</span> Adjust Synergy Tiers`;
      
      let tierNames = activeTiers.map(t => {
        const chip = document.querySelector(`.synergy-chip[data-tier="${t}"]`);
        return chip ? chip.querySelector('.chip-label').textContent : t;
      }).join(', ');
      
      errorContainer.innerHTML = `
        <div class="alert-error">
          <strong>Draft Generation Blocked:</strong> The selected synergy tiers (${tierNames || 'none selected'}) only have <strong>${allowedPairsCount} compatible pairs</strong> using <strong>${activeUniqueFactions.size} unique decks</strong>. 
          To support ${numPlayers} players, you need at least <strong>${numPlayers} independent pairs</strong> using <strong>${decksNeeded} unique decks</strong>.
          Please select more synergy tiers or enable more expansions.
        </div>`;
      return;
    }

    // State 4: READY
    // Button stays enabled with default styling and gradient glow.
  }
}

function updateCounts() {
  const activeCountBadge = document.getElementById('active-count');
  if (activeCountBadge) {
    activeCountBadge.textContent = selectedDecks.size;
  }
  updateBalanceModeDropdown(false);
}

function getComboName(d1, d2) {
  let part1 = d1.trim();
  // Strip 's' from end of first faction for proper Smash Up naming (e.g., Zombies -> Zombie, except for names like 'Cthulhu Cultists' or singulars)
  if (part1.endsWith('s') && !part1.endsWith('ss') && !part1.toLowerCase().endsWith('us') && !part1.toLowerCase().endsWith('is')) {
    part1 = part1.substring(0, part1.length - 1);
  }
  return `${part1} ${d2.trim()}`;
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
  const activeDecks = [...selectedDecks];
  if (activeDecks.length < decksNeeded) {
    errorContainer.innerHTML = `
      <div class="alert-error">
        Not enough decks! You have selected ${activeDecks.length} decks, but need at least ${decksNeeded} decks for ${numPlayers} players.
      </div>`;
    return;
  }

  const allowedTiers = getSelectedTiers();
  const assignments = generateRandomDraft(activeDecks, allowedTiers, numPlayers);

  if (!assignments) {
    errorContainer.innerHTML = `
      <div class="alert-error">
        Could not generate a valid draft. Please adjust your synergy tiers or selected expansions.
      </div>`;
    return;
  }

  playersSection.removeAttribute('hidden');

  assignments.forEach((assignment, index) => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.style.animationDelay = `${index * 80}ms`;

    const combo = getComboName(assignment.deck1, assignment.deck2);
    const isRev1 = revisedFactions.includes(assignment.deck1);
    const isRev2 = revisedFactions.includes(assignment.deck2);
    const synergy = evaluateSynergy(assignment.deck1, assignment.deck2, isRev1, isRev2);

    card.innerHTML = `
      <div class="player-header">
        <span class="player-name">Player ${assignment.playerIndex}</span>
        <span class="synergy-tier-badge tier-${synergy.tier}" style="transform: scale(0.9); transform-origin: right center; font-size: 0.75rem; padding: 0.25rem 0.65rem;">${synergy.ratingName}</span>
      </div>
      <div class="combo-title">${combo}</div>
      <div class="player-decks">
        <div class="deck-row">
          <div class="deck-emoji-circle">${getDeckIconHtml(assignment.deck1, "deck-icon-img-circle")}</div>
          <div class="deck-details">
            <span class="deck-title">${assignment.deck1}${titanMap[assignment.deck1] ? ' / ' + titanMap[assignment.deck1] : ''}${isRev1 ? ' <span class="revamped-badge">✨ Revamped</span>' : ''}</span>
            <span class="deck-source">${getDeckSourceInfo(assignment.deck1)}</span>
          </div>
        </div>
        <div class="deck-row">
          <div class="deck-emoji-circle">${getDeckIconHtml(assignment.deck2, "deck-icon-img-circle")}</div>
          <div class="deck-details">
            <span class="deck-title">${assignment.deck2}${titanMap[assignment.deck2] ? ' / ' + titanMap[assignment.deck2] : ''}${isRev2 ? ' <span class="revamped-badge">✨ Revamped</span>' : ''}</span>
            <span class="deck-source">${getDeckSourceInfo(assignment.deck2)}</span>
          </div>
        </div>
      </div>
    `;

    // Click event listener to the '.synergy-tier-badge' on the player results cards
    const badgeElement = card.querySelector('.synergy-tier-badge');
    if (badgeElement) {
      badgeElement.addEventListener('click', () => {
        openSynergyModal(assignment.deck1, assignment.deck2, synergy, isRev1, isRev2);
      });
    }

    resultsContainer.appendChild(card);
  });

  playersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function populateSynergyDropdowns() {
  const selectA = document.getElementById('faction-a-select');
  const selectB = document.getElementById('faction-b-select');
  if (!selectA || !selectB || !cardData || !cardData.CardGroups) return;

  let allDecks = [];
  cardData.CardGroups.forEach(group => {
    group.Decks.forEach(deck => {
      allDecks.push(deck);
    });
  });
  allDecks.sort();

  // Only repopulate if it has not been populated yet
  if (selectA.children.length > 1) return;

  allDecks.forEach(deck => {
    const isRevised = revisedFactions.includes(deck);
    
    if (isRevised) {
      // Normal option
      const optANormal = document.createElement('option');
      optANormal.value = deck;
      optANormal.textContent = `${deck} (Normal)`;
      selectA.appendChild(optANormal);

      const optBNormal = document.createElement('option');
      optBNormal.value = deck;
      optBNormal.textContent = `${deck} (Normal)`;
      selectB.appendChild(optBNormal);

      // Revamped option
      const optARevamped = document.createElement('option');
      optARevamped.value = `${deck}::revamped`;
      optARevamped.textContent = `${deck} (Revamped)`;
      selectA.appendChild(optARevamped);

      const optBRevamped = document.createElement('option');
      optBRevamped.value = `${deck}::revamped`;
      optBRevamped.textContent = `${deck} (Revamped)`;
      selectB.appendChild(optBRevamped);
    } else {
      // Standard option
      const optA = document.createElement('option');
      optA.value = deck;
      optA.textContent = deck;
      selectA.appendChild(optA);

      const optB = document.createElement('option');
      optB.value = deck;
      optB.textContent = deck;
      selectB.appendChild(optB);
    }
  });
}

function updateSynergyAnalysis() {
  const selectA = document.getElementById('faction-a-select');
  const selectB = document.getElementById('faction-b-select');
  const cardContainer = document.getElementById('synergy-result-card');
  if (!selectA || !selectB || !cardContainer) return;

  const valA = selectA.value;
  const valB = selectB.value;

  if (!valA || !valB) return;

  if (valA === valB) {
    cardContainer.innerHTML = `
      <div class="synergy-placeholder">
        <div class="placeholder-icon">⚠️</div>
        <h3>Select Different Factions</h3>
        <p>Please select two different factions to analyze their synergy. You cannot pair a faction with itself.</p>
      </div>
    `;
    return;
  }

  // Parse values
  const nameA = valA.split('::')[0];
  const isRevampedA = valA.endsWith('::revamped');
  const nameB = valB.split('::')[0];
  const isRevampedB = valB.endsWith('::revamped');

  if (nameA === nameB) {
    cardContainer.innerHTML = `
      <div class="synergy-placeholder">
        <div class="placeholder-icon">⚠️</div>
        <h3>Select Different Factions</h3>
        <p>Please select two different factions to analyze their synergy. You cannot pair the normal and revamped versions of the same faction.</p>
      </div>
    `;
    return;
  }

  const result = evaluateSynergy(nameA, nameB, isRevampedA, isRevampedB);
  if (!result) return;

  let revisedHtml = '';
  if (isRevampedA || isRevampedB) {
    const revisedList = [];
    if (isRevampedA) revisedList.push(`<strong>${nameA} (Revamped)</strong>`);
    if (isRevampedB) revisedList.push(`<strong>${nameB} (Revamped)</strong>`);
    
    revisedHtml = `
      <div class="synergy-revised-section">
        <div class="synergy-revised-title">✨ Revised Faction Alert</div>
        <div class="synergy-revised-desc">
          This pairing includes the revised/revamped balance printings for ${revisedList.join(' and ')}. 
          AEG redesigned these factions to refine their mechanics, making them far more interactive and viable compared to their original printings.
        </div>
      </div>
    `;
  }

  const labelA = nameA + (isRevampedA ? ' (Revamped)' : ' (Normal)');
  const labelB = nameB + (isRevampedB ? ' (Revamped)' : ' (Normal)');

  cardContainer.innerHTML = `
    <div class="synergy-header">
      <div class="synergy-pair-names">${labelA} + ${labelB}</div>
      <span class="synergy-tier-badge tier-${result.tier}">${result.ratingName}</span>
    </div>
    <div class="synergy-body">
      ${result.text}
    </div>
    ${revisedHtml}
  `;
}

// Bind interactive events
document.addEventListener('DOMContentLoaded', () => {
  loadCards();

  const pickBtn = document.getElementById('pick-btn');
  if (pickBtn) {
    pickBtn.addEventListener('click', distributeDecks);
  }

  const playerSelect = document.getElementById('player-select');
  if (playerSelect) {
    playerSelect.addEventListener('change', updateBalanceModeDropdown);
  }

  const profileSelect = document.getElementById('profile-select');
  if (profileSelect) {
    profileSelect.addEventListener('change', (e) => {
      applyProfile(e.target.value);
      renderExpansions();
      updateCounts();
    });
  }

  const titanFilterCheck = document.getElementById('titan-filter-check');
  if (titanFilterCheck) {
    titanFilterCheck.addEventListener('change', () => {
      if (titanFilterCheck.checked) {
        selectedDecks.forEach(deck => {
          if (!titanMap[deck]) {
            selectedDecks.delete(deck);
          }
        });
        handleSelectionChange();
      }
      renderExpansions();
    });
  }

  // View switcher tabs
  const tabSelector = document.getElementById('tab-selector');
  const tabTester = document.getElementById('tab-tester');
  const selectorSidebar = document.getElementById('selector-sidebar');
  const selectorContent = document.getElementById('selector-content');
  const testerSidebar = document.getElementById('tester-sidebar');
  const testerContent = document.getElementById('tester-content');

  if (tabSelector && tabTester && selectorSidebar && selectorContent && testerSidebar && testerContent) {
    tabSelector.addEventListener('click', () => {
      tabSelector.classList.add('active');
      tabTester.classList.remove('active');
      
      selectorSidebar.classList.remove('hidden');
      selectorContent.classList.remove('hidden');
      testerSidebar.classList.add('hidden');
      testerContent.classList.add('hidden');
    });

    tabTester.addEventListener('click', () => {
      tabTester.classList.add('active');
      tabSelector.classList.remove('active');
      
      selectorSidebar.classList.add('hidden');
      selectorContent.classList.add('hidden');
      testerSidebar.classList.remove('hidden');
      testerContent.classList.remove('hidden');
      
      populateSynergyDropdowns();
    });
  }

  // Preset buttons event listeners
  const presets = document.querySelectorAll('.preset-btn');
  presets.forEach(p => {
    p.addEventListener('click', () => {
      presets.forEach(btn => btn.classList.remove('active'));
      p.classList.add('active');
      applyPreset(p.dataset.preset);
    });
  });

  // Synergy chips click event listeners
  const chips = document.querySelectorAll('.synergy-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      handleChipToggle(chip);
    });
  });

  // Synergy Tester dropdown change events
  const selectA = document.getElementById('faction-a-select');
  const selectB = document.getElementById('faction-b-select');
  if (selectA && selectB) {
    selectA.addEventListener('change', updateSynergyAnalysis);
    selectB.addEventListener('change', updateSynergyAnalysis);
  }

  // Mobile Control Panel Collapsibility Toggles
  const panels = document.querySelectorAll('.control-panel');
  panels.forEach(panel => {
    const toggleBtn = panel.querySelector('.panel-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('collapsed');
      });
    }
  });

  // Collapse by default on mobile screens (under 1024px)
  if (window.innerWidth < 1024) {
    panels.forEach(panel => {
      panel.classList.add('collapsed');
    });
  }
});
