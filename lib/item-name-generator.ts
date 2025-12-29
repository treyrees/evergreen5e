// Random fantasy item name generator
// Generates names like "[Adjective] [Object]" or "[Object] of [Noun]"

const OBJECTS = [
  // Melee Weapons
  'Sword', 'Blade', 'Longsword', 'Greatsword', 'Shortsword', 'Rapier', 'Scimitar',
  'Dagger', 'Dirk', 'Stiletto', 'Axe', 'Battleaxe', 'Greataxe', 'Hatchet',
  'Mace', 'Morningstar', 'Flail', 'Warhammer', 'Maul', 'Club', 'Quarterstaff',
  'Spear', 'Lance', 'Halberd', 'Glaive', 'Pike', 'Trident', 'Whip',
  // Ranged Weapons
  'Bow', 'Longbow', 'Shortbow', 'Crossbow', 'Sling',
  // Armor
  'Shield', 'Buckler', 'Armor', 'Helm', 'Helmet', 'Gauntlets', 'Bracers',
  'Breastplate', 'Chainmail', 'Plate', 'Cuirass', 'Greaves', 'Pauldrons',
  // Accessories
  'Ring', 'Amulet', 'Pendant', 'Necklace', 'Circlet', 'Crown', 'Tiara',
  'Cloak', 'Cape', 'Mantle', 'Robe', 'Vestments', 'Boots', 'Sandals',
  'Gloves', 'Belt', 'Sash', 'Bracelet', 'Brooch', 'Medallion',
  // Magic Implements
  'Staff', 'Wand', 'Rod', 'Orb', 'Scepter', 'Talisman', 'Tome', 'Grimoire',
  // Misc Items
  'Chalice', 'Horn', 'Lantern', 'Mirror', 'Compass', 'Locket', 'Skull',
  'Crystal', 'Gem', 'Stone', 'Mask', 'Eye', 'Hand', 'Heart', 'Tooth', 'Claw',
  'Feather', 'Scale', 'Bone', 'Goblet', 'Torch', 'Candle', 'Bell', 'Coin',
];

const ADJECTIVES = [
  // Elemental
  'Blazing', 'Frozen', 'Thundering', 'Burning', 'Icy', 'Stormy', 'Smoldering',
  'Crackling', 'Frigid', 'Scorching', 'Tempestuous', 'Volcanic', 'Glacial',
  // Light/Dark
  'Radiant', 'Luminous', 'Gleaming', 'Shimmering', 'Glowing', 'Brilliant',
  'Shadow', 'Dark', 'Obsidian', 'Ebony', 'Twilight', 'Midnight', 'Umbral',
  // Material
  'Golden', 'Silver', 'Crystal', 'Diamond', 'Ruby', 'Emerald', 'Sapphire',
  'Iron', 'Steel', 'Adamantine', 'Mithral', 'Orichalcum', 'Bronze', 'Jade',
  // Nature
  'Verdant', 'Thorned', 'Sylvan', 'Feral', 'Primal', 'Ancient', 'Wild',
  'Serpentine', 'Draconic', 'Feywild', 'Oceanic', 'Celestial', 'Lunar', 'Solar',
  // Power
  'Mighty', 'Formidable', 'Devastating', 'Legendary', 'Mythic', 'Epic', 'Divine',
  'Cursed', 'Blessed', 'Enchanted', 'Arcane', 'Mystic', 'Eldritch', 'Runic',
  // Qualities
  'Swift', 'Silent', 'Keen', 'Vorpal', 'Venomous', 'Vampiric', 'Spectral',
  'Ethereal', 'Phantom', 'Wraithlike', 'Ghostly', 'Hallowed', 'Unholy', 'Sacred',
  // Heroic
  'Valiant', 'Noble', 'Royal', 'Imperial', 'Regal', 'Exalted', 'Triumphant',
  'Invincible', 'Unyielding', 'Resolute', 'Stalwart', 'Righteous', 'Vengeful',
];

const NOUNS = [
  // Abstract Concepts
  'Flame', 'Frost', 'Thunder', 'Lightning', 'Storm', 'Tempest', 'Fury',
  'Wrath', 'Vengeance', 'Justice', 'Mercy', 'Grace', 'Glory', 'Honor',
  'Valor', 'Courage', 'Wisdom', 'Knowledge', 'Truth', 'Power', 'Might',
  // Celestial
  'Stars', 'Moon', 'Sun', 'Dawn', 'Dusk', 'Twilight', 'Night', 'Day',
  'Eclipse', 'Cosmos', 'Heaven', 'Eternity', 'Infinity', 'Destiny', 'Fate',
  // Elements
  'Fire', 'Ice', 'Earth', 'Wind', 'Water', 'Shadow', 'Light', 'Darkness',
  'Ash', 'Ember', 'Cinder', 'Blaze', 'Inferno', 'Glacier', 'Avalanche',
  // Creatures
  'Dragon', 'Phoenix', 'Hydra', 'Wyrm', 'Serpent', 'Griffin', 'Basilisk',
  'Demon', 'Angel', 'Titan', 'Giant', 'Lich', 'Vampire', 'Werewolf',
  // Places/Realms
  'Abyss', 'Void', 'Realm', 'Kingdom', 'Empire', 'Dominion', 'Domain',
  'Netherworld', 'Underworld', 'Feywild', 'Shadowfell', 'Astral', 'Ethereal',
  // Nature
  'Mountain', 'Ocean', 'Forest', 'Desert', 'Tundra', 'Jungle', 'Swamp',
  'River', 'Sky', 'Earth', 'Stone', 'Iron', 'Blood', 'Bone', 'Soul',
  // Heroes/Deities
  'Kings', 'Queens', 'Lords', 'Champions', 'Heroes', 'Legends', 'Ancients',
  'Gods', 'Titans', 'Spirits', 'Ancestors', 'Fallen', 'Chosen', 'Damned',
];

/**
 * Generate a random fantasy item name
 * @returns A random name like "Blazing Sword" or "Ring of Flame"
 */
export function generateRandomItemName(): string {
  const useOfFormat = Math.random() > 0.5;

  if (useOfFormat) {
    // "[Object] of [Noun]" format
    const object = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${object} of ${noun}`;
  } else {
    // "[Adjective] [Object]" format
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const object = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    return `${adjective} ${object}`;
  }
}

// Export the arrays in case they're needed elsewhere
export { OBJECTS, ADJECTIVES, NOUNS };
