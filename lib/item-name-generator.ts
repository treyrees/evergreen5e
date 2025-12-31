// Advanced Fantasy Item Name Generator
// Generates names using diverse patterns inspired by legendary items from
// Tolkien, D&D, Warhammer, video games, and mythology.
//
// Pattern types include:
// - Compound words (Stormbringer, Frostmourne, Shadowbane)
// - Named items with epithets (Glamdring, the Foe-hammer)
// - Possessive forms (The Dragon's Tooth)
// - Cultural/archaic styles (Andúril, Mjölnir)
// - Classic fantasy patterns (Sword of Flames, Blazing Shield)

// ============================================================================
// VOCABULARY DATABASES
// ============================================================================

const OBJECTS = [
  // Melee Weapons - Swords
  'Sword', 'Blade', 'Longsword', 'Greatsword', 'Shortsword', 'Rapier', 'Scimitar',
  'Claymore', 'Falchion', 'Cutlass', 'Saber', 'Katana', 'Gladius', 'Zweihander',
  // Melee Weapons - Daggers
  'Dagger', 'Dirk', 'Stiletto', 'Kris', 'Kukri', 'Tanto', 'Knife', 'Shiv',
  // Melee Weapons - Axes
  'Axe', 'Battleaxe', 'Greataxe', 'Hatchet', 'Cleaver', 'Tomahawk', 'Labrys',
  // Melee Weapons - Bludgeoning
  'Mace', 'Morningstar', 'Flail', 'Warhammer', 'Maul', 'Club', 'Cudgel', 'Scepter',
  // Melee Weapons - Polearms
  'Spear', 'Lance', 'Halberd', 'Glaive', 'Pike', 'Trident', 'Javelin', 'Partisan',
  'Quarterstaff', 'Poleaxe', 'Bardiche', 'Voulge', 'Naginata',
  // Exotic/Unusual
  'Whip', 'Scythe', 'Sickle', 'Claw', 'Fang', 'Talon', 'Hook',
  // Ranged Weapons
  'Bow', 'Longbow', 'Shortbow', 'Crossbow', 'Arbalest', 'Sling',
  // Armor
  'Shield', 'Buckler', 'Aegis', 'Bulwark', 'Armor', 'Plate', 'Mail',
  'Helm', 'Helmet', 'Crown', 'Coif', 'Greathelm', 'Visor',
  'Gauntlets', 'Bracers', 'Vambraces', 'Gloves', 'Fists',
  'Breastplate', 'Cuirass', 'Hauberk', 'Brigandine', 'Jerkin',
  'Greaves', 'Sabatons', 'Boots', 'Treads',
  'Pauldrons', 'Spaulders', 'Mantle',
  // Accessories - Jewelry
  'Ring', 'Band', 'Signet', 'Loop',
  'Amulet', 'Pendant', 'Necklace', 'Choker', 'Torc', 'Gorget',
  'Circlet', 'Diadem', 'Tiara', 'Coronet',
  'Bracelet', 'Armlet', 'Bangle', 'Cuff',
  'Brooch', 'Medallion', 'Badge', 'Pin', 'Clasp',
  // Accessories - Clothing
  'Cloak', 'Cape', 'Shroud', 'Cowl', 'Hood',
  'Robe', 'Vestments', 'Raiment', 'Garb', 'Mantle',
  'Belt', 'Sash', 'Girdle', 'Cincture',
  'Sandals', 'Slippers', 'Wraps',
  // Magic Implements
  'Staff', 'Stave', 'Cane', 'Crook',
  'Wand', 'Rod', 'Baton', 'Switch',
  'Orb', 'Sphere', 'Globe', 'Eye',
  'Tome', 'Grimoire', 'Codex', 'Lexicon', 'Scroll', 'Folio',
  'Talisman', 'Focus', 'Fetish', 'Icon', 'Idol',
  // Artifacts & Relics
  'Chalice', 'Grail', 'Goblet', 'Cup', 'Vessel',
  'Horn', 'Bugle', 'Trumpet', 'Clarion',
  'Lantern', 'Lamp', 'Beacon', 'Torch', 'Candle', 'Censer',
  'Mirror', 'Glass', 'Reflection',
  'Compass', 'Sundial', 'Hourglass', 'Astrolabe',
  'Locket', 'Reliquary', 'Casket', 'Coffer',
  'Bell', 'Chime', 'Gong',
  'Mask', 'Visage', 'Face', 'Guise',
  'Key', 'Lock', 'Seal', 'Sigil',
  // Body Parts (as items)
  'Skull', 'Hand', 'Heart', 'Eye', 'Tooth', 'Claw', 'Talon',
  'Bone', 'Spine', 'Rib', 'Finger', 'Fist',
  'Feather', 'Scale', 'Hide', 'Pelt', 'Wing',
  // Natural Objects
  'Crystal', 'Gem', 'Stone', 'Shard', 'Fragment',
  'Pearl', 'Opal', 'Diamond', 'Ruby', 'Sapphire', 'Emerald',
  'Coin', 'Token', 'Rune', 'Glyph',
];

const ADJECTIVES = [
  // Elemental - Fire
  'Blazing', 'Burning', 'Smoldering', 'Scorching', 'Searing', 'Molten',
  'Volcanic', 'Incandescent', 'Pyretic', 'Cinderous', 'Ashen',
  // Elemental - Ice
  'Frozen', 'Icy', 'Frigid', 'Glacial', 'Frostbitten', 'Hoarfrost',
  'Crystalline', 'Permafrost', 'Boreal', 'Hyperborean', 'Rime-touched',
  // Elemental - Storm
  'Thundering', 'Stormy', 'Tempestuous', 'Crackling', 'Howling',
  'Roaring', 'Raging', 'Furious', 'Wrathful', 'Cyclonic', 'Galvanic',
  // Light
  'Radiant', 'Luminous', 'Gleaming', 'Shimmering', 'Glowing', 'Brilliant',
  'Resplendent', 'Incandescent', 'Auroral', 'Prismatic', 'Scintillating',
  'Sunlit', 'Starlit', 'Moonlit', 'Dawnlit', 'Lambent',
  // Dark
  'Shadow', 'Dark', 'Obsidian', 'Ebony', 'Twilight', 'Midnight', 'Umbral',
  'Tenebrous', 'Stygian', 'Abyssal', 'Void-touched', 'Lightless', 'Crepuscular',
  // Precious Materials
  'Golden', 'Silver', 'Crystal', 'Diamond', 'Ruby', 'Emerald', 'Sapphire',
  'Platinum', 'Electrum', 'Amethyst', 'Onyx', 'Opal', 'Pearl', 'Jade',
  // Fantasy Materials
  'Iron', 'Steel', 'Adamantine', 'Mithral', 'Orichalcum', 'Bronze', 'Meteoric',
  'Starforged', 'Soulforged', 'Runeforged', 'Wraithforged', 'Voidforged',
  // Nature
  'Verdant', 'Thorned', 'Sylvan', 'Feral', 'Primal', 'Ancient', 'Wild',
  'Blooming', 'Withered', 'Petrified', 'Fossilized', 'Living', 'Evergreen',
  // Creatures
  'Serpentine', 'Draconic', 'Wyrmscale', 'Phoenixborn', 'Hydra-blooded',
  'Demonic', 'Angelic', 'Seraphic', 'Infernal', 'Celestial', 'Titanic',
  // Otherworldly
  'Feywild', 'Shadowfell', 'Astral', 'Ethereal', 'Planar', 'Dimensional',
  'Eldritch', 'Aberrant', 'Alien', 'Otherworldly', 'Liminal',
  // Cosmic
  'Lunar', 'Solar', 'Stellar', 'Cosmic', 'Astral', 'Celestial',
  'Nebular', 'Galactic', 'Eclipsed', 'Void', 'Infinite',
  // Power
  'Mighty', 'Formidable', 'Devastating', 'Legendary', 'Mythic', 'Epic',
  'Supreme', 'Ultimate', 'Paramount', 'Peerless', 'Matchless', 'Unrivaled',
  // Divine
  'Divine', 'Sacred', 'Holy', 'Blessed', 'Hallowed', 'Consecrated', 'Sanctified',
  'Cursed', 'Damned', 'Forsaken', 'Unholy', 'Profane', 'Accursed', 'Blighted',
  // Magical
  'Enchanted', 'Arcane', 'Mystic', 'Runic', 'Hexed', 'Charmed', 'Bewitched',
  'Spellbound', 'Ensorcelled', 'Thaumic', 'Sorcerous', 'Magical',
  // Qualities - Combat
  'Swift', 'Keen', 'Vorpal', 'Piercing', 'Crushing', 'Cleaving', 'Rending',
  'Sundering', 'Shattering', 'Annihilating', 'Obliterating',
  // Qualities - Poison/Death
  'Venomous', 'Toxic', 'Pestilent', 'Virulent', 'Necrotic', 'Withering',
  'Life-drinking', 'Soul-rending', 'Grave-touched', 'Deathly',
  // Qualities - Stealth
  'Silent', 'Whispering', 'Hushed', 'Muffled', 'Unseen', 'Invisible',
  'Phantom', 'Spectral', 'Ethereal', 'Ghostly', 'Wraithlike', 'Shadowed',
  // Heroic
  'Valiant', 'Noble', 'Royal', 'Imperial', 'Regal', 'Exalted', 'Triumphant',
  'Glorious', 'Heroic', 'Legendary', 'Fabled', 'Storied', 'Renowned',
  // Indomitable
  'Invincible', 'Unyielding', 'Unbreakable', 'Indomitable', 'Unconquerable',
  'Resolute', 'Stalwart', 'Steadfast', 'Immovable', 'Eternal', 'Undying',
  // Moral/Alignment
  'Righteous', 'Vengeful', 'Wrathful', 'Merciful', 'Judging', 'Redeeming',
  'Corrupting', 'Purifying', 'Cleansing', 'Defiling',
  // Age/Time
  'Ancient', 'Primordial', 'Timeless', 'Ageless', 'Forgotten', 'Lost',
  'First', 'Last', 'Final', 'Eternal', 'Everlasting', 'Sempiternal',
  // Unique Qualities
  'Singing', 'Weeping', 'Laughing', 'Screaming', 'Howling', 'Keening',
  'Sleeping', 'Dreaming', 'Waking', 'Hungering', 'Thirsting',
];

const NOUNS = [
  // Abstract Concepts - Virtues
  'Valor', 'Courage', 'Honor', 'Glory', 'Triumph', 'Victory', 'Conquest',
  'Wisdom', 'Knowledge', 'Truth', 'Justice', 'Mercy', 'Grace', 'Hope',
  'Faith', 'Devotion', 'Sacrifice', 'Martyrdom', 'Redemption', 'Salvation',
  // Abstract Concepts - Power
  'Power', 'Might', 'Strength', 'Dominion', 'Authority', 'Sovereignty',
  'Supremacy', 'Mastery', 'Command', 'Control', 'Will', 'Resolve',
  // Abstract Concepts - Negative
  'Wrath', 'Fury', 'Rage', 'Vengeance', 'Retribution', 'Ruin', 'Doom',
  'Despair', 'Sorrow', 'Anguish', 'Torment', 'Suffering', 'Oblivion',
  'Entropy', 'Chaos', 'Madness', 'Insanity', 'Nightmares', 'Dread',
  // Celestial Bodies
  'Sun', 'Moon', 'Stars', 'Dawn', 'Dusk', 'Twilight', 'Midnight', 'Noon',
  'Eclipse', 'Solstice', 'Equinox', 'Aurora', 'Zenith', 'Nadir',
  'Cosmos', 'Heavens', 'Firmament', 'Constellations', 'Galaxies',
  // Celestial Concepts
  'Eternity', 'Infinity', 'Destiny', 'Fate', 'Providence', 'Fortune',
  'Time', 'Ages', 'Eons', 'Epochs', 'Millennia', 'Cycles',
  // Elements - Fire
  'Flame', 'Fire', 'Blaze', 'Inferno', 'Conflagration', 'Pyre',
  'Ember', 'Cinder', 'Ash', 'Spark', 'Brand', 'Hearth',
  // Elements - Ice/Water
  'Frost', 'Ice', 'Glacier', 'Avalanche', 'Blizzard', 'Winter',
  'Water', 'Sea', 'Ocean', 'Tide', 'Wave', 'Deluge', 'Flood', 'Maelstrom',
  'Rain', 'Mist', 'Fog', 'Dew', 'Tears',
  // Elements - Storm
  'Storm', 'Tempest', 'Thunder', 'Lightning', 'Cyclone', 'Hurricane',
  'Typhoon', 'Tornado', 'Gale', 'Squall', 'Whirlwind',
  // Elements - Earth
  'Stone', 'Rock', 'Mountain', 'Peak', 'Summit', 'Crag', 'Cliff',
  'Earth', 'Ground', 'Soil', 'Sand', 'Dust', 'Clay',
  'Iron', 'Steel', 'Metal', 'Ore', 'Crystal', 'Gem',
  // Elements - Air
  'Wind', 'Gust', 'Breeze', 'Zephyr', 'Air', 'Sky', 'Cloud', 'Mist',
  // Elements - Light/Dark
  'Light', 'Radiance', 'Brilliance', 'Luminance', 'Glow',
  'Shadow', 'Darkness', 'Night', 'Void', 'Abyss', 'Umbra', 'Penumbra',
  // Creatures - Dragons
  'Dragon', 'Wyrm', 'Drake', 'Wyvern', 'Serpent', 'Lindworm',
  // Creatures - Mythological
  'Phoenix', 'Griffin', 'Hydra', 'Basilisk', 'Chimera', 'Manticore',
  'Unicorn', 'Pegasus', 'Sphinx', 'Cerberus', 'Kraken', 'Leviathan',
  // Creatures - Divine
  'Angel', 'Seraph', 'Cherub', 'Archon', 'Celestial',
  'Demon', 'Devil', 'Fiend', 'Imp', 'Succubus', 'Incubus',
  // Creatures - Undead
  'Lich', 'Vampire', 'Wraith', 'Specter', 'Ghost', 'Shade', 'Revenant',
  'Skeleton', 'Zombie', 'Ghoul', 'Banshee', 'Poltergeist',
  // Creatures - Giants
  'Titan', 'Giant', 'Colossus', 'Cyclops', 'Golem', 'Behemoth',
  // Creatures - Fey
  'Fey', 'Fairy', 'Sprite', 'Pixie', 'Nymph', 'Dryad', 'Satyr',
  // Creatures - Other
  'Wolf', 'Raven', 'Eagle', 'Hawk', 'Falcon', 'Owl', 'Serpent', 'Spider',
  'Bear', 'Lion', 'Tiger', 'Panther', 'Stag', 'Boar', 'Bull',
  // Places/Realms
  'Abyss', 'Void', 'Chasm', 'Pit', 'Depths',
  'Realm', 'Kingdom', 'Empire', 'Dominion', 'Domain', 'Throne',
  'Heaven', 'Paradise', 'Elysium', 'Valhalla', 'Nirvana',
  'Hell', 'Netherworld', 'Underworld', 'Hades', 'Tartarus', 'Gehenna',
  'Feywild', 'Shadowfell', 'Ethereal', 'Astral', 'Limbo',
  // Nature - Terrain
  'Forest', 'Wood', 'Grove', 'Glade', 'Thicket', 'Jungle',
  'Desert', 'Wasteland', 'Barrens', 'Dunes', 'Oasis',
  'Tundra', 'Taiga', 'Steppe', 'Plains', 'Meadow', 'Field',
  'Swamp', 'Marsh', 'Bog', 'Fen', 'Mire', 'Morass',
  'River', 'Lake', 'Pond', 'Spring', 'Falls', 'Rapids',
  // Nature - Flora
  'Rose', 'Thorn', 'Vine', 'Root', 'Branch', 'Leaf', 'Blossom', 'Bloom',
  'Oak', 'Ash', 'Yew', 'Willow', 'Elder', 'Rowan', 'Hawthorn',
  // Life/Death
  'Life', 'Death', 'Birth', 'Rebirth', 'Resurrection', 'Reincarnation',
  'Soul', 'Spirit', 'Essence', 'Anima', 'Psyche',
  'Blood', 'Bone', 'Flesh', 'Heart', 'Mind', 'Body',
  // Beings - Mortals
  'King', 'Queen', 'Lord', 'Lady', 'Prince', 'Princess',
  'Emperor', 'Empress', 'Khan', 'Sultan', 'Pharaoh', 'Tsar',
  'Knight', 'Champion', 'Hero', 'Warrior', 'Paladin', 'Crusader',
  'Wizard', 'Sorcerer', 'Mage', 'Warlock', 'Witch', 'Necromancer',
  'Prophet', 'Oracle', 'Seer', 'Sage', 'Saint', 'Martyr',
  'Thief', 'Assassin', 'Rogue', 'Shadow', 'Phantom',
  // Beings - Groups
  'Kings', 'Queens', 'Lords', 'Champions', 'Heroes', 'Legends',
  'Ancients', 'Elders', 'Ancestors', 'Forebears', 'Progenitors',
  'Gods', 'Titans', 'Giants', 'Dragons', 'Demons', 'Angels',
  'Spirits', 'Ghosts', 'Shades', 'Phantoms', 'Wraiths',
  'Fallen', 'Chosen', 'Damned', 'Blessed', 'Forsaken', 'Exiled',
  // Abstract Entities
  'Dreamer', 'Sleeper', 'Watcher', 'Guardian', 'Sentinel', 'Keeper',
  'Hunter', 'Slayer', 'Destroyer', 'Creator', 'Maker', 'Shaper',
  'Bringer', 'Bearer', 'Wielder', 'Master', 'Mistress',
];

// ============================================================================
// COMPOUND WORD COMPONENTS (for "Stormbringer" style names)
// ============================================================================

const COMPOUND_PREFIXES = [
  // Elements
  'Storm', 'Thunder', 'Lightning', 'Fire', 'Flame', 'Frost', 'Ice', 'Snow',
  'Wind', 'Rain', 'Sun', 'Moon', 'Star', 'Shadow', 'Dark', 'Light', 'Night',
  'Dawn', 'Dusk', 'Twilight', 'Blood', 'Soul', 'Spirit', 'Death', 'Life',
  'Doom', 'Fate', 'War', 'Peace', 'Wrath', 'Rage', 'Fury', 'Grief', 'Sorrow',
  'Dream', 'Nightmare', 'Fear', 'Dread', 'Hope', 'Glory', 'Honor', 'Truth',
  // Creatures
  'Dragon', 'Wyrm', 'Wolf', 'Raven', 'Eagle', 'Hawk', 'Bear', 'Lion', 'Tiger',
  'Serpent', 'Viper', 'Spider', 'Scorpion', 'Phoenix', 'Demon', 'Devil', 'Angel',
  // Nature
  'Stone', 'Iron', 'Steel', 'Gold', 'Silver', 'Crystal', 'Bone', 'Thorn',
  'Oak', 'Ash', 'Yew', 'Moss', 'Vine', 'Root', 'Sea', 'Ocean', 'Earth', 'Sky',
  // Body
  'Heart', 'Mind', 'Eye', 'Fang', 'Claw', 'Wing', 'Skull', 'Hand', 'Fist',
  // Concepts
  'King', 'Lord', 'God', 'Hell', 'Heaven', 'World', 'Realm', 'Crown', 'Throne',
  'Oath', 'Vow', 'Curse', 'Hex', 'Spell', 'Rune', 'Sigil', 'Glyph',
];

const COMPOUND_SUFFIXES = [
  // Action/Bringing
  'bringer', 'bearer', 'caller', 'singer', 'speaker', 'whisper', 'weaver',
  'walker', 'dancer', 'runner', 'rider', 'seeker', 'finder', 'hunter',
  'keeper', 'watcher', 'guardian', 'warden', 'sentinel',
  // Destructive
  'breaker', 'shatter', 'crusher', 'render', 'ripper', 'splitter', 'cleaver',
  'slayer', 'killer', 'bane', 'doom', 'death', 'end', 'fall', 'ruin',
  'reaver', 'ravager', 'devourer', 'eater', 'drinker', 'thirst',
  // Creative/Giving
  'giver', 'maker', 'shaper', 'forger', 'smith', 'wright', 'crafter',
  'healer', 'mender', 'binder', 'welder', 'joiner',
  // Mastery
  'master', 'lord', 'king', 'queen', 'prince', 'blade', 'edge', 'point',
  'heart', 'soul', 'spirit', 'fire', 'flame', 'frost', 'storm',
  // Physical
  'fang', 'claw', 'talon', 'horn', 'thorn', 'spine', 'scale', 'hide',
  'wing', 'eye', 'tooth', 'bite', 'grip', 'hold', 'grasp',
  // States
  'born', 'touched', 'kissed', 'blessed', 'cursed', 'marked', 'scarred',
  'forged', 'wrought', 'hewn', 'carved', 'sung', 'sworn',
  // Movement
  'stride', 'step', 'flight', 'fall', 'rise', 'surge', 'rush', 'charge',
  // Endings
  'mourne', 'weep', 'cry', 'wail', 'howl', 'roar', 'scream', 'song',
  'light', 'glow', 'shine', 'gleam', 'shadow', 'shade', 'shroud',
];

// ============================================================================
// PROPER NAMES (for legendary items with unique names)
// ============================================================================

const PROPER_NAMES = {
  // Elvish/Sindarin-inspired
  elvish: [
    'Aranrúth', 'Aeglos', 'Anglachel', 'Anguirel', 'Belthronding', 'Dramborleg',
    'Glamdring', 'Grond', 'Gurthang', 'Hadhafang', 'Narsil', 'Andúril', 'Orcrist',
    'Ringil', 'Calembel', 'Edhelharn', 'Galadhrim', 'Ithildin', 'Mithrellas',
    'Nimphelos', 'Silmaril', 'Telperion', 'Laurelin', 'Vingilot', 'Celebrant',
    'Elanor', 'Galathil', 'Hirilorn', 'Lúthien', 'Melian', 'Nimloth', 'Seregon',
    'Silpion', 'Tasarinan', 'Tirion', 'Valimar', 'Vinyamar', 'Menegroth',
  ],
  // Dwarven/Khuzdul-inspired
  dwarven: [
    'Aegisbane', 'Azaghâl', 'Baruk', 'Durin', 'Fundin', 'Gamil', 'Gróin',
    'Khazâd', 'Kibil', 'Mahal', 'Nauglamír', 'Nargûn', 'Telchar', 'Thráin',
    'Thorin', 'Zirak', 'Zigil', 'Bundushathûr', 'Barazinbar', 'Gundabad',
    'Dolgthrasir', 'Anvilmaw', 'Forgemaster', 'Deepdelve', 'Ironfoot',
    'Stonehelm', 'Battlehammer', 'Grudgebearer', 'Oathkeeper', 'Runemaster',
  ],
  // Nordic/Old Norse-inspired
  nordic: [
    'Mjölnir', 'Gungnir', 'Gram', 'Tyrfing', 'Dáinsleif', 'Skofnung', 'Freyr',
    'Hrotti', 'Ridill', 'Lævateinn', 'Mistilteinn', 'Dragvandil', 'Gjallarhorn',
    'Brísingamen', 'Gleipnir', 'Megingjörð', 'Járngreipr', 'Andvaranaut',
    'Hringhorni', 'Skíðblaðnir', 'Naglfar', 'Svalinn', 'Hræsvelgr', 'Níðhöggr',
    'Fenrisúlfr', 'Jörmungandr', 'Yggdrasil', 'Bifröst', 'Valhöll', 'Ragnarök',
  ],
  // Ancient/Classical-inspired
  ancient: [
    'Excalibur', 'Caliburn', 'Clarent', 'Durendal', 'Joyeuse', 'Cortana',
    'Ascalon', 'Chrysaor', 'Harpe', 'Kusanagi', 'Amenonuhoko', 'Tonbogiri',
    'Honjo', 'Masamune', 'Muramasa', 'Kogarasumaru', 'Onimaru', 'Dojigiri',
    'Crocea', 'Galatine', 'Arondight', 'Carnwennan', 'Rhongomyniad', 'Pridwen',
    'Caladbolg', 'Fragarach', 'Gáe Bulg', 'Moralltach', 'Claiomh', 'Cruaidín',
  ],
  // Dark/Sinister
  dark: [
    'Mournblade', 'Soulreaper', 'Grimfang', 'Voidheart', 'Netherbane', 'Dreadmaw',
    'Shadowmere', 'Darkbane', 'Blightbringer', 'Cursemark', 'Doomwhisper',
    'Maledicta', 'Nightfall', 'Oblivion', 'Perdition', 'Ruination', 'Torment',
    'Anguish', 'Despair', 'Entropy', 'Nihilus', 'Mortis', 'Tenebris', 'Umbris',
    'Noxius', 'Veneficus', 'Maleficus', 'Profanus', 'Abyssus', 'Infernus',
  ],
  // Celestial/Divine
  celestial: [
    'Solarius', 'Lunaris', 'Stellaris', 'Aethon', 'Helios', 'Selene', 'Aurora',
    'Celestine', 'Divinus', 'Sanctus', 'Gloriana', 'Seraphiel', 'Luminary',
    'Radiance', 'Brilliance', 'Resplendence', 'Magnificat', 'Hosanna', 'Alleluia',
    'Benedictus', 'Salvator', 'Redeemer', 'Providence', 'Fortuna', 'Destinatus',
  ],
  // Constructed/Fantasy
  fantasy: [
    'Aetherblade', 'Arcanix', 'Chromatus', 'Crystallum', 'Draconis', 'Eldrium',
    'Feroxia', 'Glacium', 'Hexadria', 'Ignium', 'Judicatum', 'Kinetica',
    'Luminex', 'Magistrum', 'Nexarium', 'Omnifex', 'Primordius', 'Quintessa',
    'Runicus', 'Sceptrum', 'Tempestus', 'Ultimatum', 'Vexillum', 'Wyrmwood',
    'Xenolith', 'Ysgramor', 'Zenithar', 'Azurium', 'Beryllix', 'Carbunculus',
  ],
};

// ============================================================================
// EPITHETS (for "Glamdring, the Foe-hammer" style names)
// ============================================================================

const EPITHETS = {
  // Combat prowess
  slayer: [
    'Foe-hammer', 'Dragon-slayer', 'Giant-killer', 'Demon-bane', 'Lich-render',
    'Orc-cleaver', 'Troll-crusher', 'Undead-scourge', 'Fiend-piercer',
    'Beast-tamer', 'Monster-hunter', 'Tyrant-breaker', 'Usurper-bane',
    'King-maker', 'Kingdom-ender', 'Empire-shatter', 'Throne-taker',
    'World-breaker', 'Realm-render', 'Doom-bringer', 'Death-dealer',
  ],
  // Descriptive
  descriptive: [
    'the Merciless', 'the Pitiless', 'the Relentless', 'the Unyielding',
    'the Invincible', 'the Unconquerable', 'the Unbreakable', 'the Indomitable',
    'the Terrible', 'the Dreadful', 'the Fearsome', 'the Horrific',
    'the Magnificent', 'the Glorious', 'the Resplendent', 'the Radiant',
    'the Eternal', 'the Ageless', 'the Timeless', 'the Immortal',
    'the Cursed', 'the Damned', 'the Forsaken', 'the Forgotten',
    'the Hidden', 'the Lost', 'the Legendary', 'the Mythic',
  ],
  // Elemental
  elemental: [
    'Flame-tongue', 'Frost-brand', 'Storm-caller', 'Thunder-voice',
    'Lightning-strike', 'Wind-dancer', 'Earth-shaker', 'Wave-rider',
    'Sun-forged', 'Moon-blessed', 'Star-born', 'Void-touched',
    'Shadow-weaver', 'Light-bringer', 'Dark-herald', 'Twilight-walker',
    'Fire-heart', 'Ice-veined', 'Stone-souled', 'Steel-blooded',
  ],
  // Titles
  titles: [
    'Defender of the Realm', 'Guardian of the Gate', 'Keeper of Secrets',
    'Warden of the North', 'Sentinel of Dawn', 'Harbinger of Dusk',
    'Herald of War', 'Prophet of Doom', 'Voice of Thunder', 'Hand of Justice',
    'Eye of the Storm', 'Heart of the Mountain', 'Soul of the Forest',
    'Breath of Winter', 'Kiss of Death', 'Touch of Madness', 'Whisper of Fate',
    'Blade of Kings', 'Shield of the Faithful', 'Banner of the Fallen',
  ],
  // Poetic
  poetic: [
    'that Sings of Sorrow', 'that Weeps for the Lost', 'that Dreams of Blood',
    'that Hungers Eternal', 'that Knows No Rest', 'that Fears No Evil',
    'which Shattered the Gate', 'which Sundered the Mountain', 'which Quelled the Storm',
    'forged in Dragonfire', 'tempered in Tears', 'quenched in Blood',
    'born of Starlight', 'wrought of Moonbeams', 'carved from Shadow',
    'blessed by Saints', 'cursed by Devils', 'touched by Gods',
  ],
};

// ============================================================================
// CONNECTING WORDS AND PHRASES
// ============================================================================

const CONNECTORS = {
  possession: ['of', 'of the'],
  origin: ['from', 'from the', 'of the'],
  dedication: ['for', 'for the', 'unto', 'unto the'],
  against: ['against', 'against the', 'versus'],
};

const ARTICLES = {
  definite: ['the'],
  possessive: ["'s"],
};

// ============================================================================
// NAME PATTERN DEFINITIONS
// ============================================================================

interface NamePattern {
  weight: number;
  generate: () => string;
}

// Helper functions
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickCategory<T>(obj: Record<string, T[]>): T {
  const keys = Object.keys(obj);
  const category = keys[Math.floor(Math.random() * keys.length)];
  return pick(obj[category]);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function pluralize(word: string): string {
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') ||
      word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  if (word.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(word.charAt(word.length - 2))) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('f')) {
    return word.slice(0, -1) + 'ves';
  }
  if (word.endsWith('fe')) {
    return word.slice(0, -2) + 'ves';
  }
  return word + 's';
}

// Pattern definitions with weights (higher = more common)
const NAME_PATTERNS: NamePattern[] = [
  // ============================================
  // COMMON PATTERNS (weight: 15-20)
  // ============================================

  // "[Adjective] [Object]" - e.g., "Blazing Sword"
  {
    weight: 20,
    generate: () => `${pick(ADJECTIVES)} ${pick(OBJECTS)}`,
  },

  // "[Object] of [Noun]" - e.g., "Ring of Flame"
  {
    weight: 20,
    generate: () => `${pick(OBJECTS)} of ${pick(NOUNS)}`,
  },

  // "[Object] of the [Noun]" - e.g., "Blade of the Phoenix"
  {
    weight: 15,
    generate: () => `${pick(OBJECTS)} of the ${pick(NOUNS)}`,
  },

  // ============================================
  // MEDIUM PATTERNS (weight: 8-12)
  // ============================================

  // "The [Adjective] [Object]" - e.g., "The Frozen Blade"
  {
    weight: 12,
    generate: () => `The ${pick(ADJECTIVES)} ${pick(OBJECTS)}`,
  },

  // "[Noun]'s [Object]" - e.g., "Dragon's Claw"
  {
    weight: 12,
    generate: () => `${pick(NOUNS)}'s ${pick(OBJECTS)}`,
  },

  // "The [Noun]'s [Object]" - e.g., "The Phoenix's Feather"
  {
    weight: 10,
    generate: () => `The ${pick(NOUNS)}'s ${pick(OBJECTS)}`,
  },

  // "[Adjective] [Object] of [Noun]" - e.g., "Ancient Blade of Kings"
  {
    weight: 10,
    generate: () => `${pick(ADJECTIVES)} ${pick(OBJECTS)} of ${pick(NOUNS)}`,
  },

  // "[Object] of [Adjective] [Noun]" - e.g., "Sword of Eternal Flame"
  {
    weight: 10,
    generate: () => `${pick(OBJECTS)} of ${pick(ADJECTIVES)} ${pick(NOUNS)}`,
  },

  // "[Adjective] [Object] of the [Noun]" - e.g., "Holy Sword of the Crusader"
  {
    weight: 8,
    generate: () => `${pick(ADJECTIVES)} ${pick(OBJECTS)} of the ${pick(NOUNS)}`,
  },

  // ============================================
  // COMPOUND PATTERNS (weight: 6-10)
  // ============================================

  // Compound word - e.g., "Stormbringer", "Frostmourne"
  {
    weight: 10,
    generate: () => capitalize(`${pick(COMPOUND_PREFIXES)}${pick(COMPOUND_SUFFIXES)}`),
  },

  // "The [Compound]" - e.g., "The Worldbreaker"
  {
    weight: 6,
    generate: () => `The ${capitalize(pick(COMPOUND_PREFIXES))}${pick(COMPOUND_SUFFIXES)}`,
  },

  // ============================================
  // PROPER NAME PATTERNS (weight: 4-8)
  // ============================================

  // Just a proper name - e.g., "Excalibur"
  {
    weight: 8,
    generate: () => pickCategory(PROPER_NAMES),
  },

  // "[ProperName], the [Epithet]" - e.g., "Glamdring, the Foe-hammer"
  {
    weight: 6,
    generate: () => {
      const name = pickCategory(PROPER_NAMES);
      const epithet = pickCategory(EPITHETS);
      return `${name}, ${epithet}`;
    },
  },

  // "The [ProperName]" - e.g., "The Andúril"
  {
    weight: 4,
    generate: () => `The ${pickCategory(PROPER_NAMES)}`,
  },

  // ============================================
  // ELABORATE PATTERNS (weight: 3-6)
  // ============================================

  // "[Object] of the [Plural Noun]" - e.g., "Crown of the Fallen Kings"
  {
    weight: 6,
    generate: () => {
      const noun = pick(NOUNS);
      const adjective = pick(ADJECTIVES);
      return `${pick(OBJECTS)} of the ${adjective} ${pluralize(noun)}`;
    },
  },

  // "The [Adjective] [Object] of the [Noun]" - e.g., "The Ancient Tome of the Magi"
  {
    weight: 5,
    generate: () => `The ${pick(ADJECTIVES)} ${pick(OBJECTS)} of the ${pick(NOUNS)}`,
  },

  // "[Noun]-[Suffix] [Object]" - e.g., "Doom-forged Blade"
  {
    weight: 5,
    generate: () => {
      const prefix = pick(COMPOUND_PREFIXES);
      const suffix = pick(['forged', 'blessed', 'cursed', 'touched', 'born', 'wrought', 'hewn', 'carved']);
      return `${prefix}-${suffix} ${pick(OBJECTS)}`;
    },
  },

  // "[Object] [Epithet]" - e.g., "Blade that Sings of Sorrow"
  {
    weight: 4,
    generate: () => {
      const object = pick(OBJECTS);
      const epithet = pick(EPITHETS.poetic);
      return `${object} ${epithet}`;
    },
  },

  // ============================================
  // RARE/EPIC PATTERNS (weight: 1-3)
  // ============================================

  // Full title - "[ProperName], [Object] of [Noun]"
  {
    weight: 3,
    generate: () => {
      const name = pickCategory(PROPER_NAMES);
      const object = pick(OBJECTS);
      const noun = pick(NOUNS);
      return `${name}, ${object} of ${noun}`;
    },
  },

  // "[ProperName], the [Adjective] [Object]"
  {
    weight: 3,
    generate: () => {
      const name = pickCategory(PROPER_NAMES);
      const adj = pick(ADJECTIVES);
      const obj = pick(OBJECTS);
      return `${name}, the ${adj} ${obj}`;
    },
  },

  // Poetic construction - "The [Noun] of [Noun]'s [Noun]"
  {
    weight: 2,
    generate: () => {
      return `The ${pick(OBJECTS)} of ${pick(NOUNS)}'s ${pick(NOUNS)}`;
    },
  },

  // Legendary title - "[ProperName], [Slayer-Epithet], [Object] of the [Noun]"
  {
    weight: 1,
    generate: () => {
      const name = pickCategory(PROPER_NAMES);
      const epithet = pick(EPITHETS.slayer);
      const noun = pick(NOUNS);
      return `${name}, ${epithet}, Blade of the ${noun}`;
    },
  },

  // Triple compound - "[Prefix][Suffix] of [Noun]"
  {
    weight: 2,
    generate: () => {
      const compound = capitalize(`${pick(COMPOUND_PREFIXES)}${pick(COMPOUND_SUFFIXES)}`);
      return `${compound} of ${pick(NOUNS)}`;
    },
  },

  // Definite compound with noun - "The [Compound] of the [Noun]"
  {
    weight: 2,
    generate: () => {
      const compound = capitalize(`${pick(COMPOUND_PREFIXES)}${pick(COMPOUND_SUFFIXES)}`);
      return `The ${compound} of the ${pick(NOUNS)}`;
    },
  },
];

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================

/**
 * Generate a random fantasy item name using weighted pattern selection.
 *
 * Produces names in various styles:
 * - Simple: "Blazing Sword", "Ring of Flame"
 * - Compound: "Stormbringer", "Frostmourne"
 * - Named: "Excalibur", "Glamdring, the Foe-hammer"
 * - Elaborate: "The Ancient Blade of the Dragon Kings"
 *
 * @returns A randomly generated fantasy item name
 */
export function generateRandomItemName(): string {
  // Calculate total weight
  const totalWeight = NAME_PATTERNS.reduce((sum, p) => sum + p.weight, 0);

  // Random selection based on weight
  let random = Math.random() * totalWeight;

  for (const pattern of NAME_PATTERNS) {
    random -= pattern.weight;
    if (random <= 0) {
      return pattern.generate();
    }
  }

  // Fallback (should never reach here)
  return NAME_PATTERNS[0].generate();
}

/**
 * Generate multiple unique random names
 *
 * @param count Number of names to generate
 * @returns Array of unique fantasy item names
 */
export function generateMultipleNames(count: number): string[] {
  const names = new Set<string>();
  const maxAttempts = count * 3; // Prevent infinite loops
  let attempts = 0;

  while (names.size < count && attempts < maxAttempts) {
    names.add(generateRandomItemName());
    attempts++;
  }

  return Array.from(names);
}

/**
 * Generate a name matching a specific style
 *
 * @param style The style of name to generate
 * @returns A fantasy item name in the requested style
 */
export function generateNameByStyle(style: 'simple' | 'compound' | 'proper' | 'elaborate'): string {
  switch (style) {
    case 'simple':
      // "[Adjective] [Object]" or "[Object] of [Noun]"
      return Math.random() > 0.5
        ? `${pick(ADJECTIVES)} ${pick(OBJECTS)}`
        : `${pick(OBJECTS)} of ${pick(NOUNS)}`;

    case 'compound':
      // "Stormbringer" style
      return capitalize(`${pick(COMPOUND_PREFIXES)}${pick(COMPOUND_SUFFIXES)}`);

    case 'proper':
      // Named item, possibly with epithet
      const name = pickCategory(PROPER_NAMES);
      if (Math.random() > 0.5) {
        return `${name}, ${pickCategory(EPITHETS)}`;
      }
      return name;

    case 'elaborate':
      // Complex multi-part name
      const patterns = [
        () => `The ${pick(ADJECTIVES)} ${pick(OBJECTS)} of the ${pick(NOUNS)}`,
        () => `${pickCategory(PROPER_NAMES)}, ${pick(EPITHETS.slayer)}, ${pick(OBJECTS)} of ${pick(NOUNS)}`,
        () => `${pick(OBJECTS)} of the ${pick(ADJECTIVES)} ${pluralize(pick(NOUNS))}`,
      ];
      return pick(patterns)();

    default:
      return generateRandomItemName();
  }
}

// ============================================================================
// BASE ITEM TO OBJECT MAPPING
// ============================================================================

/**
 * Maps base item types to appropriate fantasy object names for thematic naming.
 * Used to generate item names that match the actual item type.
 */
const BASE_ITEM_OBJECTS: Record<string, string[]> = {
  // Swords
  'longsword': ['Sword', 'Blade', 'Longsword', 'Claymore', 'Saber'],
  'shortsword': ['Sword', 'Blade', 'Shortsword', 'Gladius', 'Falchion'],
  'greatsword': ['Sword', 'Blade', 'Greatsword', 'Claymore', 'Zweihander'],
  'rapier': ['Rapier', 'Blade', 'Sword', 'Stiletto'],
  'scimitar': ['Scimitar', 'Blade', 'Sword', 'Saber', 'Cutlass', 'Falchion'],

  // Daggers
  'dagger': ['Dagger', 'Blade', 'Dirk', 'Stiletto', 'Kris', 'Knife', 'Fang'],

  // Axes
  'battleaxe': ['Axe', 'Battleaxe', 'Cleaver', 'Labrys'],
  'greataxe': ['Axe', 'Greataxe', 'Cleaver', 'Labrys'],
  'handaxe': ['Axe', 'Hatchet', 'Tomahawk', 'Cleaver'],

  // Bludgeoning
  'club': ['Club', 'Cudgel', 'Mace'],
  'greatclub': ['Club', 'Cudgel', 'Maul'],
  'mace': ['Mace', 'Scepter', 'Club'],
  'maul': ['Maul', 'Warhammer', 'Mace'],
  'morningstar': ['Morningstar', 'Mace', 'Flail'],
  'flail': ['Flail', 'Morningstar', 'Mace'],
  'warhammer': ['Warhammer', 'Maul', 'Mace'],

  // Polearms
  'spear': ['Spear', 'Javelin', 'Lance', 'Pike'],
  'javelin': ['Javelin', 'Spear', 'Pike'],
  'quarterstaff': ['Staff', 'Stave', 'Quarterstaff'],
  'glaive': ['Glaive', 'Poleaxe', 'Halberd', 'Naginata'],
  'halberd': ['Halberd', 'Poleaxe', 'Glaive', 'Bardiche'],
  'pike': ['Pike', 'Spear', 'Lance', 'Partisan'],
  'lance': ['Lance', 'Spear', 'Pike'],
  'trident': ['Trident', 'Spear', 'Fork'],

  // Exotic
  'whip': ['Whip', 'Lash', 'Scourge'],

  // Ranged - Bows
  'longbow': ['Bow', 'Longbow', 'Arc'],
  'shortbow': ['Bow', 'Shortbow', 'Arc'],

  // Ranged - Crossbows
  'crossbow (light)': ['Crossbow', 'Arbalest'],
  'crossbow (heavy)': ['Crossbow', 'Arbalest'],
  'crossbow (hand)': ['Crossbow', 'Arbalest'],

  // Armor
  'armor (light)': ['Armor', 'Leather', 'Jerkin', 'Mail', 'Garb'],
  'armor (medium)': ['Armor', 'Breastplate', 'Mail', 'Hauberk', 'Brigandine'],
  'armor (heavy)': ['Armor', 'Plate', 'Mail', 'Cuirass', 'Hauberk'],
  'shield': ['Shield', 'Buckler', 'Aegis', 'Bulwark'],

  // Implements
  'rod': ['Rod', 'Scepter', 'Baton', 'Wand'],
  'staff': ['Staff', 'Stave', 'Cane', 'Crook'],
  'wand': ['Wand', 'Rod', 'Baton', 'Switch'],

  // Accessories
  'amulet': ['Amulet', 'Pendant', 'Necklace', 'Medallion', 'Talisman', 'Torc'],
  'boots': ['Boots', 'Treads', 'Sabatons', 'Greaves', 'Sandals'],
  'cloak': ['Cloak', 'Cape', 'Mantle', 'Shroud', 'Cowl'],
  'gloves': ['Gloves', 'Gauntlets', 'Bracers', 'Fists', 'Vambraces'],
  'ring': ['Ring', 'Band', 'Signet', 'Loop'],

  // Wondrous
  'wondrous item': ['Relic', 'Artifact', 'Talisman', 'Token', 'Charm', 'Icon'],
};

/**
 * Generate a random fantasy item name that matches the given base item type.
 * For example, a longsword will get names like "Blazing Blade" or "Sword of Flame",
 * not "Ring of Fire" or "Cloak of Shadows".
 *
 * @param baseItem The base item type (e.g., 'longsword', 'crossbow (heavy)', 'ring')
 * @param theme Optional theme to influence name generation (e.g., 'fire', 'ice', 'shadow')
 * @returns A randomly generated fantasy item name appropriate for the item type
 */
export function generateRandomItemNameForBase(baseItem: string, theme?: string): string {
  const normalizedBase = baseItem.toLowerCase();
  const appropriateObjects = BASE_ITEM_OBJECTS[normalizedBase];

  // If we don't have a mapping, fall back to generic name
  if (!appropriateObjects || appropriateObjects.length === 0) {
    return generateRandomItemName();
  }

  const pickObject = () => pick(appropriateObjects);

  // Theme-aware vocabulary selection
  const themedAdjectives = theme ? getThemedAdjectives(theme) : ADJECTIVES;
  const themedNouns = theme ? getThemedNouns(theme) : NOUNS;
  const themedPrefixes = theme ? getThemedPrefixes(theme) : COMPOUND_PREFIXES;

  // Mix themed with generic for variety (70% themed, 30% any)
  const pickAdj = () => theme && Math.random() < 0.7 ? pick(themedAdjectives) : pick(ADJECTIVES);
  const pickNoun = () => theme && Math.random() < 0.7 ? pick(themedNouns) : pick(NOUNS);
  const pickPrefix = () => theme && Math.random() < 0.7 ? pick(themedPrefixes) : pick(COMPOUND_PREFIXES);

  // Generate using weighted pattern selection with appropriate objects
  const patterns: NamePattern[] = [
    // ============================================
    // COMMON PATTERNS (weight: 15-20)
    // ============================================

    // "[Adjective] [Object]" - e.g., "Blazing Sword"
    { weight: 18, generate: () => `${pickAdj()} ${pickObject()}` },

    // "[Object] of [Noun]" - e.g., "Blade of Flame"
    { weight: 18, generate: () => `${pickObject()} of ${pickNoun()}` },

    // "[Object] of the [Noun]" - e.g., "Sword of the Phoenix"
    { weight: 14, generate: () => `${pickObject()} of the ${pickNoun()}` },

    // ============================================
    // MEDIUM PATTERNS (weight: 8-12)
    // ============================================

    // "The [Adjective] [Object]" - e.g., "The Frozen Blade"
    { weight: 10, generate: () => `The ${pickAdj()} ${pickObject()}` },

    // "[Noun]'s [Object]" - e.g., "Dragon's Claw"
    { weight: 10, generate: () => `${pickNoun()}'s ${pickObject()}` },

    // "The [Noun]'s [Object]" - e.g., "The Phoenix's Sword"
    { weight: 8, generate: () => `The ${pickNoun()}'s ${pickObject()}` },

    // "[Adjective] [Object] of [Noun]" - e.g., "Ancient Blade of Kings"
    { weight: 8, generate: () => `${pickAdj()} ${pickObject()} of ${pickNoun()}` },

    // "[Object] of [Adjective] [Noun]" - e.g., "Sword of Eternal Flame"
    { weight: 8, generate: () => `${pickObject()} of ${pickAdj()} ${pickNoun()}` },

    // "[Adjective] [Object] of the [Noun]" - e.g., "Holy Sword of the Crusader"
    { weight: 6, generate: () => `${pickAdj()} ${pickObject()} of the ${pickNoun()}` },

    // ============================================
    // COMPOUND PATTERNS (weight: 6-10)
    // ============================================

    // Compound word - e.g., "Stormbringer", "Frostmourne"
    { weight: 10, generate: () => capitalize(`${pickPrefix()}${pick(COMPOUND_SUFFIXES)}`) },

    // "The [Compound]" - e.g., "The Worldbreaker"
    { weight: 5, generate: () => `The ${capitalize(pickPrefix())}${pick(COMPOUND_SUFFIXES)}` },

    // "[Noun]-[Suffix] [Object]" - e.g., "Doom-forged Blade"
    {
      weight: 6,
      generate: () => {
        const prefix = pickPrefix();
        const suffix = pick(['forged', 'blessed', 'cursed', 'touched', 'born', 'wrought', 'hewn', 'tempered', 'bound', 'kissed']);
        return `${prefix}-${suffix} ${pickObject()}`;
      },
    },

    // ============================================
    // PROPER NAME PATTERNS (weight: 4-8)
    // ============================================

    // Just a proper name - e.g., "Excalibur"
    { weight: 7, generate: () => pickCategory(PROPER_NAMES) },

    // "[ProperName], the [Epithet]" - e.g., "Glamdring, the Foe-hammer"
    {
      weight: 5,
      generate: () => {
        const name = pickCategory(PROPER_NAMES);
        const epithet = pickCategory(EPITHETS);
        return `${name}, ${epithet}`;
      },
    },

    // "The [ProperName]" - e.g., "The Andúril"
    { weight: 3, generate: () => `The ${pickCategory(PROPER_NAMES)}` },

    // ============================================
    // ELABORATE PATTERNS (weight: 3-6)
    // ============================================

    // "[Object] of the [Plural Noun]" - e.g., "Sword of the Fallen Kings"
    {
      weight: 5,
      generate: () => {
        const noun = pickNoun();
        const adjective = pickAdj();
        return `${pickObject()} of the ${adjective} ${pluralize(noun)}`;
      },
    },

    // "The [Adjective] [Object] of the [Noun]" - e.g., "The Ancient Blade of the Phoenix"
    { weight: 4, generate: () => `The ${pickAdj()} ${pickObject()} of the ${pickNoun()}` },

    // "[Object] [Epithet]" - e.g., "Blade that Sings of Sorrow"
    {
      weight: 4,
      generate: () => {
        const object = pickObject();
        const epithet = pick(EPITHETS.poetic);
        return `${object} ${epithet}`;
      },
    },

    // ============================================
    // RARE/EPIC PATTERNS (weight: 1-3)
    // ============================================

    // Full title - "[ProperName], [Object] of [Noun]"
    {
      weight: 3,
      generate: () => {
        const name = pickCategory(PROPER_NAMES);
        const object = pickObject();
        const noun = pickNoun();
        return `${name}, ${object} of ${noun}`;
      },
    },

    // "[ProperName], the [Adjective] [Object]"
    {
      weight: 3,
      generate: () => {
        const name = pickCategory(PROPER_NAMES);
        const adj = pickAdj();
        const obj = pickObject();
        return `${name}, the ${adj} ${obj}`;
      },
    },

    // Poetic construction - "The [Object] of [Noun]'s [Noun]"
    {
      weight: 2,
      generate: () => {
        return `The ${pickObject()} of ${pickNoun()}'s ${pickNoun()}`;
      },
    },

    // Triple compound - "[Prefix][Suffix] of [Noun]"
    {
      weight: 2,
      generate: () => {
        const compound = capitalize(`${pickPrefix()}${pick(COMPOUND_SUFFIXES)}`);
        return `${compound} of ${pickNoun()}`;
      },
    },

    // Definite compound with noun - "The [Compound] of the [Noun]"
    {
      weight: 2,
      generate: () => {
        const compound = capitalize(`${pickPrefix()}${pick(COMPOUND_SUFFIXES)}`);
        return `The ${compound} of the ${pickNoun()}`;
      },
    },

    // Legendary title pattern - "[ProperName], [Slayer], the [Object] of [Noun]"
    {
      weight: 1,
      generate: () => {
        const name = pickCategory(PROPER_NAMES);
        const epithet = pick(EPITHETS.slayer);
        const noun = pickNoun();
        return `${name}, ${epithet}, ${pickObject()} of the ${noun}`;
      },
    },

    // Archaic definite - "[Object] of a Thousand [Plural Noun]"
    {
      weight: 2,
      generate: () => {
        const quantities = ['a Thousand', 'a Hundred', 'Ten Thousand', 'Countless', 'Seven', 'Nine', 'Twelve'];
        const noun = pickNoun();
        return `${pickObject()} of ${pick(quantities)} ${pluralize(noun)}`;
      },
    },

    // Fated item - "The [Noun]-[Object]" - e.g., "The Doom-Blade"
    {
      weight: 3,
      generate: () => {
        const concepts = ['Doom', 'Fate', 'Death', 'War', 'Soul', 'Blood', 'Dream', 'Void', 'Night', 'Dawn'];
        return `The ${pick(concepts)}-${pickObject()}`;
      },
    },
  ];

  // Calculate total weight
  const totalWeight = patterns.reduce((sum, p) => sum + p.weight, 0);

  // Random selection based on weight
  let random = Math.random() * totalWeight;

  for (const pattern of patterns) {
    random -= pattern.weight;
    if (random <= 0) {
      return pattern.generate();
    }
  }

  // Fallback
  return `${pick(ADJECTIVES)} ${pickObject()}`;
}

// ============================================================================
// THEMED VOCABULARY FOR COHERENT GENERATION
// ============================================================================

const THEME_ADJECTIVES: Record<string, string[]> = {
  fire: [
    'Blazing', 'Burning', 'Smoldering', 'Scorching', 'Searing', 'Molten',
    'Volcanic', 'Incandescent', 'Pyretic', 'Cinderous', 'Ashen', 'Ember',
    'Infernal', 'Flame-touched', 'Phoenix-born', 'Radiant', 'Sunlit',
  ],
  cold: [
    'Frozen', 'Icy', 'Frigid', 'Glacial', 'Frostbitten', 'Hoarfrost',
    'Crystalline', 'Permafrost', 'Boreal', 'Hyperborean', 'Rime-touched',
    'Winter', 'Pale', 'Bitter', 'Shivering', 'Snowbound',
  ],
  lightning: [
    'Thundering', 'Stormy', 'Tempestuous', 'Crackling', 'Galvanic',
    'Roaring', 'Raging', 'Furious', 'Wrathful', 'Cyclonic', 'Electric',
    'Storm-forged', 'Thunder-touched', 'Skyborn', 'Voltaic',
  ],
  radiant: [
    'Radiant', 'Luminous', 'Gleaming', 'Shimmering', 'Glowing', 'Brilliant',
    'Resplendent', 'Divine', 'Sacred', 'Holy', 'Blessed', 'Hallowed',
    'Sunlit', 'Starlit', 'Auroral', 'Prismatic', 'Celestial', 'Golden',
  ],
  necrotic: [
    'Necrotic', 'Withering', 'Life-drinking', 'Soul-rending', 'Grave-touched',
    'Deathly', 'Cursed', 'Damned', 'Forsaken', 'Unholy', 'Profane', 'Blighted',
    'Spectral', 'Ghostly', 'Wraithlike', 'Bone', 'Skeletal', 'Pale',
  ],
  force: [
    'Ethereal', 'Astral', 'Planar', 'Dimensional', 'Eldritch', 'Arcane',
    'Mystic', 'Runic', 'Thaumic', 'Sorcerous', 'Void-touched', 'Cosmic',
    'Stellar', 'Invisible', 'Phantom', 'Shimmering',
  ],
  thunder: [
    'Thundering', 'Roaring', 'Howling', 'Raging', 'Furious', 'Bellowing',
    'Deafening', 'Resounding', 'Booming', 'Rumbling', 'Crashing',
    'Storm-born', 'Tempest-forged', 'Sky-shaking',
  ],
  psychic: [
    'Mind-rending', 'Thought-stealing', 'Dream-walking', 'Nightmare',
    'Aberrant', 'Alien', 'Otherworldly', 'Eldritch', 'Maddening',
    'Whispering', 'Silent', 'Screaming', 'Keening', 'Haunting',
  ],
  poison: [
    'Venomous', 'Toxic', 'Pestilent', 'Virulent', 'Noxious', 'Corrupting',
    'Putrid', 'Festering', 'Serpentine', 'Viper', 'Caustic', 'Acidic',
  ],
  acid: [
    'Caustic', 'Acidic', 'Corrosive', 'Dissolving', 'Etching', 'Burning',
    'Vitriol', 'Searing', 'Melting', 'Consuming', 'Devouring',
  ],
};

const THEME_NOUNS: Record<string, string[]> = {
  fire: [
    'Flame', 'Fire', 'Blaze', 'Inferno', 'Conflagration', 'Pyre',
    'Ember', 'Cinder', 'Ash', 'Spark', 'Phoenix', 'Sun', 'Dawn',
    'Volcano', 'Furnace', 'Hellfire', 'Dragons', 'Salamander',
  ],
  cold: [
    'Frost', 'Ice', 'Glacier', 'Avalanche', 'Blizzard', 'Winter',
    'Snow', 'Hail', 'Rime', 'Cold', 'North', 'Tundra', 'Permafrost',
    'Yeti', 'Wendigo', 'Pale', 'Moon', 'Midnight',
  ],
  lightning: [
    'Storm', 'Tempest', 'Thunder', 'Lightning', 'Cyclone', 'Hurricane',
    'Typhoon', 'Tornado', 'Gale', 'Squall', 'Whirlwind', 'Sky',
    'Cloud', 'Heavens', 'Zeus', 'Thor', 'Raijin',
  ],
  radiant: [
    'Light', 'Radiance', 'Brilliance', 'Luminance', 'Glow', 'Sun',
    'Dawn', 'Stars', 'Heaven', 'Angels', 'Seraph', 'Saints',
    'Virtue', 'Glory', 'Hope', 'Salvation', 'Redemption', 'Paradise',
  ],
  necrotic: [
    'Death', 'Soul', 'Spirit', 'Ghost', 'Shade', 'Wraith', 'Specter',
    'Grave', 'Tomb', 'Corpse', 'Bone', 'Lich', 'Vampire', 'Undead',
    'Oblivion', 'Void', 'Entropy', 'Despair', 'Sorrow', 'Dread',
  ],
  force: [
    'Void', 'Abyss', 'Cosmos', 'Dimension', 'Plane', 'Realm', 'Ether',
    'Astral', 'Magic', 'Arcana', 'Power', 'Will', 'Mind', 'Infinity',
    'Stars', 'Galaxies', 'Reality', 'Truth',
  ],
  thunder: [
    'Thunder', 'Storm', 'Roar', 'Fury', 'Rage', 'Wrath', 'Bellowing',
    'Mountains', 'Giants', 'Titans', 'War', 'Battle', 'Conquest',
    'Drums', 'Hammers', 'Anvils',
  ],
  psychic: [
    'Mind', 'Thought', 'Dream', 'Nightmare', 'Madness', 'Insanity',
    'Whispers', 'Screams', 'Secrets', 'Fear', 'Dread', 'Horror',
    'Void', 'Abyss', 'Illusion', 'Delusion', 'Paranoia',
  ],
  poison: [
    'Venom', 'Poison', 'Toxin', 'Plague', 'Pestilence', 'Disease',
    'Serpent', 'Viper', 'Spider', 'Scorpion', 'Corruption', 'Decay',
  ],
  acid: [
    'Acid', 'Vitriol', 'Corrosion', 'Dissolution', 'Ooze', 'Slime',
    'Bile', 'Ichor', 'Caustic', 'Burning',
  ],
};

const THEME_PREFIXES: Record<string, string[]> = {
  fire: ['Fire', 'Flame', 'Blaze', 'Ember', 'Cinder', 'Sun', 'Dawn', 'Ash', 'Pyre', 'Burn', 'Scorch', 'Heat'],
  cold: ['Frost', 'Ice', 'Snow', 'Winter', 'Glacier', 'Cold', 'Rime', 'Hail', 'Chill', 'Freeze', 'North'],
  lightning: ['Storm', 'Thunder', 'Lightning', 'Sky', 'Cloud', 'Wind', 'Tempest', 'Gale', 'Bolt', 'Spark'],
  radiant: ['Sun', 'Star', 'Light', 'Dawn', 'Day', 'Gold', 'Heaven', 'Holy', 'Divine', 'Bright', 'Glory'],
  necrotic: ['Death', 'Soul', 'Ghost', 'Shade', 'Night', 'Grave', 'Bone', 'Blood', 'Doom', 'Dread', 'Blight'],
  force: ['Void', 'Star', 'Spell', 'Rune', 'Arcane', 'Mystic', 'Ether', 'Mind', 'Will', 'Power', 'Sigil'],
  thunder: ['Thunder', 'Storm', 'War', 'Battle', 'Rage', 'Fury', 'Roar', 'Crash', 'Drum', 'Hammer'],
  psychic: ['Mind', 'Dream', 'Thought', 'Fear', 'Dread', 'Whisper', 'Scream', 'Mad', 'Void', 'Shadow'],
  poison: ['Venom', 'Viper', 'Serpent', 'Fang', 'Toxin', 'Plague', 'Blight', 'Rot', 'Corrupt'],
  acid: ['Acid', 'Bile', 'Caustic', 'Etch', 'Burn', 'Melt', 'Dissolve', 'Corrode'],
};

function getThemedAdjectives(theme: string): string[] {
  return THEME_ADJECTIVES[theme.toLowerCase()] || ADJECTIVES;
}

function getThemedNouns(theme: string): string[] {
  return THEME_NOUNS[theme.toLowerCase()] || NOUNS;
}

function getThemedPrefixes(theme: string): string[] {
  return THEME_PREFIXES[theme.toLowerCase()] || COMPOUND_PREFIXES;
}

// Export vocabularies for potential external use
export {
  OBJECTS,
  ADJECTIVES,
  NOUNS,
  COMPOUND_PREFIXES,
  COMPOUND_SUFFIXES,
  PROPER_NAMES,
  EPITHETS,
};
