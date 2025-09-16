on('ready', function() {
    log('Pokemon Encounter System loaded!');
});

let encounterCounter = 1;

function findPokemonImage(pokemonName) {
    const handouts = findObjs({
        _type: 'handout',
        name: pokemonName
    });
    
    if (handouts.length > 0) {
        const handout = handouts[0];
        const avatar = handout.get('avatar');
        if (avatar && avatar !== '') {
            return avatar;
        }
    }
    
    const tokenHandouts = findObjs({
        _type: 'handout',
        name: pokemonName + ' Token'
    });
    
    if (tokenHandouts.length > 0) {
        const handout = tokenHandouts[0];
        const avatar = handout.get('avatar');
        if (avatar && avatar !== '') {
            return avatar;
        }
    }
    
    return null;
}

// Add function to calculate and set modifiers directly
function calculateAndSetModifiers(characterId, level) {
    const profBonus = Math.ceil(level / 4) + 1;
    
    // Get all the ability scores
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    abilities.forEach(ability => {
        const abilityAttr = findObjs({
            _type: 'attribute',
            _characterid: characterId,
            name: 'pokemon_' + ability
        })[0];
        
        if (abilityAttr) {
            const abilityScore = parseInt(abilityAttr.get('current')) || 10;
            const modifier = Math.floor((abilityScore - 10) / 2);
            const modString = modifier >= 0 ? "+" + modifier : modifier.toString();
            
            // Create or update the modifier attribute
            let modAttr = findObjs({
                _type: 'attribute',
                _characterid: characterId,
                name: 'pokemon_' + ability + '_mod'
            })[0];
            
            if (!modAttr) {
                createObj('attribute', {
                    _characterid: characterId,
                    name: 'pokemon_' + ability + '_mod',
                    current: modString
                });
            } else {
                modAttr.set('current', modString);
            }
        }
    });
    
    // Calculate skill modifiers (basic calculation, sheet will handle proficiencies)
    const pokemonSkills = [
        {name: 'pokemon_acrobatics', stat: 'pokemon_dexterity'},
        {name: 'pokemon_animal_handling', stat: 'pokemon_wisdom'},
        {name: 'pokemon_arcana', stat: 'pokemon_intelligence'},
        {name: 'pokemon_athletics', stat: 'pokemon_strength'},
        {name: 'pokemon_deception', stat: 'pokemon_charisma'},
        {name: 'pokemon_history', stat: 'pokemon_intelligence'},
        {name: 'pokemon_insight', stat: 'pokemon_wisdom'},
        {name: 'pokemon_intimidation', stat: 'pokemon_charisma'},
        {name: 'pokemon_investigation', stat: 'pokemon_intelligence'},
        {name: 'pokemon_medicine', stat: 'pokemon_wisdom'},
        {name: 'pokemon_nature', stat: 'pokemon_intelligence'},
        {name: 'pokemon_perception', stat: 'pokemon_wisdom'},
        {name: 'pokemon_performance', stat: 'pokemon_charisma'},
        {name: 'pokemon_persuasion', stat: 'pokemon_charisma'},
        {name: 'pokemon_religion', stat: 'pokemon_intelligence'},
        {name: 'pokemon_sleight_of_hand', stat: 'pokemon_dexterity'},
        {name: 'pokemon_stealth', stat: 'pokemon_dexterity'},
        {name: 'pokemon_survival', stat: 'pokemon_wisdom'}
    ];
    
    pokemonSkills.forEach(skill => {
        const statAttr = findObjs({
            _type: 'attribute',
            _characterid: characterId,
            name: skill.stat
        })[0];
        
        if (statAttr) {
            const statValue = parseInt(statAttr.get('current')) || 10;
            const statMod = Math.floor((statValue - 10) / 2);
            
            // Check if proficient (default to false for wild Pokemon)
            const profAttr = findObjs({
                _type: 'attribute',
                _characterid: characterId,
                name: skill.name + '_prof'
            })[0];
            
            const isProficient = profAttr ? (profAttr.get('current') === 'on' || profAttr.get('current') === '1') : false;
            const total = statMod + (isProficient ? profBonus : 0);
            const totalString = total >= 0 ? "+" + total : total.toString();
            
            // Create skill total attribute
            let skillTotalAttr = findObjs({
                _type: 'attribute',
                _characterid: characterId,
                name: skill.name + '_total'
            })[0];
            
            if (!skillTotalAttr) {
                createObj('attribute', {
                    _characterid: characterId,
                    name: skill.name + '_total',
                    current: totalString
                });
            } else {
                skillTotalAttr.set('current', totalString);
            }
        }
    });
}

const pokemonDatabase = {
    // 1
    'Bulbasaur': { 
        hp: 17, ac: 13, str: 13, dex: 12, con: 12, int: 6, wis: 10, cha: 10,
        speed: 30, type1: 'grass', type2: 'poison', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/bulbasaur.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Growl' },
            { level: 2, move: 'Vine Whip' },
            { level: 2, move: 'Leech Seed' },
            { level: 6, move: 'Poison Powder' },
            { level: 6, move: 'Sleep Powder' },
            { level: 6, move: 'Take Down' },
            { level: 6, move: 'Razor Leaf' },
            { level: 10, move: 'Sweet Scent' },
            { level: 10, move: 'Growth' },
            { level: 10, move: 'Double-Edge' },
            { level: 14, move: 'Worry Seed' },
            { level: 14, move: 'Synthesis' },
            { level: 18, move: 'Seed Bomb' }
        ],
        features: [
            {
                name: "Overgrow",
                description: "This Pokémon doubles its STAB bonus when it has 25% or less of its maximum health."
            },
            {
                name: "Chlorophyll (Hidden)",
                description: "This Pokémon’s speed is doubled in harsh sunlight."
            }
        ],
        skillProficiencies: ['athletics', 'nature'],
        saveProficiencies: ['strength'],
        vulnerabilities: ['fire', 'flying', 'ice', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['water', 'electric', 'grass', 'fighting', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 2
    'Ivysaur': { 
        hp: 45, ac: 15, str: 15, dex: 14, con: 12, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'grass', type2: 'poison', size: 'Medium', sr: 5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/ivysaur.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Leech Seed' },
            { level: 1, move: 'Vine Whip' },
            { level: 6, move: 'Poison Powder' },
            { level: 6, move: 'Sleep Powder' },
            { level: 6, move: 'Take Down' },
            { level: 10, move: 'Razor Leaf' },
            { level: 10, move: 'Sweet Scent' },
            { level: 14, move: 'Growth' },
            { level: 14, move: 'Double-Edge' },
            { level: 14, move: 'Worry Seed' },
            { level: 18, move: 'Synthesis' },
            { level: 18, move: 'Solar Beam' }
        ],
        features: [
            {
                name: "Overgrow",
                description: "This Pokémon doubles its STAB bonus when it has 25% or less of its maximum health."
            },
            {
                name: "Chlorophyll (Hidden)",
                description: "This Pokémon’s speed is doubled in harsh sunlight."
            }
        ],
        skillProficiencies: ['athletics', 'nature'],
        saveProficiencies: ['strength'],
        vulnerabilities: ['fire', 'flying', 'ice', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['water', 'electric', 'grass', 'fighting', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 3
    'Venusaur': { 
        hp: 18, ac: 15, str: 16, dex: 16, con: 16, int: 18, wis: 18, cha: 12,
        speed: 35, type1: 'grass', type2: 'poison', size: 'Large', sr: 13,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/venusaur.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Leech Seed' },
            { level: 1, move: 'Vine Whip' },
            { level: 1, move: 'Petal Dance' },
            { level: 1, move: 'Poison Powder' },
            { level: 1, move: 'Sleep Powder' },
            { level: 1, move: 'Take Down' },
            { level: 1, move: 'Razor Leaf' },
            { level: 1, move: 'Sweet Scent' },
            { level: 14, move: 'Growth' },
            { level: 14, move: 'Double-Edge' },
            { level: 14, move: 'Worry Seed' },
            { level: 18, move: 'Synthesis' },
            { level: 18, move: 'Solar Beam' },
            { level: 18, move: 'Petal Blizzard' }
        ],
        features: [
            {
                name: "Overgrow",
                description: "This Pokémon doubles its STAB bonus when it has 25% or less of its maximum health."
            },
            {
                name: "Chlorophyll (Hidden)",
                description: "This Pokémon's speed is doubled in harsh sunlight."
            }
        ],
        skillProficiencies: ['athletics', 'nature'],
        saveProficiencies: ['strength', 'constitution'],
        vulnerabilities: ['fire', 'flying', 'ice', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['water', 'electric', 'grass', 'fighting', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 4
    'Charmander': { 
        hp: 16, ac: 13, str: 12, dex: 14, con: 11, int: 6, wis: 10, cha: 10,
        speed: 30, type1: 'fire', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/charmander.png',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Scratch' },
            { level: 2, move: 'Ember' },
            { level: 2, move: 'Smokescreen' },
            { level: 6, move: 'Dragon Rage' },
            { level: 6, move: 'Scary Face' },
            { level: 10, move: 'Fire Fang' },
            { level: 10, move: 'Slash' },
            { level: 14, move: 'Flame Burst' },
            { level: 14, move: 'Flamethrower' },
            { level: 18, move: 'Fire Spin' },
            { level: 18, move: 'Inferno' }
        ],
        features: [
            {
                name: "Blaze",
                description: "This Pokémon doubles its STAB bonus when it has 25% or less of its maximum health."
            },
            {
                name: "Solar Power (Hidden)",
                description: "Damage rolls for this Pokémon get an additional +2 during harsh sunlight."
            }
        ],
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['water', 'ground', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 5
    'Charmeleon': { 
        hp: 40, ac: 14, str: 14, dex: 16, con: 11, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'fire', type2: '', size: 'Medium', sr: 5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/charmeleon.png',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Ember' },
            { level: 1, move: 'Smokescreen' },
            { level: 6, move: 'Dragon Rage' },
            { level: 10, move: 'Scary Face' },
            { level: 14, move: 'Fire Fang' },
            { level: 14, move: 'Flame Burst' },
            { level: 14, move: 'Slash' },
            { level: 18, move: 'Flamethrower' },
            { level: 18, move: 'Fire Spin' },
            { level: 18, move: 'Inferno' }
        ],
        features: [
            {
                name: "Blaze",
                description: "This Pokémon doubles its STAB bonus when it has 25% or less of its maximum health."
            },
            {
                name: "Solar Power (Hidden)",
                description: "Damage rolls for this Pokémon get an additional +2 during harsh sunlight."
            }
        ],
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['water', 'ground', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 6
    'Charizard': { 
        hp: 17, ac: 15, str: 16, dex: 18, con: 16, int: 18, wis: 16, cha: 14,
        speed: 40, type1: 'fire', type2: 'flying', size: 'Large', sr: 13,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/charizard.png',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Air Slash' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Ember' },
            { level: 1, move: 'Dragon Claw' },
            { level: 1, move: 'Shadow Claw' },
            { level: 1, move: 'Wing Attack' },
            { level: 1, move: 'Smokescreen' },
            { level: 1, move: 'Dragon Rage' },
            { level: 1, move: 'Scary Face' },
            { level: 14, move: 'Fire Fang' },
            { level: 14, move: 'Flame Burst' },
            { level: 14, move: 'Slash' },
            { level: 18, move: 'Flamethrower' },
            { level: 18, move: 'Fire Spin' },
            { level: 18, move: 'Heat Wave' },
            { level: 18, move: 'Inferno' },
            { level: 18, move: 'Flare Blitz' }
        ],
        features: [
            {
                name: "Blaze",
                description: "This Pokémon doubles its STAB bonus when it has 25% or less of its maximum health."
            },
            {
                name: "Solar Power (Hidden)",
                description: "Damage rolls for this Pokémon get an additional +2 during harsh sunlight."
            }
        ],
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity', 'strength'],
        vulnerabilities: ['water', 'electric'],
        doubleVulnerabilities: ['rock'],
        resistances: ['fire', 'grass', 'fighting', 'bug', 'steel'],
        doubleResistances: [],
        immunities: ['ground']
    },
    // 7
    'Squirtle': { 
        hp: 18, ac: 14, str: 12, dex: 11, con: 14, int: 6, wis: 10, cha: 10,
        speed: 30, type1: 'water', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/squirtle.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Tail Whip' },
            { level: 2, move: 'Water Gun' },
            { level: 2, move: 'Withdraw' },
            { level: 6, move: 'Bubble' },
            { level: 6, move: 'Bite' },
            { level: 6, move: 'Rapid Spin' },
            { level: 10, move: 'Protect' },
            { level: 10, move: 'Water Pulse' },
            { level: 10, move: 'Wave Crash' },
            { level: 14, move: 'Aqua Tail' },
            { level: 14, move: 'Skull Bash' },
            { level: 14, move: 'Iron Defense' },
            { level: 18, move: 'Rain Dance' },
            { level: 18, move: 'Hydro Pump' }
        ],
        features: [
            {
                name: "Torrent",
                description: "This Pokémon doubles its STAB bonus when it has 25% or less of its maximum health."
            },
            {
                name: "Rain Dish (Hidden)",
                description: "In rainy conditions, this Pokémon heals for an amount of HP equal to its proficiency bonus at the end of each of its turns."
            }
        ],
        skillProficiencies: ['survival'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 8
    'Wartortle': { 
        hp: 50, ac: 15, str: 14, dex: 12, con: 15, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'water', type2: '', size: 'Medium', sr: 5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/wartortle.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Water Gun' },
            { level: 1, move: 'Withdraw' },
            { level: 6, move: 'Bubble' },
            { level: 6, move: 'Bite' },
            { level: 10, move: 'Rapid Spin' },
            { level: 10, move: 'Protect' },
            { level: 14, move: 'Water Pulse' },
            { level: 14, move: 'Aqua Tail' },
            { level: 14, move: 'Skull Bash' },
            { level: 14, move: 'Wave Crash' },
            { level: 18, move: 'Iron Defense' },
            { level: 18, move: 'Rain Dance' },
            { level: 18, move: 'Hydro Pump' }
        ],
        features: [
            {
                name: "Torrent",
                description: "This Pokémon doubles its STAB bonus when it has 25% or less of its maximum health."
            },
            {
                name: "Rain Dish (Hidden)",
                description: "In rainy conditions, this Pokémon heals for an amount of HP equal to its proficiency bonus at the end of each of its turns."
            }
        ],
        skillProficiencies: ['survival'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 9
    'Blastoise': { 
        hp: 18, ac: 18, str: 16, dex: 15, con: 18, int: 16, wis: 18, cha: 12,
        speed: 30, type1: 'water', type2: '', size: 'Large', sr: 13,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/blastoise.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Flash Cannon' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Water Gun' },
            { level: 1, move: 'Withdraw' },
            { level: 1, move: 'Bubble' },
            { level: 1, move: 'Bite' },
            { level: 1, move: 'Rapid Spin' },
            { level: 1, move: 'Protect' },
            { level: 14, move: 'Water Pulse' },
            { level: 14, move: 'Aqua Tail' },
            { level: 14, move: 'Skull Bash' },
            { level: 14, move: 'Wave Crash' },
            { level: 18, move: 'Iron Defense' },
            { level: 18, move: 'Rain Dance' },
            { level: 18, move: 'Hydro Pump' }
        ],
        features: [
            {
                name: "Torrent",
                description: "This Pokémon doubles its STAB bonus when it has 25% or less of its maximum health."
            },
            {
                name: "Rain Dish (Hidden)",
                description: "In rainy conditions, this Pokémon heals for an amount of HP equal to its proficiency bonus at the end of each of its turns."
            }
        ],
        skillProficiencies: ['survival'],
        saveProficiencies: ['constitution', 'strength'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 10
    'Caterpie': { 
        hp: 15, ac: 11, str: 9, dex: 10, con: 8, int: 6, wis: 10, cha: 14,
        speed: 20, type1: 'bug', type2: '', size: 'Small', sr: .125,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/caterpie.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'String Shot' },
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Bug Bite' }
        ],
        features: [
            {
                name: "Shield Dust",
                description: "Once per long rest, this Pokémon can ignore a negative status condition that results from an enemy move."
            },
            {
                name: "Run Away (Hidden)",
                description: "This Pokémon cannot be the target of an attack of opportunity."
            }
        ],
        skillProficiencies: [],
        saveProficiencies: [],
        vulnerabilities: ['fire', 'flying', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fighting', 'ground'],
        doubleResistances: [],
        immunities: []
    },
    // 11
    'Metapod': { 
        hp: 11, ac: 17, str: 4, dex: 6, con: 11, int: 6, wis: 10, cha: 6,
        speed: 10, type1: 'bug', type2: '', size: 'Small', sr: 1,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/metapod.png',
        learnset: [
            { level: 1, move: 'Harden' }
        ],
        features: [
            {
                name: "Shed Skin",
                description: "Once per long rest, this Pokémon can automatically recover from one status condition at the end of its turn."
            }
        ],
        skillProficiencies: [],
        saveProficiencies: [],
        vulnerabilities: ['fire', 'flying', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fighting', 'ground'],
        doubleResistances: [],
        immunities: []
    },
    // 12
    'Butterfree': { 
        hp: 13, ac: 12, str: 9, dex: 14, con: 10, int: 16, wis: 16, cha: 12,
        speed: 30, type1: 'bug', type2: 'flying', size: 'Medium', sr: 6,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/butterfree.png',
        hitDie: 'd10',
        learnset: [
            { level: 1, move: 'Confusion' },
            { level: 1, move: 'Gust' },
            { level: 6, move: 'Poison Powder' },
            { level: 6, move: 'Sleep Powder' },
            { level: 6, move: 'Stun Spore' },
            { level: 6, move: 'Psybeam' },
            { level: 10, move: 'Silver Wind' },
            { level: 10, move: 'Supersonic' },
            { level: 10, move: 'Safeguard' },
            { level: 14, move: 'Whirlwind' },
            { level: 14, move: 'Bug Buzz' },
            { level: 14, move: 'Rage Powder' },
            { level: 18, move: 'Captivate' },
            { level: 18, move: 'Tailwind' },
            { level: 18, move: 'Air Slash' },
            { level: 18, move: 'Quiver Dance' }
        ],
        features: [
            {
                name: "Compound Eyes",
                description: "This Pokémon has advantage on Investigation checks and Perception checks that rely on sight."
            },
            {
                name: "Tinted Lens (Hidden)",
                description: "When this Pokémon uses a move that is not very effective, it deals normal damage instead."
            }
        ],
        skillProficiencies: ['nature'],
        saveProficiencies: ['wisdom'],
        vulnerabilities: ['fire', 'electric', 'ice', 'flying'],
        doubleVulnerabilities: ['rock'],
        resistances: ['bug'],
        doubleResistances: ['grass', 'fighting'],
        immunities: ['ground']
    },
    // 13
    'Weedle': {
        hp: 17, ac: 11, str: 9, dex: 10, con: 12, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'bug', type2: 'poison', size: 'Small', sr: .125,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/weedle.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Poison Sting' },
            { level: 1, move: 'String Shot' },
            { level: 2, move: 'Bug Bite' }
        ],
        features: [
            {
                name: "Shield Dust",
                description: "Once per long rest, this Pokémon can ignore a negative status condition that results from an enemy move."
            },
            {
                name: "Run Away (Hidden)",
                description: "This Pokémon cannot be the target of an attack of opportunity."
            }
        ],
        skillProficiencies: [],
        saveProficiencies: [],
        vulnerabilities: ['fire', 'flying', 'psychic', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'poison', 'fairy'],
        doubleResistances: ['grass', 'fighting'],
        immunities: []
    },
    // 14
    'Kakuna': {
        hp: 10, ac: 17, str: 4, dex: 6, con: 10, int: 6, wis: 10, cha: 6,
        speed: 10, type1: 'bug', type2: 'poison', size: 'Small', sr: 1,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/kakuna.png',
        hitDie: 'd8',
        learnset: [
            { level: 1, move: 'Harden' }
        ],
        features: [
            {
                name: "Shed Skin",
                description: "This Pokémon can end one condition affecting it at the end of each of its turns (save for unconscious)."
            }
        ],
        skillProficiencies: [],
        saveProficiencies: [],
        vulnerabilities: ['fire', 'flying', 'psychic', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'poison', 'fairy'],
        doubleResistances: ['grass', 'fighting'],
        immunities: []
    },
    // 15
    'Beedrill': {
        hp: 13, ac: 11, str: 16, dex: 15, con: 8, int: 9, wis: 16, cha: 9,
        speed: 35, type1: 'bug', type2: 'poison', size: 'Medium', sr: 6,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/beedrill.png',
        hitDie: 'd10',
        learnset: [
            { level: 1, move: 'Fury Attack' },
            { level: 1, move: 'Twineedle' },
            { level: 6, move: 'Rage' },
            { level: 6, move: 'Pursuit' },
            { level: 10, move: 'Focus Energy' },
            { level: 10, move: 'Venoshock' },
            { level: 10, move: 'Assurance' },
            { level: 14, move: 'Toxic Spikes' },
            { level: 14, move: 'Pin Missile' },
            { level: 14, move: 'Poison Jab' },
            { level: 18, move: 'Agility' },
            { level: 18, move: 'Endeavor' },
            { level: 18, move: 'Fell Stinger' }
        ],
        features: [
            {
                name: "Swarm",
                description: "When this Pokémon has less than 1/3 of its hit points, the damage of its Bug-type moves is increased by 50%."
            },
            {
                name: "Sniper (Hidden)",
                description: "When this Pokémon scores a critical hit, it deals triple damage instead of double damage."
            }
        ],
        skillProficiencies: ['acrobatics', 'intimidation'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['fire', 'flying', 'psychic', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'poison', 'fairy'],
        doubleResistances: ['grass', 'fighting'],
        immunities: []
    },
    // 16
    'Pidgey': {
        hp: 16, ac: 12, str: 10, dex: 12, con: 10, int: 6, wis: 10, cha: 10,
        speed: 25, type1: 'normal', type2: 'flying', size: 'Small', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/pidgey.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Sand Attack' },
            { level: 2, move: 'Gust' },
            { level: 6, move: 'Quick Attack' },
            { level: 6, move: 'Whirlwind' },
            { level: 10, move: 'Twister' },
            { level: 10, move: 'Feather Dance' },
            { level: 14, move: 'Agility' },
            { level: 14, move: 'Wing Attack' },
            { level: 14, move: 'Roost' },
            { level: 18, move: 'Tailwind' },
            { level: 18, move: 'Mirror Move' },
            { level: 18, move: 'Air Slash' },
            { level: 18, move: 'Hurricane' }
        ],
        features: [
            {
                name: "Keen Eye",
                description: "This Pokémon ignores disadvantage when it relates to sight."
            },
            {
                name: "Tangled Feet",
                description: "Attacks against this Pokémon have disadvantage when it is confused."
            },
            {
                name: "Big Pecks (Hidden)",
                description: "This Pokémon's AC cannot be reduced by an opponent's moves."
            }
        ],
        skillProficiencies: ["perception"],
        saveProficiencies: ["dexterity"],
        vulnerabilities: ['electric', 'ice', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'bug'],
        doubleResistances: [],
        immunities: ['ground', 'ghost']
    },
    // 17
    'Pidgeotto': {
        hp: 40, ac: 13, str: 13, dex: 14, con: 10, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'normal', type2: 'flying', size: 'Medium', sr: 3,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/pidgeotto.png',
        hitDie: 'd8',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Sand Attack' },
            { level: 1, move: 'Gust' },
            { level: 6, move: 'Quick Attack' },
            { level: 6, move: 'Whirlwind' },
            { level: 10, move: 'Twister' },
            { level: 10, move: 'Feather Dance' },
            { level: 14, move: 'Agility' },
            { level: 14, move: 'Wing Attack' },
            { level: 14, move: 'Roost' },
            { level: 18, move: 'Tailwind' },
            { level: 18, move: 'Mirror Move' },
            { level: 18, move: 'Air Slash' },
            { level: 18, move: 'Hurricane' }
        ],
        features: [
            {
                name: "Keen Eye",
                description: "This Pokémon ignores disadvantage when it relates to sight."
            },
            {
                name: "Tangled Feet",
                description: "Attacks against this Pokémon have disadvantage when it is confused."
            },
            {
                name: "Big Pecks (Hidden)",
                description: "This Pokémon's AC cannot be reduced by an opponent's moves."
            }
        ],
        skillProficiencies: ["perception"],
        saveProficiencies: ["dexterity"],
        vulnerabilities: ['electric', 'ice', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'bug'],
        doubleResistances: [],
        immunities: ['ground', 'ghost']
    },
    // 18
    'Pidgeot': {
        hp: 16, ac: 15, str: 16, dex: 17, con: 15, int: 12, wis: 14, cha: 12,
        speed: 40, type1: 'normal', type2: 'flying', size: 'Large', sr: 10,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/pidgeot.png',
        hitDie: 'd12',
        learnset: [
            { level: 1, move: 'Gust' },
            { level: 1, move: 'Quick Attack' },
            { level: 1, move: 'Sand Attack' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Whirlwind' },
            { level: 10, move: 'Twister' },
            { level: 10, move: 'Feather Dance' },
            { level: 14, move: 'Agility' },
            { level: 14, move: 'Wing Attack' },
            { level: 18, move: 'Roost' },
            { level: 18, move: 'Tailwind' },
            { level: 18, move: 'Mirror Move' },
            { level: 18, move: 'Air Slash' },
            { level: 18, move: 'Hurricane' }
        ],
        features: [
            {
                name: "Keen Eye",
                description: "This Pokémon ignores disadvantage when it relates to sight."
            },
            {
                name: "Tangled Feet",
                description: "Attacks against this Pokémon have disadvantage when it is confused."
            },
            {
                name: "Big Pecks (Hidden)",
                description: "This Pokémon's AC cannot be reduced by an opponent's moves."
            }
        ],
        skillProficiencies: ["perception", "intimidation"],
        saveProficiencies: ["dexterity", "wisdom"],
        vulnerabilities: ['electric', 'ice', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'bug'],
        doubleResistances: [],
        immunities: ['ground', 'ghost']
    },
    // 19
    'Rattata': {
        hp: 16, ac: 12, str: 10, dex: 14, con: 11, int: 6, wis: 10, cha: 8,
        speed: 30, type1: 'normal', type2: '', size: 'Small', sr: .25,
        image: 'https://files.d20.io/images/443835565/s67sf201PBNpnE3YrModQg/original.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Tail Whip' },
            { level: 2, move: 'Quick Attack' },
            { level: 2, move: 'Focus Energy' },
            { level: 2, move: 'Bite' },
            { level: 6, move: 'Pursuit' },
            { level: 6, move: 'Hyper Fang' },
            { level: 6, move: 'Assurance' },
            { level: 10, move: 'Crunch' },
            { level: 10, move: 'Sucker Punch' },
            { level: 14, move: 'Super Fang' },
            { level: 14, move: 'Double-Edge' },
            { level: 14, move: 'Endeavor' }
        ],
        features: [
            {
                name: "Run Away",
                description: "This Pokémon cannot be the target of an attack of opportunity."
            },
            {
                name: "Hustle (Hidden)",
                description: "When you score a critical hit, you may immediately gain an additional action on your turn. If this action is used to make an attack, you have disadvantage on the roll. You may only ever have one additional action per round."
            }
        ],
        skillProficiencies: ['stealth', 'perception'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['fighting'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost']
    },
    // 20
    'Raticate': {
        hp: 45, ac: 15, str: 15, dex: 15, con: 13, int: 6, wis: 12, cha: 8,
        speed: 30, type1: 'normal', type2: '', size: 'Medium', sr: 5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/raticate.png',
        hitDie: 'd10',
        learnset: [
            { level: 1, move: 'Quick Attack' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Focus Energy' },
            { level: 1, move: 'Scary Face' },
            { level: 1, move: 'Swords Dance' },
            { level: 1, move: 'Bite' },
            { level: 6, move: 'Pursuit' },
            { level: 6, move: 'Assurance' },
            { level: 10, move: 'Hyper Fang' },
            { level: 10, move: 'Crunch' },
            { level: 14, move: 'Sucker Punch' },
            { level: 14, move: 'Super Fang' },
            { level: 18, move: 'Double-Edge' },
            { level: 18, move: 'Endeavor' }
        ],
        features: [
            {
                name: "Run Away",
                description: "This Pokémon cannot be the target of an attack of opportunity."
            },
            {
                name: "Hustle (Hidden)",
                description: "When you score a critical hit, you may immediately gain an additional action on your turn. If this action is used to make an attack, you have disadvantage on the roll. You may only ever have one additional action per round."
            }
        ],
        skillProficiencies: ['stealth', 'perception', 'intimidation'],
        saveProficiencies: ['dexterity', 'strength'],
        vulnerabilities: ['fighting'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost']
    },
    // 21
    'Spearow': {
        hp: 16, ac: 12, str: 10, dex: 14, con: 10, int: 6, wis: 10, cha: 10,
        speed: 25, type1: 'normal', type2: 'flying', size: 'Small', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/spearow.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Leer' },
            { level: 2, move: 'Pursuit' },
            { level: 2, move: 'Fury Attack' },
            { level: 6, move: 'Aerial Ace' },
            { level: 6, move: 'Mirror Move' },
            { level: 10, move: 'Assurance' },
            { level: 10, move: 'Agility' },
            { level: 14, move: 'Focus Energy' },
            { level: 14, move: 'Roost' },
            { level: 18, move: 'Drill Peck' }
        ],
        features: [
            {
                name: "Keen Eye",
                description: "This Pokémon ignores disadvantage when it relates to sight."
            },
            {
                name: "Sniper (Hidden)",
                description: "When this Pokémon scores a critical hit, it deals triple damage instead of double damage."
            }
        ],
        skillProficiencies: ['perception'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'ice', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'bug'],
        doubleResistances: [],
        immunities: ['ground', 'ghost']
    },
    // 22
    'Fearow': {
        hp: 13, ac: 13, str: 18, dex: 18, con: 13, int: 11, wis: 11, cha: 11,
        speed: 40, type1: 'normal', type2: 'flying', size: 'Large', sr: 5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/fearow.png',
        hitDie: 'd8',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Pluck' },
            { level: 1, move: 'Pursuit' },
            { level: 6, move: 'Fury Attack' },
            { level: 6, move: 'Aerial Ace' },
            { level: 6, move: 'Mirror Move' },
            { level: 10, move: 'Assurance' },
            { level: 10, move: 'Agility' },
            { level: 14, move: 'Focus Energy' },
            { level: 18, move: 'Roost' },
            { level: 18, move: 'Drill Peck' },
            { level: 18, move: 'Drill Run' }
        ],
        features: [
            {
                name: "Keen Eye",
                description: "This Pokémon ignores disadvantage when it relates to sight."
            },
            {
                name: "Sniper (Hidden)",
                description: "When this Pokémon scores a critical hit, it deals triple damage instead of double damage."
            }
        ],
        skillProficiencies: ['perception', 'intimidation'],
        saveProficiencies: ['dexterity', 'strength'],
        vulnerabilities: ['electric', 'ice', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'bug'],
        doubleResistances: [],
        immunities: ['ground', 'ghost']
    },
    // 23
    'Ekans': { 
        hp: 16, ac: 13, str: 12, dex: 13, con: 11, int: 8, wis: 10, cha: 10,
        speed: 30, type1: 'poison', type2: '', size: 'Medium', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/ekans.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Wrap' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Poison Sting' },
            { level: 2, move: 'Bite' },
            { level: 2, move: 'Glare' }
        ],
        features: [
            {
                name: "Intimidate",
                description: "Once per short rest, you can impose disadvantage on an enemy attack roll of your choice."
            },
            {
                name: "Shed Skin",
                description: "If this Pokémon is affected by a negative status ailment, they can roll a d4 at the end of each of their turns. On a result of 4, they are cured."
            }
        ],
        skillProficiencies: ['stealth', 'deception'],
        saveProficiencies: ['constitution']
    },
    // 24
    'Arbok': { 
        hp: 13, ac: 14, str: 17, dex: 16, con: 14, int: 13, wis: 16, cha: 12,
        speed: 30, type1: 'poison', type2: '', size: 'Large', sr: 6,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/arbok.png',
        learnset: [
            { level: 1, move: 'Wrap' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Poison Sting' },
            { level: 8, move: 'Poison Sting' },
            { level: 13, move: 'Bite' },
            { level: 20, move: 'Glare' },
            { level: 28, move: 'Screech' },
            { level: 38, move: 'Acid' }
        ]
    },
    // 25
    'Pikachu': { 
        hp: 16, ac: 13, str: 11, dex: 15, con: 10, int: 6, wis: 10, cha: 12,
        speed: 30, type1: 'electric', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/pikachu.png',
        learnset: [
            { level: 1, move: 'Thunder Shock' },
            { level: 1, move: 'Play Nice' },
            { level: 1, move: 'Tail Whip' },
            { level: 2, move: 'Growl' },
            { level: 2, move: 'Quick Attack' }
        ],
        features: [
            {
                name: "Static",
                description: "When this Pokémon is hit by a melee attack, roll a d4. On a result of 4, the attacker takes an amount of electric damage equal to this Pokemon's proficiency bonus."
            },
            {
                name: "Lightning Rod (Hidden)",
                description: "If this Pokemon or an ally within 30 feet is targeted with a direct electric-type, damage-dealing move, the Pokemon may use a reaction to redirect the target to itself and take half damage from it if it hits."
            }
        ],
        skillProficiencies: ['acrobatics', 'persuasion'],
        saveProficiencies: ['dexterity', 'charisma']
    },
    // 26
    'Raichu': { 
        hp: 14, ac: 15, str: 16, dex: 18, con: 13, int: 16, wis: 16, cha: 12,
        speed: 35, type1: 'electric', type2: '', size: 'Medium', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/raichu.png',
        learnset: [
            { level: 1, move: 'Thunder Shock' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Quick Attack' },
            { level: 1, move: 'Thunderbolt' }
        ]
    },
    // 27
    'Sandshrew': { 
        hp: 17, ac: 14, str: 14, dex: 10, con: 12, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'ground', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/sandshrew.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Defense Curl' },
            { level: 1, move: 'Sand Attack' },
            { level: 2, move: 'Poison Sting' },
            { level: 2, move: 'Rollout' },
            { level: 2, move: 'Rapin Spin' },
            { level: 2, move: 'Fury Cutter' }
        ],
        features: [
            {
                name: "Sand Veil",
                description: "This Pokémon is immune to Sandstorm damage. In addition, its AC increases by 2 in desert terrain, or during a Sandstorm."
            },
            {
                name: "Sand Rush (Hidden)",
                description: "This Pokémon is immune to Sandstorm damage, and its dex is doubled in desert terrain, or during a Sandstorm."
            }
        ],
        skillProficiencies: ['athletics'],
        saveProficiencies: ['constitution']
    },
    // 28
    'Sandslash': { 
        hp: 50, ac: 16, str: 16, dex: 14, con: 14, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'ground', type2: '', size: 'Medium', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/sandslash.png',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Defense Curl' },
            { level: 1, move: 'Sand Attack' },
            { level: 1, move: 'Crush Claw' },
            { level: 1, move: 'Rollout' },
            { level: 1, move: 'Poison Sting' },
            { level: 1, move: 'Rapid Spin' },
            { level: 1, move: 'Fury Cutter' },
            { level: 6, move: 'Magnitude' },
            { level: 6, move: 'Swift' }
        ],
        features: [
            {
                name: "Sand Veil",
                description: "This Pokémon is immune to Sandstorm damage. In addition, its AC increases by 2 in desert terrain, or during a Sandstorm."
            },
            {
                name: "Sand Rush (Hidden)",
                description: "This Pokémon is immune to Sandstorm damage, and its dex is doubled in desert terrain, or during a Sandstorm."
            }
        ],
        skillProficiencies: ['athletics'],
        saveProficiencies: ['constitution', 'strength']
    },
    // 29
    'Nidoran (F)': { 
        hp: 17, ac: 12, str: 12, dex: 12, con: 12, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'poison', type2: '', size: 'Small', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidoran-f.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Scratch' },
            { level: 2, move: 'Tail Whip' },
            { level: 2, move: 'Double Kick' }
        ],
        features: [
            {
                name: "Poison Point",
                description: "When this Pokémon is hit with a melee attack, roll a 1d4. On a result of 4, the attacker takes an amount of poison damage equal to this Pokémon’s proficiency modifier."
            },
            {
                name: "Rivalry",
                description: "This Pokémon adds its proficiency bonus to damage when attacking a Pokémon of the same type."
            },
            {
                name: "Hustle (Hidden)",
                description: "When you score a critical hit, you may immediately gain an additional action on your turn. If this action is used to make an attack, you have disadvantage on the roll. You may only ever have one additional action per round."
            }
        ],
        skillProficiencies: ['perception'],
        saveProficiencies: ['constitution']
    },
    // 30
    'Nidorina': { 
        hp: 14, ac: 14, str: 12, dex: 11, con: 14, int: 11, wis: 11, cha: 11,
        speed: 25, type1: 'poison', type2: '', size: 'Medium', sr: 4,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidorina.png',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Double Kick' },
            { level: 6, move: 'Poison Sting' }
        ],
        features: [
            {
                name: "Poison Point",
                description: "When this Pokémon is hit with a melee attack, roll a 1d4. On a result of 4, the attacker takes an amount of poison damage equal to this Pokémon’s proficiency modifier."
            },
            {
                name: "Rivalry",
                description: "This Pokémon adds its proficiency bonus to damage when attacking a Pokémon of the same type."
            },
            {
                name: "Hustle (Hidden)",
                description: "When you score a critical hit, you may immediately gain an additional action on your turn. If this action is used to make an attack, you have disadvantage on the roll. You may only ever have one additional action per round."
            }
        ],
        skillProficiencies: ['perception'],
        saveProficiencies: ['constitution']
    },
    // 31
    'Nidoqueen': { 
        hp: 18, ac: 16, str: 18, dex: 15, con: 16, int: 15, wis: 15, cha: 15,
        speed: 30, type1: 'poison', type2: 'ground', size: 'Large', sr: 13,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidoqueen.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Double Kick' },
            { level: 1, move: 'Body Slam' },
            { level: 23, move: 'Body Slam' }
        ]
    },
    // 32
    'Nidoran (M)': { 
        hp: 17, ac: 12, str: 12, dex: 12, con: 12, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'poison', type2: '', size: 'Small', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidoran-f.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Peck' },
            { level: 2, move: 'Focus Energy' },
            { level: 2, move: 'Double Kick' }
        ],
        features: [
            {
                name: "Poison Point",
                description: "When this Pokémon is hit with a melee attack, roll a 1d4. On a result of 4, the attacker takes an amount of poison damage equal to this Pokémon’s proficiency modifier."
            },
            {
                name: "Rivalry",
                description: "This Pokémon adds its proficiency bonus to damage when attacking a Pokémon of the same type."
            },
            {
                name: "Hustle (Hidden)",
                description: "When you score a critical hit, you may immediately gain an additional action on your turn. If this action is used to make an attack, you have disadvantage on the roll. You may only ever have one additional action per round."
            }
        ],
        skillProficiencies: ['perception'],
        saveProficiencies: ['constitution']
    },
    // 33
    'Nidorino': { 
        hp: 45, ac: 14, str: 14, dex: 13, con: 12, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'poison', type2: '', size: 'Medium', sr: 4,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidorino.png',
        learnset: [
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Focus Energy' },
            { level: 1, move: 'Double Kick' },
            { level: 6, move: 'Poison Sting' }
        ],
        features: [
            {
                name: "Poison Point",
                description: "When this Pokémon is hit with a melee attack, roll a 1d4. On a result of 4, the attacker takes an amount of poison damage equal to this Pokémon’s proficiency modifier."
            },
            {
                name: "Rivalry",
                description: "This Pokémon adds its proficiency bonus to damage when attacking a Pokémon of the same type."
            },
            {
                name: "Hustle (Hidden)",
                description: "When you score a critical hit, you may immediately gain an additional action on your turn. If this action is used to make an attack, you have disadvantage on the roll. You may only ever have one additional action per round."
            }
        ],
        skillProficiencies: ['perception'],
        saveProficiencies: ['constitution']
    },
    // 34
    'Nidoking': { 
        hp: 16, ac: 15, str: 20, dex: 16, con: 15, int: 16, wis: 15, cha: 15,
        speed: 35, type1: 'poison', type2: 'ground', size: 'Large', sr: 13,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidoking.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Horn Attack' },
            { level: 1, move: 'Double Kick' },
            { level: 1, move: 'Thrash' },
            { level: 23, move: 'Thrash' }
        ]
    },
    // 35
    'Clefairy': { 
        hp: 18, ac: 13, str: 12, dex: 12, con: 10, int: 6, wis: 12, cha: 12,
        speed: 30, type1: 'fairy', type2: '', size: 'Small', sr: 1,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/clefairy.png',
        learnset: [
            { level: 1, move: 'Pound' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Encore' },
            { level: 1, move: 'Disarming Voice' },
            { level: 1, move: 'Spotlight' },
            { level: 2, move: 'Sing' },
            { level: 2, move: 'Double Slap' }
        ],
        features: [
            {
                name: "Cute Charm",
                description: "Once per short rest, you can impose disadvantage on an enemy attack roll of your choice."
            },
            {
                name: "Magic Guard",
                description: "If this Pokémon is subjected to a move that forces it to make a saving throw to take only half damage, it instead takes no damage on a success."
            },
            {
                name: "Friend Guard (Hidden)",
                description: "Once per long rest, when an ally within 15 feet of this Pokémon is hit by an attack, it may choose to halve the damage dealt."
            }
        ],
        skillProficiencies: ['insight', 'persuasion'],
        saveProficiencies: ['wisdom', 'charisma']
    },
    // 36
    'Clefable': { 
        hp: 19, ac: 15, str: 14, dex: 12, con: 15, int: 16, wis: 18, cha: 18,
        speed: 30, type1: 'fairy', type2: '', size: 'Medium', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/clefable.png',
        learnset: [
            { level: 1, move: 'Sing' },
            { level: 1, move: 'Double Slap' },
            { level: 1, move: 'Minimize' },
            { level: 1, move: 'Metronome' }
        ]
    },
    // 37
    'Vulpix': { 
        hp: 16, ac: 13, str: 10, dex: 13, con: 10, int: 6, wis: 10, cha: 12,
        speed: 30, type1: 'fire', type2: '', size: 'Small', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/vulpix.png',
        learnset: [
            { level: 1, move: 'Ember' },
            { level: 1, move: 'Tail Whip' },
            { level: 2, move: 'Quick Attack' },
            { level: 2, move: 'Roar' },
            { level: 2, move: 'Baby-Doll Eyes' }
        ],
        features: [
            {
                name: "Flash Fire",
                description: "This Pokémon takes no damage from fire or fire-type attacks. Instead, immediately after taking a hit from a fire-type move, or in open flames, double the STAB bonus on the next fire-type move."
            },
            {
                name: "Drought (Hidden)",
                description: "When this Pokémon enters an outside battle, the weather immediately changes to bright sunlight for 5 rounds. In the case of another Pokémon with a similar weather ability, the tie goes to the Pokémon with the highest DEX score."
            }
        ],
        skillProficiencies: ['investigation', 'perception'],
        saveProficiencies: ['dexterity']
    },
    // 38
    'Ninetales': { 
        hp: 15, ac: 15, str: 15, dex: 18, con: 15, int: 18, wis: 18, cha: 18,
        speed: 40, type1: 'fire', type2: '', size: 'Medium', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/ninetales.png',
        learnset: [
            { level: 1, move: 'Ember' },
            { level: 1, move: 'Quick Attack' },
            { level: 1, move: 'Confuse Ray' },
            { level: 1, move: 'Fire Spin' }
        ]
    },
    // 39
    'Jigglypuff': {
        hp: 18, ac: 13, str: 12, dex: 12, con: 10, int: 6, wis: 12, cha: 12,
        speed: 20, type1: 'normal', type2: 'fairy', size: 'Small', sr: 1,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/jigglypuff.png',
        learnset: [
            { level: 1, move: 'Sing' },
            { level: 1, move: 'Defense Curl' },
            { level: 2, move: 'Pound' },
            { level: 2, move: 'Disarming Voice' },
            { level: 2, move: 'Play Nice' }
        ],
        features: [
            {
                name: "Cute Charm",
                description: "Once per short rest, you can impose disadvantage on an enemy attack roll of your choice."
            },
            {
                name: "Competitive",
                description: "This Pokémon adds its proficiency bonus to damage rolls while poisoned, burned, confused, or paralyzed."
            },
            {
                name: "Friend Guard (Hidden)",
                description: "Once per long rest, when an ally within 15 feet of this Pokémon is hit by an attack, it may choose to halve the damage dealt."
            }
        ],
        skillProficiencies: ['performance', 'persuasion'],
        saveProficiencies: ['wisdom', 'charisma']
    },
    // 40
    'Wigglytuff': { 
        hp: 28, ac: 12, str: 14, dex: 9, con: 10, int: 15, wis: 10, cha: 9,
        speed: 25, type1: 'normal', type2: 'fairy', size: 'Medium', sr: 6,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/wigglytuff.png',
        learnset: [
            { level: 1, move: 'Sing' },
            { level: 1, move: 'Disable' },
            { level: 1, move: 'Defense Curl' },
            { level: 1, move: 'Double Slap' }
        ]
    },
    // 41
    'Zubat': { 
        hp: 17, ac: 12, str: 10, dex: 14, con: 12, int: 6, wis: 12, cha: 8,
        speed: 25, type1: 'poison', type2: 'flying', size: 'Small', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/zubat.png',
        learnset: [
            { level: 1, move: 'Absorb' },
            { level: 2, move: 'Supersonic' },
            { level: 2, move: 'Astonish' },
            { level: 2, move: 'Bite' }
        ],
        features: [
            {
                name: "Inner Focus",
                description: "This Pokémon is immune to flinching."
            },
            {
                name: "Infiltrator (Hidden)",
                description: "This Pokémon bypasses Light Screen, Reflect, Substitute, Mist, Safeguard, and Aurora Veil."
            }
        ],
        skillProficiencies: ['stealth'],
        saveProficiencies: ['dexterity']
    },
    // 42
    'Golbat': { 
        hp: 15, ac: 16, str: 16, dex: 18, con: 15, int: 15, wis: 15, cha: 12,
        speed: 35, type1: 'poison', type2: 'flying', size: 'Large', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/golbat.png',
        learnset: [
            { level: 1, move: 'Absorb' },
            { level: 1, move: 'Astonish' },
            { level: 1, move: 'Bite' },
            { level: 1, move: 'Screech' },
            { level: 1, move: 'Supersonic' },
            { level: 6, move: 'Wing Attack' },
            { level: 6, move: 'Confuse Ray' },
            { level: 6, move: 'Air Cutter' },
            { level: 10, move: 'Swift' },
            { level: 10, move: 'Poison Fang' },
            { level: 14, move: 'Mean Look' },
            { level: 14, move: 'Leech Life' },
            { level: 18, move: 'Haze' },
            { level: 18, move: 'Venoshock' },
            { level: 18, move: 'Air Slash' },
            { level: 18, move: 'Quick Guard' }
        ],
        features: [
            {
                name: "Inner Focus",
                description: "This Pokémon is immune to flinching."
            },
            {
                name: "Infiltrator (Hidden)",
                description: "This Pokémon bypasses Light Screen, Reflect, Substitute, Mist, Safeguard, and Aurora Veil."
            }
        ],
        skillProficiencies: ['stealth'],
        saveProficiencies: ['dexterity', 'constitution']
    },
    // 43
    'Oddish': { 
        hp: 17, ac: 13, str: 11, dex: 11, con: 12, int: 6, wis: 10, cha: 12,
        speed: 20, type1: 'grass', type2: 'poison', size: 'Small', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/oddish.png',
        learnset: [
            { level: 1, move: 'Absorb' },
            { level: 1, move: 'Growth' },
            { level: 2, move: 'Acid' },
            { level: 2, move: 'Sweet Scent' }
        ],
        features: [
            {
                name: "Chlorophyll",
                description: "This Pokémon’s speed is doubled in harsh sunlight."
            },
            {
                name: "Run Away (Hidden)",
                description: "This Pokémon cannot be the target of an attack of opportunity."
            }
        ],
        skillProficiencies: ['nature', 'survival'],
        saveProficiencies: ['constitution']
    },
    // 44
    'Gloom': { 
        hp: 50, ac: 14, str: 14, dex: 12, con: 15, int: 6, wis: 12, cha: 10,
        speed: 20, type1: 'grass', type2: 'poison', size: 'Medium', sr: 5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/gloom.png',
        learnset: [
            { level: 1, move: 'Absorb' },
            { level: 1, move: 'Sweet Scent' },
            { level: 1, move: 'Acid' },
            { level: 1, move: 'Growth' },
            { level: 6, move: 'Poison Powder' },
            { level: 6, move: 'Stun Spore' },
            { level: 6, move: 'Sleep Powder' }
        ],
        features: [
            {
                name: "Chlorophyll",
                description: "This Pokémon’s speed is doubled in harsh sunlight."
            },
            {
                name: "Stench (Hidden)",
                description: "When this Pokémon is hit by a melee attack, roll a d10. On a 10, the attacker flinches."
            }
        ],
        skillProficiencies: ['nature', 'survival'],
        saveProficiencies: ['constitution']
    },
    // 45
    'Vileplume': { 
        hp: 15, ac: 16, str: 16, dex: 10, con: 16, int: 18, wis: 18, cha: 12,
        speed: 25, type1: 'grass', type2: 'poison', size: 'Medium', sr: 13,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/vileplume.png',
        learnset: [
            { level: 1, move: 'Stun Spore' },
            { level: 1, move: 'Sleep Powder' },
            { level: 1, move: 'Acid' },
            { level: 1, move: 'Petal Dance' }
        ]
    },
    // 46
    'Paras': { 
        hp: 18, ac: 13, str: 12, dex: 9, con: 15, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'bug', type2: 'grass', size: 'Small', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/paras.png',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 2, move: 'Stun Spore' },
            { level: 2, move: 'Poison Powder' },
            { level: 2, move: 'Absorb' }
        ],
        features: [
            {
                name: "Effect Spore",
                description: "When hit by a melee attack, roll a d4. On a 4, deal an amount of grass damage equal to your proficiency modifier to your attacker."
            },
            {
                name: "Dry Skin",
                description: "At the end of each of this Pokémon's turns, it takes an amount of damage equal to its proficiency modifier in harsh sunlight, or heals for the same amount during rain."
            },
            {
                name: "Damp (Hidden)",
                description: "This Pokémon is unaffected by Self Destruct and Explosion moves."
            }
        ],
        skillProficiencies: ['nature'],
        saveProficiencies: ['constitution']
    },
    // 47
    'Parasect': { 
        hp: 13, ac: 16, str: 19, dex: 6, con: 16, int: 12, wis: 16, cha: 12,
        speed: 20, type1: 'bug', type2: 'grass', size: 'Medium', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/parasect.png',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Stun Spore' },
            { level: 1, move: 'Poison Powder' },
            { level: 7, move: 'Stun Spore' },
            { level: 13, move: 'Poison Powder' },
            { level: 19, move: 'Leech Life' },
            { level: 28, move: 'Spore' },
            { level: 37, move: 'Slash' }
        ]
    },
    // 48
    'Venonat': { 
        hp: 16, ac: 13, str: 13, dex: 11, con: 11, int: 6, wis: 12, cha: 10,
        speed: 20, type1: 'bug', type2: 'poison', size: 'Medium', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/venonat.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Disable' },
            { level: 1, move: 'Foresight' },
            { level: 2, move: 'Supersonic' },
            { level: 2, move: 'Confusion' }
        ],
        features: [
            {
                name: "Compound Eyes",
                description: "This Pokémon gets an additional +1 to attack rolls."
            },
            {
                name: "Tinted Lens",
                description: "This Pokémon’s moves ignore resistances."
            },
            {
                name: "Run Away (Hidden)",
                description: "This Pokémon cannot be the target of an attack of opportunity."
            }
        ],
        skillProficiencies: ['nature'],
        saveProficiencies: ['constitution']
    },
    // 49
    'Venomoth': { 
        hp: 14, ac: 13, str: 13, dex: 18, con: 12, int: 18, wis: 15, cha: 18,
        speed: 35, type1: 'bug', type2: 'poison', size: 'Large', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/venomoth.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Disable' },
            { level: 1, move: 'Foresight' },
            { level: 1, move: 'Gust' },
            { level: 9, move: 'Foresight' },
            { level: 17, move: 'Supersonic' },
            { level: 20, move: 'Confusion' },
            { level: 25, move: 'Poison Powder' }
        ]
    },
    // 50
    'Diglett': { 
        hp: 2, ac: 12, str: 11, dex: 19, con: 10, int: 6, wis: 9, cha: 9,
        speed: 35, type1: 'ground', type2: '', size: 'Tiny', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/diglett.png',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 5, move: 'Growl' },
            { level: 9, move: 'Magnitude' },
            { level: 17, move: 'Dig' },
            { level: 25, move: 'Sand Attack' },
            { level: 33, move: 'Slash' }
        ]
    },
    // 51
    'Dugtrio': { 
        hp: 9, ac: 12, str: 16, dex: 22, con: 12, int: 10, wis: 14, cha: 14,
        speed: 50, type1: 'ground', type2: '', size: 'Small', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/dugtrio.png',
        learnset: [
            { level: 1, move: 'Tri Attack' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Magnitude' },
            { level: 5, move: 'Growl' },
            { level: 9, move: 'Magnitude' },
            { level: 17, move: 'Dig' },
            { level: 26, move: 'Sand Attack' },
            { level: 38, move: 'Slash' }
        ]
    },
    // 52
    'Meowth': { 
        hp: 16, ac: 13, str: 10, dex: 15, con: 10, int: 8, wis: 10, cha: 12,
        speed: 30, type1: 'normal', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/meowth.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Growl' },
            { level: 2, move: 'Bite' },
            { level: 2, move: 'Fake Out' }
        ],
        features: [
            {
                name: "Pickup",
                description: "If an opponent uses a consumable held item in battle, this Pokémon gains a copy of it if it is not currently holding an item."
            },
            {
                name: "Technician",
                description: "For damaging moves activated by this Pokémon with 15 max PP or more, they may roll the damage twice and choose either total."
            },
            {
                name: "Unnerve (Hidden)",
                description: "Opponents in combat with this Pokémon cannot eat held berries."
            }
        ],
        skillProficiencies: ['persuasion', 'deception', 'slight_of_hand'],
        saveProficiencies: ['dexterity', 'charisma']
    },
    // 53
    'Persian': { 
        hp: 13, ac: 13, str: 14, dex: 21, con: 13, int: 13, wis: 13, cha: 16,
        speed: 45, type1: 'normal', type2: '', size: 'Medium', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/persian.png',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Bite' },
            { level: 11, move: 'Bite' },
            { level: 20, move: 'Pay Day' },
            { level: 29, move: 'Screech' },
            { level: 38, move: 'Fury Swipes' },
            { level: 46, move: 'Slash' }
        ]
    },
    // 54
    'Psyduck': { 
        hp: 11, ac: 11, str: 10, dex: 11, con: 10, int: 13, wis: 10, cha: 11,
        speed: 25, type1: 'water', type2: '', size: 'Medium', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/psyduck.png',
        learnset: [
            { level: 1, move: 'Water Sport' },
            { level: 1, move: 'Scratch' },
            { level: 5, move: 'Tail Whip' },
            { level: 10, move: 'Water Gun' },
            { level: 16, move: 'Disable' },
            { level: 23, move: 'Confusion' }
        ]
    },
    // 55
    'Golduck': { 
        hp: 16, ac: 15, str: 16, dex: 16, con: 15, int: 19, wis: 16, cha: 16,
        speed: 35, type1: 'water', type2: '', size: 'Large', sr: 10,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/golduck.png',
        learnset: [
            { level: 1, move: 'Water Sport' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Water Gun' },
            { level: 5, move: 'Tail Whip' },
            { level: 10, move: 'Water Gun' },
            { level: 16, move: 'Disable' },
            { level: 23, move: 'Confusion' }
        ]
    },
    // 56
    'Mankey': { 
        hp: 16, ac: 12, str: 12, dex: 14, con: 11, int: 6, wis: 10, cha: 8,
        speed: 20, type1: 'fighting', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/mankey.png',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Fling' },
            { level: 1, move: 'Rage' },
            { level: 1, move: 'Low Kick' },
            { level: 1, move: 'Karate Chop' },
            { level: 1, move: 'Fury Swipes' },
            { level: 1, move: 'Focus Energy' },
            { level: 6, move: 'Pursuit' },
            { level: 6, move: 'Seismic Toss' },
            { level: 1, move: 'Rock Tomb' }
        ],
        features: [
            {
                name: "Vital Spirit",
                description: "This Pokémon cannot be put to sleep."
            },
            {
                name: "Anger Point",
                description: "After suffering a critical hit, this Pokémon doubles the damage dice for a single move it activates on the following turn."
            },
            {
                name: "Defiant (Hidden)",
                description: "While this Pokémon is suffering from a negative status effect or stat change imposed by an opponent, it gains +2 to all attack rolls."
            }
        ],
        skillProficiencies: ['athletics, acrobatics'],
        saveProficiencies: ['dexterity, strength']
    },
    // 57
    'Primeape': { 
        hp: 45, ac: 15, str: 16, dex: 16, con: 13, int: 6, wis: 12, cha: 8,
        speed: 30, type1: 'fighting', type2: '', size: 'Medium', sr: 6,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/primeape.png',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Fling' },
            { level: 1, move: 'Rage' },
            { level: 1, move: 'Low Kick' },
            { level: 1, move: 'Karate Chop' },
            { level: 1, move: 'Fury Swipes' },
            { level: 1, move: 'Focus Energy' },
            { level: 6, move: 'Pursuit' },
            { level: 6, move: 'Seismic Toss' },
            { level: 1, move: 'Rock Tomb' }
        ],
        features: [
            {
                name: "Vital Spirit",
                description: "This Pokémon cannot be put to sleep."
            },
            {
                name: "Anger Point",
                description: "After suffering a critical hit, this Pokémon doubles the damage dice for a single move it activates on the following turn."
            },
            {
                name: "Defiant (Hidden)",
                description: "While this Pokémon is suffering from a negative status effect or stat change imposed by an opponent, it gains +2 to all attack rolls."
            }
        ],
        skillProficiencies: ['athletics, acrobatics'],
        saveProficiencies: ['dexterity, strength']
    },
    // 58
    'Growlithe': { 
        hp: 16, ac: 13, str: 13, dex: 14, con: 10, int: 6, wis: 10, cha: 10,
        speed: 25, type1: 'fire', type2: '', size: 'Medium', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/growlithe.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Bite' },
            { level: 1, move: 'Roar' },
            { level: 2, move: 'Ember' },
            { level: 2, move: 'Leer' }
        ],
        features: [
            {
                name: "Intimidate",
                description: "Once per short rest, you can impose disadvantage on an enemy attack roll of your choice."
            },
            {
                name: "Flash Fire",
                description: "This Pokémon takes no damage from fire or fire-type attacks. Instead, immediately after taking a hit from a fire-type move, or in open flames, double the STAB bonus on the next fire-type move."
            }
        ],
        skillProficiencies: ['perception'],
        saveProficiencies: ['dexterity']
    },
    // 59
    'Arcanine': { 
        hp: 18, ac: 16, str: 20, dex: 19, con: 16, int: 18, wis: 16, cha: 16,
        speed: 40, type1: 'fire', type2: '', size: 'Large', sr: 11,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/arcanine.png',
        learnset: [
            { level: 1, move: 'Roar' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Take Down' },
            { level: 1, move: 'Flame Wheel' }
        ]
    },
    // 60
    'Poliwag': { 
        hp: 16, ac: 13, str: 10, dex: 14, con: 11, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'water', type2: '', size: 'Small', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/poliwag.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Water Sport' },
            { level: 2, move: 'Water Gun' },
            { level: 2, move: 'Hypnosis' },
            { level: 2, move: 'Bubble' }
        ],
        features: [
            {
                name: "Water Absorb",
                description: "This Pokémon takes no damage from water or water-type attacks. Instead, half of any water damage done is absorbed, restoring the Pokémon's HP."
            },
            {
                name: "Damp",
                description: "This Pokémon is unaffected by Self Destruct and Explosion moves."
            }
        ],
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity']
    },
    // 61
    'Poliwhirl': { 
        hp: 45, ac: 14, str: 12, dex: 15, con: 12, int: 6, wis: 12, cha: 10,
        speed: 25, type1: 'water', type2: '', size: 'Medium', sr: 3,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/poliwhirl.png',
        learnset: [
            { level: 1, move: 'Water Sport' },
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Water Gun' },
            { level: 1, move: 'Bubble' },
            { level: 6, move: 'Double Slap' },
            { level: 6, move: 'Rain Dance' }
        ],
        features: [
            {
                name: "Water Absorb",
                description: "This Pokémon takes no damage from water or water-type attacks. Instead, half of any water damage done is absorbed, restoring the Pokémon's HP."
            },
            {
                name: "Damp",
                description: "This Pokémon is unaffected by Self Destruct and Explosion moves."
            },
            {
                name: "Swift Swim (Hidden)",
                description: "This Pokémon's speed is doubled in rainy conditions."
            }
        ],
        skillProficiencies: ['acrobatics', 'athletics'],
        saveProficiencies: ['dexterity', 'strength']
    },
    // 62
    'Poliwrath': { 
        hp: 18, ac: 19, str: 19, dex: 14, con: 19, int: 14, wis: 18, cha: 18,
        speed: 30, type1: 'water', type2: 'fighting', size: 'Large', sr: 12,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/poliwrath.png',
        learnset: [
            { level: 1, move: 'Water Sport' },
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Water Gun' },
            { level: 1, move: 'Double Slap' }
        ]
    },
    // 63
    'Abra': { 
        hp: 15, ac: 12, str: 9, dex: 13, con: 8, int: 12, wis: 12, cha: 10,
        speed: 20, type1: 'psychic', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/abra.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Teleport' },
            { level: 1, move: 'Scratch' }
        ],
        features: [
            {
                name: "Synchronize",
                description: "If this Pokémon becomes burned, paralyzed, or poisoned, its attacker receives the negative status condition as well (if not immune)."
            },
            {
                name: "Inner Focus",
                description: "This Pokémon is immune to flinching."
            },
            {
                name: "Magic Guard",
                description: "If this Pokémon is subjected to a move that forces it to make a saving throw to take only half damage, it instead takes no damage on a success."
            }
        ],
        skillProficiencies: ['arcana', 'insight'],
        saveProficiencies: ['wisdom']
    },
    // 64
    'Kadabra': { 
        hp: 40, ac: 14, str: 11, dex: 15, con: 10, int: 14, wis: 14, cha: 10,
        speed: 30, type1: 'psychic', type2: '', size: 'Medium', sr: 6,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/kadabra.png',
        learnset: [
            { level: 1, move: 'Teleport' },
            { level: 1, move: 'Kinesis' },
            { level: 1, move: 'Confusion' },
            { level: 6, move: 'Disable' }
        ],
        features: [
            {
                name: "Synchronize",
                description: "If this Pokémon becomes burned, paralyzed, or poisoned, its attacker receives the negative status condition as well (if not immune)."
            },
            {
                name: "Inner Focus",
                description: "This Pokémon is immune to flinching."
            },
            {
                name: "Magic Guard",
                description: "If this Pokémon is subjected to a move that forces it to make a saving throw to take only half damage, it instead takes no damage on a success."
            }
        ],
        skillProficiencies: ['arcana', 'insight'],
        saveProficiencies: ['wisdom']
    },
    // 65
    'Alakazam': { 
        hp: 12, ac: 12, str: 10, dex: 22, con: 9, int: 27, wis: 19, cha: 18,
        speed: 50, type1: 'psychic', type2: '', size: 'Medium', sr: 12,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/alakazam.png',
        learnset: [
            { level: 1, move: 'Teleport' },
            { level: 1, move: 'Kinesis' },
            { level: 1, move: 'Confusion' },
            { level: 16, move: 'Confusion' },
            { level: 18, move: 'Disable' },
            { level: 21, move: 'Psybeam' },
            { level: 26, move: 'Recover' },
            { level: 31, move: 'Psychic' }
        ]
    },
    // 66
    'Machop': { 
        hp: 17, ac: 12, str: 14, dex: 12, con: 12, int: 6, wis: 10, cha: 10,
        speed: 25, type1: 'fighting', type2: '', size: 'Medium', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/machop.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Low Kick' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Focus Energy' },
            { level: 2, move: 'Karate Chop' },
            { level: 2, move: 'Foresight' }
        ],
        features: [
            {
                name: "Guts",
                description: "When this Pokémon is burned or poisoned, they are not affected by the disadvantage or reduced damage effects. They still take damage at the end of each of their turns."
            },
            {
                name: "No Guard",
                description: "Any attack made by or against this Pokémon has advantage."
            },
            {
                name: "Steadfast (Hidden)",
                description: "Once per long rest, when this Pokémon fails a saving throw against a status condition, it can choose to pass instead."
            }
        ],
        skillProficiencies: ['athletics', 'acrobatics'],
        saveProficiencies: ['strength', 'dexterity']
    },
    // 67
    'Machoke': { 
        hp: 50, ac: 14, str: 15, dex: 13, con: 14, int: 6, wis: 12, cha: 10,
        speed: 25, type1: 'fighting', type2: '', size: 'Large', sr: 5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/machoke.png',
        learnset: [
            { level: 1, move: 'Low Kick' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Focus Energy' },
            { level: 1, move: 'Karate Chop' },
            { level: 1, move: 'Foresight' },
            { level: 6, move: 'Low Sweep' },
            { level: 6, move: 'Seismic Toss' },
            { level: 6, move: 'Revenge' }
        ],
        features: [
            {
                name: "Guts",
                description: "When this Pokémon is burned or poisoned, they are not affected by the disadvantage or reduced damage effects. They still take damage at the end of each of their turns."
            },
            {
                name: "No Guard",
                description: "Any attack made by or against this Pokémon has advantage."
            },
            {
                name: "Steadfast (Hidden)",
                description: "Once per long rest, when this Pokémon fails a saving throw against a status condition, it can choose to pass instead."
            }
        ],
        skillProficiencies: ['athletics', 'acrobatics'],
        saveProficiencies: ['strength', 'dexterity']
    },
    // 68
    'Machamp': { 
        hp: 18, ac: 16, str: 26, dex: 11, con: 16, int: 13, wis: 15, cha: 15,
        speed: 25, type1: 'fighting', type2: '', size: 'Large', sr: 12,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/machamp.png',
        learnset: [
            { level: 1, move: 'Low Kick' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Focus Energy' },
            { level: 1, move: 'Karate Chop' },
            { level: 7, move: 'Focus Energy' },
            { level: 13, move: 'Karate Chop' },
            { level: 19, move: 'Seismic Toss' },
            { level: 25, move: 'Foresight' },
            { level: 34, move: 'Vital Throw' }
        ]
    },
    // 69
    'Bellsprout': { 
        hp: 18, ac: 11, str: 10, dex: 12, con: 14, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'grass', type2: 'poison', size: 'Medium', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/bellsprout.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Vine Whip' },
            { level: 2, move: 'Growth' },
            { level: 2, move: 'Wrap' }
        ],
        features: [
            {
                name: "Chlorophyll",
                description: "This Pokémon’s speed is doubled in harsh sunlight."
            },
            {
                name: "Gluttony (Hidden)",
                description: "This Pokémon must eat its held berry when it falls below ½ of its maximum HP."
            }
        ],
        skillProficiencies: ['nature', 'survival'],
        saveProficiencies: ['constitution']
    },
    // 70
    'Weepinbell': { 
        hp: 50, ac: 13, str: 13, dex: 14, con: 15, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'grass', type2: 'poison', size: 'Medium', sr: 5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/weepinbell.png',
        learnset: [
            { level: 1, move: 'Vine Whip' },
            { level: 1, move: 'Growth' },
            { level: 1, move: 'Wrap' },
            { level: 6, move: 'Sleep Powder' },
            { level: 6, move: 'Poison Powder' },
            { level: 6, move: 'Stun Spore' }
        ],
        features: [
            {
                name: "Chlorophyll",
                description: "This Pokémon’s speed is doubled in harsh sunlight."
            },
            {
                name: "Gluttony (Hidden)",
                description: "This Pokémon must eat its held berry when it falls below ½ of its maximum HP."
            }
        ],
        skillProficiencies: ['nature', 'survival'],
        saveProficiencies: ['constitution']
    },
    // 71
    'Victreebel': { 
        hp: 16, ac: 13, str: 20, dex: 14, con: 13, int: 18, wis: 12, cha: 15,
        speed: 30, type1: 'grass', type2: 'poison', size: 'Large', sr: 12,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/victreebel.png',
        learnset: [
            { level: 1, move: 'Stockpile' },
            { level: 1, move: 'Swallow' },
            { level: 1, move: 'Spit Up' },
            { level: 1, move: 'Vine Whip' }
        ]
    },
    // 72
    'Tentacool': { 
        hp: 8, ac: 12, str: 8, dex: 14, con: 7, int: 10, wis: 22, cha: 18,
        speed: 30, type1: 'water', type2: 'poison', size: 'Small', sr: 2,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/tentacool.png',
        learnset: [
            { level: 1, move: 'Poison Sting' },
            { level: 6, move: 'Supersonic' },
            { level: 12, move: 'Constrict' },
            { level: 19, move: 'Acid' },
            { level: 25, move: 'Bubble Beam' },
            { level: 30, move: 'Wrap' }
        ]
    },
    // 73
    'Tentacruel': { 
        hp: 16, ac: 13, str: 14, dex: 22, con: 13, int: 22, wis: 22, cha: 22,
        speed: 50, type1: 'water', type2: 'poison', size: 'Large', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/tentacruel.png',
        learnset: [
            { level: 1, move: 'Poison Sting' },
            { level: 1, move: 'Supersonic' },
            { level: 1, move: 'Constrict' },
            { level: 6, move: 'Supersonic' },
            { level: 12, move: 'Constrict' },
            { level: 19, move: 'Acid' },
            { level: 25, move: 'Bubble Beam' },
            { level: 30, move: 'Wrap' },
            { level: 38, move: 'Barrier' }
        ]
    },
    // 74
    'Geodude': { 
        hp: 18, ac: 13, str: 14, dex: 9, con: 14, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'rock', type2: 'ground', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/geodude.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Defense Curl' },
            { level: 2, move: 'Mud Sport' },
            { level: 2, move: 'Rollout' },
            { level: 6, move: 'Magnitude' },
            { level: 6, move: 'Rock Throw' },
            { level: 6, move: 'Smack Down' }
        ],
        features: [
            {
                name: "Rock Head",
                description: "This Pokémon takes no recoil damage."
            },
            {
                name: "Sturdy",
                description: "When taking damage equal to half or more of your current HP, roll a d4. On a result of 3 of 4, halve the damage dealt."
            },
            {
                name: "Sand Veil (Hidden)",
                description: "This Pokémon is immune to Sandstorm damage. In addition, its AC increases by 2 in desert terrain, or during a Sandstorm."
            }
        ],
        skillProficiencies: ['athletics', 'survival'],
        saveProficiencies: ['constitution']
    },
    // 75
    'Graveler': { 
        hp: 55, ac: 15, str: 16, dex: 10, con: 16, int: 6, wis: 12, cha: 10,
        speed: 25, type1: 'rock', type2: 'ground', size: 'Medium', sr: 6,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/graveler.png',
        learnset: [
            { level: 1, move: 'Mud Sport' },
            { level: 1, move: 'Defense Curl' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Rollout' },
            { level: 6, move: 'Rock Throw' },
            { level: 6, move: 'Magnitude' },
            { level: 6, move: 'Smack Down' }
        ],
        features: [
            {
                name: "Rock Head",
                description: "This Pokémon takes no recoil damage."
            },
            {
                name: "Sturdy",
                description: "When taking damage equal to half or more of your current HP, roll a d4. On a result of 3 of 4, halve the damage dealt."
            },
            {
                name: "Sand Veil (Hidden)",
                description: "This Pokémon is immune to Sandstorm damage. In addition, its AC increases by 2 in desert terrain, or during a Sandstorm."
            }
        ],
        skillProficiencies: ['athletics', 'survival'],
        saveProficiencies: ['constitution', 'strength']
    },
    // 76
    'Golem': { 
        hp: 16, ac: 26, str: 22, dex: 9, con: 13, int: 11, wis: 13, cha: 11,
        speed: 25, type1: 'rock', type2: 'ground', size: 'Large', sr: 13,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/golem.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Defense Curl' },
            { level: 1, move: 'Rock Throw' },
            { level: 1, move: 'Magnitude' },
            { level: 6, move: 'Rock Throw' },
            { level: 11, move: 'Magnitude' },
            { level: 16, move: 'Self-Destruct' },
            { level: 21, move: 'Harden' },
            { level: 29, move: 'Earthquake' }
        ]
    },
    // 77
    'Ponyta': { 
        hp: 18, ac: 14, str: 12, dex: 15, con: 10, int: 6, wis: 10, cha: 10,
        speed: 40, type1: 'fire', type2: '', size: 'Medium', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/ponyta.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Growl' },
            { level: 2, move: 'Tail Whip' },
            { level: 2, move: 'Ember' }
        ],
        features: [
            {
                name: "Run Away",
                description: "This Pokémon cannot be the target of an attack of opportunity."
            },
            {
                name: "Flash Fire",
                description: "This Pokémon takes no damage from fire or fire-type attacks. Instead, immediately after taking a hit from a fire-type move, or in open flames, double the STAB bonus on the next fire-type move."
            },
            {
                name: "Flame Body (Hidden)",
                description: "The flames from this Pokémon's body shine dim light in a 15 ft radius. In addition, when hit by a melee attack, roll a d10. On a 10, the attacker is burned."
            }
        ],
        skillProficiencies: ['athletics'],
        saveProficiencies: ['dexterity']
    },
    // 78
    'Rapidash': { 
        hp: 98, ac: 16, str: 16, dex: 18, con: 14, int: 6, wis: 12, cha: 12,
        speed: 40, type1: 'fire', type2: '', size: 'Large', sr: 11,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/rapidash.png',
        learnset: [
            { level: 1, move: 'Ember' },
            { level: 1, move: 'Fury Attack' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Megahorn' },
            { level: 1, move: 'Poison Jab' },
            { level: 1, move: 'Quick Attack' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Flame Wheel' },
            { level: 1, move: 'Stomp' },
            { level: 1, move: 'Flame Charge' },
            { level: 1, move: 'Fire Spin' }
        ],
        features: [
            {
                name: "Run Away",
                description: "This Pokémon cannot be the target of an attack of opportunity."
            },
            {
                name: "Flash Fire",
                description: "This Pokémon takes no damage from fire or fire-type attacks. Instead, immediately after taking a hit from a fire-type move, or in open flames, double the STAB bonus on the next fire-type move."
            },
            {
                name: "Flame Body (Hidden)",
                description: "The flames from this Pokémon's body shine dim light in a 15 ft radius. In addition, when hit by a melee attack, roll a d10. On a 10, the attacker is burned."
            }
        ],
        skillProficiencies: ['athletics'],
        saveProficiencies: ['dexterity']
    },
    // 79
    'Slowpoke': { 
        hp: 20, ac: 12, str: 12, dex: 8, con: 14, int: 6, wis: 12, cha: 10,
        speed: 15, type1: 'water', type2: 'psychic', size: 'Medium', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/slowpoke.png',
        learnset: [
            { level: 1, move: 'Curse' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Yawn' },
            { level: 2, move: 'Water Gun' },
            { level: 2, move: 'Growl' }
        ],
        features: [
            {
                name: "Oblivious",
                description: "This Pokémon is immune to moves that attempt to charm or taunt it."
            },
            {
                name: "Own Tempo",
                description: "This Pokémon is immune to becoming confused."
            },
            {
                name: "Regenerator (Hidden)",
                description: "Once per long rest, this Pokémon regains hit points equal to its level when it returns to its Pokéball."
            }
        ],
        skillProficiencies: ['insight', 'history'],
        saveProficiencies: ['constitution', 'wisdom']
    },
    // 80
    'Slowbro': { 
        hp: 19, ac: 22, str: 15, dex: 6, con: 19, int: 18, wis: 16, cha: 16,
        speed: 15, type1: 'water', type2: 'psychic', size: 'Large', sr: 11,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/slowbro.png',
        learnset: [
            { level: 1, move: 'Curse' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Water Gun' },
            { level: 6, move: 'Growl' },
            { level: 15, move: 'Water Gun' },
            { level: 20, move: 'Confusion' },
            { level: 29, move: 'Disable' },
            { level: 37, move: 'Withdraw' }
        ]
    },
    // 81
    'Magnemite': { 
        hp: 18, ac: 14, str: 10, dex: 12, con: 14, int: 8, wis: 10, cha: 8,
        speed: 20, type1: 'electric', type2: 'steel', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/magnemite.png',
        learnset: [
            { level: 1, move: 'Supersonic' },
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Thunder Shock' },
            { level: 2, move: 'Magnet Bomb' },
            { level: 2, move: 'Thunder Wave' },
            { level: 6, move: 'Light Screen' },
            { level: 6, move: 'Sonic Boom' },
            { level: 6, move: 'Spark' }
        ],
        features: [
            {
                name: "Magnet Pull",
                description: "Steel opponents in battle with this Pokémon may not switch out or flee."
            },
            {
                name: "Sturdy",
                description: "When taking damage equal to half or more of your current HP, roll a d4. On a result of 3 of 4, halve the damage dealt."
            },
            {
                name: "Analytic (Hidden)",
                description: "After this Pokémon misses an attack, its next attack is done at advantage."
            }
        ],
        skillProficiencies: ['insight', 'acrobatics'],
        saveProficiencies: ['constitution']
    },
    // 82
    'Magneton': { 
        hp: 11, ac: 19, str: 12, dex: 14, con: 16, int: 22, wis: 14, cha: 14,
        speed: 30, type1: 'electric', type2: 'steel', size: 'Medium', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/magneton.png',
        learnset: [
            { level: 1, move: 'Metal Sound' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Thunder Shock' },
            { level: 1, move: 'Supersonic' },
            { level: 6, move: 'Thunder Shock' },
            { level: 11, move: 'Supersonic' },
            { level: 16, move: 'Sonic Boom' },
            { level: 21, move: 'Thunder Wave' },
            { level: 27, move: 'Lock-On' }
        ]
    },
    // 83
    "Farfetch'd": { 
        hp: 10, ac: 12, str: 18, dex: 12, con: 11, int: 12, wis: 12, cha: 12,
        speed: 30, type1: 'normal', type2: 'flying', size: 'Medium', sr: 3,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/farfetchd.png',
        learnset: [
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Sand Attack' },
            { level: 7, move: 'Leer' },
            { level: 13, move: 'Fury Attack' },
            { level: 19, move: 'Swords Dance' },
            { level: 25, move: 'Agility' }
        ]
    },
    // 84
    'Doduo': { 
        hp: 17, ac: 12, str: 10, dex: 15, con: 12, int: 6, wis: 10, cha: 10,
        speed: 35, type1: 'normal', type2: 'flying', size: 'Medium', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/doduo.png',
        learnset: [
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Growl' },
            { level: 2, move: 'Rage' },
            { level: 2, move: 'Fury Attack' }
        ],
        features: [
            {
                name: "Run Away",
                description: "This Pokémon cannot be the target of an attack of opportunity."
            },
            {
                name: "Early Bird",
                description: "This Pokémon has advantage on rolls to wake from sleep."
            },
            {
                name: "Tangled Feet (Hidden)",
                description: "Attacks against this Pokémon have disadvantage when it is confused."
            }
        ],
        skillProficiencies: ['perception', 'acrobatics'],
        saveProficiencies: ['dexterity']
    },
    // 85
    'Dodrio': { 
        hp: 13, ac: 14, str: 22, dex: 20, con: 13, int: 12, wis: 12, cha: 12,
        speed: 50, type1: 'normal', type2: 'flying', size: 'Large', sr: 9,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/dodrio.png',
        learnset: [
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Pursuit' },
            { level: 9, move: 'Pursuit' },
            { level: 13, move: 'Fury Attack' },
            { level: 21, move: 'Tri Attack' },
            { level: 25, move: 'Rage' },
            { level: 38, move: 'Drill Peck' }
        ]
    },
    // 86
    'Seel': { 
        hp: 13, ac: 12, str: 9, dex: 9, con: 14, int: 9, wis: 14, cha: 14,
        speed: 25, type1: 'water', type2: '', size: 'Medium', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/seel.png',
        learnset: [
            { level: 1, move: 'Headbutt' },
            { level: 5, move: 'Growl' },
            { level: 16, move: 'Aurora Beam' },
            { level: 21, move: 'Rest' },
            { level: 32, move: 'Take Down' },
            { level: 37, move: 'Ice Beam' }
        ]
    },
    // 87
    'Dewgong': { 
        hp: 18, ac: 16, str: 14, dex: 14, con: 16, int: 14, wis: 19, cha: 18,
        speed: 30, type1: 'water', type2: 'ice', size: 'Large', sr: 10,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/dewgong.png',
        learnset: [
            { level: 1, move: 'Headbutt' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Aurora Beam' },
            { level: 5, move: 'Growl' },
            { level: 16, move: 'Aurora Beam' },
            { level: 21, move: 'Rest' },
            { level: 32, move: 'Take Down' },
            { level: 42, move: 'Ice Beam' },
            { level: 56, move: 'Safeguard' }
        ]
    },
    // 88
    'Grimer': { 
        hp: 19, ac: 12, str: 14, dex: 9, con: 16, int: 6, wis: 10, cha: 8,
        speed: 15, type1: 'poison', type2: '', size: 'Medium', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/grimer.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Poison Gas' },
            { level: 1, move: 'Pound' },
            { level: 2, move: 'Harden' },
            { level: 2, move: 'Mud-Slap' }
        ],
        features: [
            {
                name: "Stench",
                description: "When this Pokémon is hit by a melee attack, roll a d10. On a 10, the attacker flinches."
            },
            {
                name: "Poison Touch (Hidden)",
                description: "On melee attacks made by this Pokémon, roll a d10 on a hit. On a result of a 10, the target is poisoned."
            }
        ],
        skillProficiencies: ['stealth'],
        saveProficiencies: ['constitution']
    },
    // 89
    'Muk': { 
        hp: 20, ac: 15, str: 20, dex: 10, con: 15, int: 13, wis: 18, cha: 18,
        speed: 25, type1: 'poison', type2: '', size: 'Large', sr: 10,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/muk.png',
        learnset: [
            { level: 1, move: 'Poison Gas' },
            { level: 1, move: 'Pound' },
            { level: 1, move: 'Harden' },
            { level: 5, move: 'Harden' },
            { level: 10, move: 'Disable' },
            { level: 16, move: 'Sludge' },
            { level: 23, move: 'Minimize' },
            { level: 31, move: 'Screech' }
        ]
    },
    // 90
    'Shellder': { 
        hp: 6, ac: 18, str: 13, dex: 8, con: 10, int: 9, wis: 9, cha: 9,
        speed: 20, type1: 'water', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/shellder.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Withdraw' },
            { level: 9, move: 'Supersonic' },
            { level: 17, move: 'Aurora Beam' },
            { level: 25, move: 'Protect' },
            { level: 33, move: 'Leer' }
        ]
    },
    // 91
    'Cloyster': { 
        hp: 11, ac: 36, str: 19, dex: 14, con: 9, int: 16, wis: 9, cha: 9,
        speed: 30, type1: 'water', type2: 'ice', size: 'Large', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/cloyster.png',
        learnset: [
            { level: 1, move: 'Withdraw' },
            { level: 1, move: 'Supersonic' },
            { level: 1, move: 'Aurora Beam' },
            { level: 1, move: 'Protect' },
            { level: 1, move: 'Spike Cannon' }
        ]
    },
    // 92
    'Gastly': { 
        hp: 6, ac: 10, str: 7, dex: 16, con: 6, int: 18, wis: 11, cha: 11,
        speed: 35, type1: 'ghost', type2: 'poison', size: 'Medium', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/gastly.png',
        learnset: [
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Lick' },
            { level: 8, move: 'Spite' },
            { level: 13, move: 'Mean Look' },
            { level: 16, move: 'Curse' },
            { level: 21, move: 'Night Shade' }
        ]
    },
    // 93
    'Haunter': { 
        hp: 9, ac: 11, str: 10, dex: 19, con: 9, int: 21, wis: 14, cha: 14,
        speed: 40, type1: 'ghost', type2: 'poison', size: 'Medium', sr: 5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/haunter.png',
        learnset: [
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Lick' },
            { level: 1, move: 'Spite' },
            { level: 8, move: 'Spite' },
            { level: 13, move: 'Mean Look' },
            { level: 16, move: 'Curse' },
            { level: 21, move: 'Night Shade' },
            { level: 31, move: 'Confuse Ray' }
        ]
    },
    // 94
    'Gengar': { 
        hp: 13, ac: 13, str: 13, dex: 21, con: 13, int: 26, wis: 15, cha: 15,
        speed: 50, type1: 'ghost', type2: 'poison', size: 'Medium', sr: 12,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/gengar.png',
        learnset: [
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Lick' },
            { level: 1, move: 'Spite' },
            { level: 1, move: 'Mean Look' },
            { level: 8, move: 'Spite' },
            { level: 13, move: 'Mean Look' },
            { level: 16, move: 'Curse' },
            { level: 21, move: 'Night Shade' },
            { level: 31, move: 'Confuse Ray' }
        ]
    },
    // 95
    'Onix': { 
        hp: 65, ac: 17, str: 18, dex: 13, con: 16, int: 6, wis: 12, cha: 10,
        speed: 25, type1: 'rock', type2: 'ground', size: 'Huge', sr: 10,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/onix.png',
        learnset: [
            { level: 1, move: 'Bind' },
            { level: 1, move: 'Harden' },
            { level: 1, move: 'Mud Sport' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Curse' },
            { level: 1, move: 'Rock Throw' },
            { level: 1, move: 'Rock Tomb' },
            { level: 6, move: 'Rage' },
            { level: 6, move: 'Stealth Rock' },
            { level: 6, move: 'Rock Polish' }
        ],
        features: [
            {
                name: "Rock Head",
                description: "This Pokémon takes no recoil damage."
            },
            {
                name: "Sturdy",
                description: "When taking damage equal to half or more of your current HP, roll a d4. On a result of 3 of 4, halve the damage dealt."
            },
            {
                name: "Weak Armor (Hidden)",
                description: "When an attack hits this Pokémon, its speed increases by 5 feet, but its AC is temporarily reduced by 1 until the end of battle (for a maximum reduction of -5)."
            }
        ],
        skillProficiencies: ['athletics'],
        saveProficiencies: ['constitution', 'strength']
    },
    // 96
    'Drowzee': { 
        hp: 17, ac: 14, str: 13, dex: 10, con: 12, int: 6, wis: 14, cha: 8,
        speed: 25, type1: 'psychic', type2: '', size: 'Medium', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/drowzee.png',
        learnset: [
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Pound' },
            { level: 2, move: 'Disable' },
            { level: 2, move: 'Confusion' },
            { level: 6, move: 'Headbutt' },
            { level: 6, move: 'Poison Gas' }
        ],
        features: [
            {
                name: "Insomnia",
                description: "This Pokémon is immune to sleep."
            },
            {
                name: "Forewarn",
                description: "When this Pokémon enters battle, it selects a target to reveal the move it knows with the most damage output. In the case of a tie, the target can choose which move it reveals."
            },
            {
                name: "Inner Focus (Hidden)",
                description: "This Pokémon is immune to flinching."
            }
        ],
        skillProficiencies: ['insight, persuasion'],
        saveProficiencies: ['wisdom']
    },
    // 97
    'Hypno': { 
        hp: 17, ac: 14, str: 15, dex: 13, con: 14, int: 15, wis: 22, cha: 15,
        speed: 30, type1: 'psychic', type2: '', size: 'Large', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/hypno.png',
        learnset: [
            { level: 1, move: 'Pound' },
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Disable' },
            { level: 1, move: 'Confusion' },
            { level: 7, move: 'Disable' },
            { level: 11, move: 'Confusion' },
            { level: 17, move: 'Headbutt' },
            { level: 21, move: 'Poison Gas' },
            { level: 29, move: 'Psychic' }
        ]
    },
    // 98
    'Krabby': { 
        hp: 17, ac: 13, str: 14, dex: 12, con: 12, int: 6, wis: 10, cha: 8,
        speed: 30, type1: 'water', type2: '', size: 'Small', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/krabby.png',
        learnset: [
            { level: 1, move: 'Bubble' },
            { level: 1, move: 'Mud Sport' },
            { level: 2, move: 'Leer' },
            { level: 2, move: 'Vice Grip' },
            { level: 2, move: 'Harden' }
        ],
        features: [
            {
                name: "Hyper Cutter",
                description: "This Pokémon’s attack or damage bonuses cannot be decreased by an opponent’s moves."
            },
            {
                name: "Shell Armor",
                description: "This Pokémon is immune to extra damage dealt by a Critical Hit."
            },
            {
                name: "Sheer Force (Hidden)",
                description: "This Pokémon cannot cause additional effects from damaging moves. Instead, on any such move, double the move modifier when calculating damage."
            }
        ],
        skillProficiencies: ['survival', 'sleight_of_hand'],
        saveProficiencies: ['constitution']
    },
    // 99
    'Kingler': { 
        hp: 50, ac: 16, str: 17, dex: 15, con: 15, int: 6, wis: 12, cha: 8,
        speed: 30, type1: 'water', type2: '', size: 'Large', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/kingler.png',
        learnset: [
            { level: 1, move: 'Bubble' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Vice Grip' },
            { level: 1, move: 'Mud Sport' },
            { level: 1, move: 'Harden' },
            { level: 1, move: 'Wise Guard' },
            { level: 6, move: 'Bubble Beam' },
            { level: 6, move: 'Mud Shot' }
        ],
        features: [
            {
                name: "Hyper Cutter",
                description: "This Pokémon’s attack or damage bonuses cannot be decreased by an opponent’s moves."
            },
            {
                name: "Shell Armor",
                description: "This Pokémon is immune to extra damage dealt by a Critical Hit."
            },
            {
                name: "Sheer Force (Hidden)",
                description: "This Pokémon cannot cause additional effects from damaging moves. Instead, on any such move, double the move modifier when calculating damage."
            }
        ],
        skillProficiencies: ['survival', 'sleight_of_hand'],
        saveProficiencies: ['constitution']
    },
    // 100
    'Voltorb': { 
        hp: 17, ac: 14, str: 12, dex: 14, con: 12, int: 6, wis: 10, cha: 8,
        speed: 25, type1: 'electric', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/voltorb.png',
        learnset: [
            { level: 1, move: 'Charge' },
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Sonic Boom' },
            { level: 2, move: 'Spark' },
            { level: 2, move: 'Eerie Impulse' },
            { level: 6, move: 'Rollout' },
            { level: 6, move: 'Screech' },
            { level: 6, move: 'Charge Beam' }
        ],
        features: [
            {
                name: "Soundproof",
                description: "This Pokémon is immune to sound-based moves."
            },
            {
                name: "Static",
                description: "When this Pokémon is hit by a melee attack, roll a d4. On a result of 4, the attacker takes an amount of electric damage equal to this Pokemon's proficiency bonus."
            },
            {
                name: "Aftermath (Hidden)",
                description: "This Pokémon deals damage to an attacker equal to half of the damage received when knocked out by a melee move."
            }
        ],
        skillProficiencies: ['stealth'],
        saveProficiencies: ['constitution']
    },
    // 101
    'Electrode': { 
        hp: 13, ac: 14, str: 10, dex: 28, con: 16, int: 16, wis: 16, cha: 16,
        speed: 70, type1: 'electric', type2: '', size: 'Medium', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/electrode.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Screech' },
            { level: 1, move: 'Sonic Boom' },
            { level: 8, move: 'Screech' },
            { level: 15, move: 'Sonic Boom' },
            { level: 21, move: 'Self-Destruct' },
            { level: 27, move: 'Light Screen' },
            { level: 34, move: 'Swift' }
        ]
    },
    // 102
    'Exeggcute': { 
        hp: 13, ac: 16, str: 8, dex: 8, con: 16, int: 12, wis: 9, cha: 9,
        speed: 20, type1: 'grass', type2: 'psychic', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/exeggcute.png',
        learnset: [
            { level: 1, move: 'Barrage' },
            { level: 1, move: 'Hypnosis' },
            { level: 7, move: 'Reflect' },
            { level: 13, move: 'Leech Seed' },
            { level: 19, move: 'Confusion' },
            { level: 25, move: 'Stun Spore' }
        ]
    },
    // 103
    'Exeggutor': { 
        hp: 19, ac: 16, str: 19, dex: 11, con: 16, int: 22, wis: 13, cha: 13,
        speed: 25, type1: 'grass', type2: 'psychic', size: 'Large', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/exeggutor.png',
        learnset: [
            { level: 1, move: 'Barrage' },
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Confusion' },
            { level: 1, move: 'Stomp' }
        ]
    },
    // 104
    'Cubone': { 
        hp: 17, ac: 14, str: 12, dex: 11, con: 12, int: 6, wis: 10, cha: 12,
        speed: 30, type1: 'ground', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/cubone.png',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Tail Whip' },
            { level: 2, move: 'Bone Club' },
            { level: 2, move: 'Headbutt' }
        ],
        features: [
            {
                name: "Rock Head",
                description: "This Pokémon takes no recoil damage."
            },
            {
                name: "Lightning Rod",
                description: "If this Pokemon or an ally within 30 feet is targeted with a direct electric-type, damage-dealing move, the Pokemon may use a reaction to redirect the target to itself and take half damage from it if it hits."
            },
            {
                name: "Battle Armor (Hidden)",
                description: "This Pokémon is immune to extra damage dealt by a Critical Hit."
            }
        ],
        skillProficiencies: ['survival'],
        saveProficiencies: ['constitution']
    },
    // 105
    'Marowak': { 
        hp: 13, ac: 22, str: 16, dex: 9, con: 16, int: 10, wis: 16, cha: 12,
        speed: 25, type1: 'ground', type2: '', size: 'Medium', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/marowak.png',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Bone Club' },
            { level: 1, move: 'Headbutt' },
            { level: 5, move: 'Tail Whip' },
            { level: 9, move: 'Bone Club' },
            { level: 13, move: 'Headbutt' },
            { level: 17, move: 'Leer' },
            { level: 21, move: 'Focus Energy' },
            { level: 28, move: 'Thrash' }
        ]
    },
    // 106
    'Hitmonlee': { 
        hp: 11, ac: 11, str: 22, dex: 16, con: 11, int: 7, wis: 22, cha: 7,
        speed: 40, type1: 'fighting', type2: '', size: 'Large', sr: 6,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/hitmonlee.png',
        learnset: [
            { level: 1, move: 'Double Kick' },
            { level: 1, move: 'Meditate' },
            { level: 6, move: 'Rolling Kick' },
            { level: 11, move: 'Jump Kick' },
            { level: 16, move: 'Focus Energy' },
            { level: 21, move: 'Hi Jump Kick' }
        ]
    },
    // 107
    'Hitmonchan': { 
        hp: 11, ac: 15, str: 20, dex: 15, con: 15, int: 7, wis: 22, cha: 7,
        speed: 35, type1: 'fighting', type2: '', size: 'Large', sr: 6,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/hitmonchan.png',
        learnset: [
            { level: 1, move: 'Comet Punch' },
            { level: 1, move: 'Agility' },
            { level: 7, move: 'Fire Punch' },
            { level: 13, move: 'Ice Punch' },
            { level: 19, move: 'Thunder Punch' },
            { level: 25, move: 'Mega Punch' }
        ]
    },
    // 108
    'Lickitung': { 
        hp: 18, ac: 15, str: 11, dex: 6, con: 15, int: 12, wis: 15, cha: 12,
        speed: 15, type1: 'normal', type2: '', size: 'Large', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/lickitung.png',
        learnset: [
            { level: 1, move: 'Lick' },
            { level: 7, move: 'Supersonic' },
            { level: 13, move: 'Defense Curl' },
            { level: 19, move: 'Stomp' },
            { level: 25, move: 'Wrap' },
            { level: 31, move: 'Disable' }
        ]
    },
    // 109
    'Koffing': { 
        hp: 18, ac: 14, str: 15, dex: 10, con: 14, int: 6, wis: 10, cha: 8,
        speed: 20, type1: 'poison', type2: '', size: 'Medium', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/koffing.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Poison Gas' },
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Smog' },
            { level: 2, move: 'Smokescreen' },
        ],
        features: [
            {
                name: "Levitate",
                description: "This Pokémon is immune to ground moves."
            }
        ],
        skillProficiencies: ['deception'],
        saveProficiencies: ['constitution']
    },
    // 110
    'Weezing': { 
        hp: 13, ac: 22, str: 18, dex: 12, con: 22, int: 16, wis: 14, cha: 16,
        speed: 30, type1: 'poison', type2: '', size: 'Large', sr: 10,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/weezing.png',
        learnset: [
            { level: 1, move: 'Poison Gas' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Smog' },
            { level: 9, move: 'Smog' },
            { level: 17, move: 'Self-Destruct' },
            { level: 25, move: 'Haze' },
            { level: 35, move: 'Explosion' }
        ]
    },
    // 111
    'Rhyhorn': { 
        hp: 16, ac: 19, str: 16, dex: 6, con: 6, int: 6, wis: 6, cha: 6,
        speed: 15, type1: 'ground', type2: 'rock', size: 'Large', sr: 3,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/rhyhorn.png',
        learnset: [
            { level: 1, move: 'Horn Attack' },
            { level: 1, move: 'Tail Whip' },
            { level: 13, move: 'Stomp' },
            { level: 19, move: 'Fury Attack' },
            { level: 31, move: 'Scary Face' },
            { level: 37, move: 'Horn Drill' }
        ]
    },
    // 112
    'Rhydon': { 
        hp: 20, ac: 22, str: 26, dex: 8, con: 9, int: 8, wis: 9, cha: 8,
        speed: 20, type1: 'ground', type2: 'rock', size: 'Huge', sr: 11,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/rhydon.png',
        learnset: [
            { level: 1, move: 'Horn Attack' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Stomp' },
            { level: 13, move: 'Stomp' },
            { level: 19, move: 'Fury Attack' },
            { level: 31, move: 'Scary Face' },
            { level: 42, move: 'Horn Drill' },
            { level: 58, move: 'Take Down' }
        ]
    },
    // 113
    'Chansey': { 
        hp: 50, ac: 11, str: 1, dex: 10, con: 1, int: 7, wis: 22, cha: 22,
        speed: 25, type1: 'normal', type2: '', size: 'Medium', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/chansey.png',
        learnset: [
            { level: 1, move: 'Pound' },
            { level: 1, move: 'Growl' },
            { level: 5, move: 'Tail Whip' },
            { level: 9, move: 'Refresh' },
            { level: 13, move: 'Soft-Boiled' },
            { level: 17, move: 'Double Slap' }
        ]
    },
    // 114
    'Tangela': { 
        hp: 13, ac: 22, str: 11, dex: 12, con: 22, int: 18, wis: 8, cha: 8,
        speed: 30, type1: 'grass', type2: '', size: 'Medium', sr: 5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/tangela.png',
        learnset: [
            { level: 1, move: 'Ingrain' },
            { level: 1, move: 'Constrict' },
            { level: 4, move: 'Sleep Powder' },
            { level: 10, move: 'Absorb' },
            { level: 13, move: 'Growth' },
            { level: 19, move: 'Poison Powder' }
        ]
    },
    // 115
    'Kangaskhan': { 
        hp: 20, ac: 16, str: 19, dex: 18, con: 16, int: 8, wis: 15, cha: 15,
        speed: 35, type1: 'normal', type2: '', size: 'Large', sr: 10,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/kangaskhan.png',
        learnset: [
            { level: 1, move: 'Comet Punch' },
            { level: 1, move: 'Rage' },
            { level: 7, move: 'Bite' },
            { level: 13, move: 'Tail Whip' },
            { level: 19, move: 'Mega Punch' },
            { level: 25, move: 'Leer' }
        ]
    },
    // 116
    'Horsea': { 
        hp: 16, ac: 13, str: 11, dex: 14, con: 10, int: 6, wis: 10, cha: 12,
        speed: 5, type1: 'water', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/horsea.png',
        learnset: [
            { level: 1, move: 'Bubble' },
            { level: 2, move: 'Smokescreen' },
            { level: 2, move: 'Leer' }
        ],
        features: [
            {
                name: "Swift Swim",
                description: "This Pokémon's speed is doubled in rainy conditions."
            },
            {
                name: "Sniper",
                description: "On a critical hit made by this Pokémon, triple the dice roll instead of doubling it."
            },
            {
                name: "Damp (Hidden)",
                description: "This Pokémon is unaffected by Self Destruct and Explosion moves."
            }
        ],
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity']
    },
    // 117
    'Seadra': { 
        hp: 12, ac: 19, str: 13, dex: 16, con: 19, int: 19, wis: 9, cha: 9,
        speed: 35, type1: 'water', type2: '', size: 'Medium', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/seadra.png',
        learnset: [
            { level: 1, move: 'Bubble' },
            { level: 1, move: 'Smokescreen' },
            { level: 1, move: 'Leer' },
            { level: 8, move: 'Smokescreen' },
            { level: 15, move: 'Leer' },
            { level: 22, move: 'Water Gun' },
            { level: 29, move: 'Agility' },
            { level: 40, move: 'Twister' }
        ]
    },
    // 118
    'Goldeen': { 
        hp: 9, ac: 12, str: 13, dex: 13, con: 10, int: 7, wis: 10, cha: 7,
        speed: 30, type1: 'water', type2: '', size: 'Medium', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/goldeen.png',
        learnset: [
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Tail Whip' },
            { level: 10, move: 'Supersonic' },
            { level: 15, move: 'Horn Attack' },
            { level: 24, move: 'Flail' },
            { level: 29, move: 'Fury Attack' }
        ]
    },
    // 119
    'Seaking': { 
        hp: 16, ac: 13, str: 18, dex: 13, con: 13, int: 13, wis: 16, cha: 13,
        speed: 35, type1: 'water', type2: '', size: 'Large', sr: 9,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/seaking.png',
        learnset: [
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Supersonic' },
            { level: 10, move: 'Supersonic' },
            { level: 15, move: 'Horn Attack' },
            { level: 24, move: 'Flail' },
            { level: 37, move: 'Fury Attack' },
            { level: 45, move: 'Waterfall' }
        ]
    },
    // 120
    'Staryu': { 
        hp: 16, ac: 14, str: 10, dex: 14, con: 11, int: 6, wis: 12, cha: 10,
        speed: 20, type1: 'water', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/staryu.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Harden' },
            { level: 2, move: 'Water Gun' },
            { level: 2, move: 'Rapid Spin' },
            { level: 2, move: 'Recover' }
        ],
        features: [
            {
                name: "Illuminate",
                description: "This Pokémon knows the Light cantrip and can cast it at will."
            },
            {
                name: "Natural Cure",
                description: "This Pokémon is cured of negative status ailments upon returning to its Pokeball."
            },
            {
                name: "Analytic (Hidden)",
                description: "After this Pokémon misses an attack, its next attack is done at advantage."
            }
        ],
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity']
    },
    // 121
    'Starmie': { 
        hp: 13, ac: 16, str: 15, dex: 22, con: 16, int: 18, wis: 16, cha: 16,
        speed: 50, type1: 'water', type2: 'psychic', size: 'Medium', sr: 9,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/starmie.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Rapid Spin' },
            { level: 1, move: 'Recover' },
            { level: 1, move: 'Swift' }
        ]
    },
    // 122
    'Mr. Mime': { 
        hp: 8, ac: 13, str: 9, dex: 18, con: 13, int: 18, wis: 22, cha: 18,
        speed: 35, type1: 'psychic', type2: 'fairy', size: 'Medium', sr: 9,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/mr-mime.png',
        learnset: [
            { level: 1, move: 'Barrier' },
            { level: 1, move: 'Confusion' },
            { level: 6, move: 'Confusion' },
            { level: 11, move: 'Light Screen' },
            { level: 16, move: 'Reflect' },
            { level: 21, move: 'Psybeam' }
        ]
    },
    // 123
    'Scyther': { 
        hp: 14, ac: 16, str: 20, dex: 20, con: 16, int: 11, wis: 16, cha: 11,
        speed: 45, type1: 'bug', type2: 'flying', size: 'Large', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/scyther.png',
        learnset: [
            { level: 1, move: 'Quick Attack' },
            { level: 1, move: 'Leer' },
            { level: 6, move: 'Focus Energy' },
            { level: 11, move: 'Double Team' },
            { level: 16, move: 'Slash' },
            { level: 21, move: 'Swords Dance' }
        ]
    },
    // 124
    'Jynx': { 
        hp: 13, ac: 7, str: 10, dex: 19, con: 7, int: 22, wis: 19, cha: 19,
        speed: 35, type1: 'ice', type2: 'psychic', size: 'Large', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/jynx.png',
        learnset: [
            { level: 1, move: 'Pound' },
            { level: 1, move: 'Lick' },
            { level: 1, move: 'Lovely Kiss' },
            { level: 1, move: 'Powder Snow' },
            { level: 9, move: 'Lovely Kiss' },
            { level: 13, move: 'Powder Snow' }
        ]
    },
    // 125
    'Electabuzz': { 
        hp: 13, ac: 13, str: 16, dex: 20, con: 13, int: 19, wis: 16, cha: 16,
        speed: 45, type1: 'electric', type2: '', size: 'Large', sr: 9,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/electabuzz.png',
        learnset: [
            { level: 1, move: 'Quick Attack' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Thunder Shock' },
            { level: 7, move: 'Thunder Shock' },
            { level: 13, move: 'Light Screen' },
            { level: 19, move: 'Swift' }
        ]
    },
    // 126
    'Magmar': { 
        hp: 13, ac: 13, str: 19, dex: 18, con: 13, int: 18, wis: 16, cha: 16,
        speed: 40, type1: 'fire', type2: '', size: 'Large', sr: 9,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/magmar.png',
        learnset: [
            { level: 1, move: 'Ember' },
            { level: 1, move: 'Leer' },
            { level: 7, move: 'Ember' },
            { level: 13, move: 'Smokescreen' },
            { level: 19, move: 'Smog' },
            { level: 25, move: 'Fire Punch' }
        ]
    },
    // 127
    'Pinsir': { 
        hp: 13, ac: 18, str: 23, dex: 16, con: 10, int: 11, wis: 14, cha: 11,
        speed: 35, type1: 'bug', type2: '', size: 'Large', sr: 9,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/pinsir.png',
        learnset: [
            { level: 1, move: 'Vice Grip' },
            { level: 1, move: 'Focus Energy' },
            { level: 7, move: 'Bind' },
            { level: 13, move: 'Seismic Toss' },
            { level: 19, move: 'Harden' },
            { level: 25, move: 'Slash' }
        ]
    },
    // 128
    'Tauros': { 
        hp: 15, ac: 19, str: 18, dex: 22, con: 19, int: 8, wis: 14, cha: 14,
        speed: 50, type1: 'normal', type2: '', size: 'Large', sr: 10,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/tauros.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 4, move: 'Tail Whip' },
            { level: 8, move: 'Rage' },
            { level: 13, move: 'Horn Attack' },
            { level: 19, move: 'Scary Face' },
            { level: 26, move: 'Pursuit' }
        ]
    },
    // 129
    'Magikarp': { 
        hp: 4, ac: 12, str: 2, dex: 16, con: 10, int: 4, wis: 4, cha: 4,
        speed: 35, type1: 'water', type2: '', size: 'Medium', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/magikarp.png',
        learnset: [
            { level: 1, move: 'Splash' },
            { level: 15, move: 'Tackle' }
        ]
    },
    // 130
    'Gyarados': { 
        hp: 19, ac: 15, str: 23, dex: 16, con: 15, int: 12, wis: 18, cha: 15,
        speed: 40, type1: 'water', type2: 'flying', size: 'Huge', sr: 10,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/gyarados.png',
        learnset: [
            { level: 1, move: 'Thrash' },
            { level: 20, move: 'Bite' },
            { level: 25, move: 'Dragon Rage' },
            { level: 30, move: 'Leer' },
            { level: 35, move: 'Twister' },
            { level: 40, move: 'Hydro Pump' }
        ]
    },
    // 131
    'Lapras': { 
        hp: 26, ac: 16, str: 16, dex: 12, con: 16, int: 16, wis: 19, cha: 16,
        speed: 30, type1: 'water', type2: 'ice', size: 'Huge', sr: 10,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/lapras.png',
        learnset: [
            { level: 1, move: 'Water Gun' },
            { level: 1, move: 'Growl' },
            { level: 8, move: 'Sing' },
            { level: 15, move: 'Mist' },
            { level: 22, move: 'Body Slam' },
            { level: 29, move: 'Confuse Ray' }
        ]
    },
    // 132
    'Ditto': { 
        hp: 10, ac: 12, str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
        speed: 25, type1: 'normal', type2: '', size: 'Small', sr: 3,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/ditto.png',
        learnset: [
            { level: 1, move: 'Transform' }
        ]
    },
    // 133
    'Eevee': { 
        hp: 16, ac: 13, str: 13, dex: 13, con: 10, int: 6, wis: 10, cha: 12,
        speed: 30, type1: 'normal', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/eevee.png',
        learnset: [
            { level: 1, move: 'Covet' },
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Growl' },
            { level: 2, move: 'Tail Whip' },
            { level: 1, move: 'Helping Hand' },
            { level: 1, move: 'Sand Attack' },
            { level: 2, move: 'Baby-Doll Eyes' },
            { level: 2, move: 'Quick Attack' }
        ],
        features: [
            {
                name: "Run Away",
                description: "This Pokémon cannot be the target of an attack of opportunity."
            },
            {
                name: "Adaptability",
                description: "When this Pokémon uses a move of its own type, it may roll the damage twice and choose either total."
            },
            {
                name: "Anticipation (Hidden)",
                description: "When this Pokémon enters the battle, an opponent must reveal if it has a move that the Pokémon is vulnerable to. The move does not have to be revealed - only that there is such a move."
            },
        ],
        skillProficiencies: ['perception', 'investigation'],
        saveProficiencies: ['dexterity', 'charisma']
    },
    // 134
    'Vaporeon': { 
        hp: 26, ac: 13, str: 13, dex: 13, con: 12, int: 22, wis: 19, cha: 19,
        speed: 30, type1: 'water', type2: '', size: 'Medium', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/vaporeon.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Sand Attack' },
            { level: 1, move: 'Water Gun' },
            { level: 16, move: 'Water Gun' },
            { level: 31, move: 'Aurora Beam' },
            { level: 42, move: 'Haze' }
        ]
    },
    // 135
    'Jolteon': { 
        hp: 13, ac: 13, str: 13, dex: 26, con: 12, int: 22, wis: 19, cha: 19,
        speed: 65, type1: 'electric', type2: '', size: 'Medium', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/jolteon.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Sand Attack' },
            { level: 1, move: 'Thunder Shock' },
            { level: 16, move: 'Thunder Shock' },
            { level: 31, move: 'Pin Missile' },
            { level: 42, move: 'Thunder' }
        ]
    },
    // 136
    'Flareon': { 
        hp: 13, ac: 13, str: 26, dex: 13, con: 12, int: 22, wis: 19, cha: 19,
        speed: 30, type1: 'fire', type2: '', size: 'Medium', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/flareon.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Sand Attack' },
            { level: 1, move: 'Ember' },
            { level: 16, move: 'Ember' },
            { level: 31, move: 'Smog' },
            { level: 42, move: 'Flamethrower' }
        ]
    },
    // 137
    'Porygon': { 
        hp: 13, ac: 14, str: 12, dex: 8, con: 14, int: 16, wis: 15, cha: 15,
        speed: 20, type1: 'normal', type2: '', size: 'Medium', sr: 6,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/porygon.png',
        learnset: [
            { level: 1, move: 'Conversion' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Sharpen' },
            { level: 9, move: 'Psybeam' },
            { level: 12, move: 'Agility' },
            { level: 20, move: 'Recover' }
        ]
    },
    // 138
    'Omanyte': { 
        hp: 9, ac: 18, str: 8, dex: 7, con: 18, int: 18, wis: 11, cha: 11,
        speed: 15, type1: 'rock', type2: 'water', size: 'Small', sr: 2,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/omanyte.png',
        learnset: [
            { level: 1, move: 'Constrict' },
            { level: 1, move: 'Withdraw' },
            { level: 13, move: 'Bite' },
            { level: 19, move: 'Water Gun' },
            { level: 31, move: 'Leer' },
            { level: 37, move: 'Protect' }
        ]
    },
    // 139
    'Omastar': { 
        hp: 14, ac: 23, str: 12, dex: 11, con: 23, int: 22, wis: 14, cha: 14,
        speed: 25, type1: 'rock', type2: 'water', size: 'Medium', sr: 11,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/omastar.png',
        learnset: [
            { level: 1, move: 'Constrict' },
            { level: 1, move: 'Withdraw' },
            { level: 1, move: 'Bite' },
            { level: 13, move: 'Bite' },
            { level: 19, move: 'Water Gun' },
            { level: 31, move: 'Leer' },
            { level: 40, move: 'Protect' },
            { level: 49, move: 'Spike Cannon' }
        ]
    },
    // 140
    'Kabuto': { 
        hp: 6, ac: 18, str: 16, dex: 11, con: 18, int: 11, wis: 9, cha: 9,
        speed: 25, type1: 'rock', type2: 'water', size: 'Small', sr: 2,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/kabuto.png',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Harden' },
            { level: 10, move: 'Absorb' },
            { level: 19, move: 'Slash' },
            { level: 28, move: 'Leer' },
            { level: 37, move: 'Mega Drain' }
        ]
    },
    // 141
    'Kabutops': { 
        hp: 13, ac: 20, str: 22, dex: 16, con: 13, int: 13, wis: 14, cha: 14,
        speed: 40, type1: 'rock', type2: 'water', size: 'Large', sr: 11,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/kabutops.png',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Harden' },
            { level: 1, move: 'Absorb' },
            { level: 10, move: 'Absorb' },
            { level: 19, move: 'Slash' },
            { level: 28, move: 'Leer' },
            { level: 40, move: 'Mega Drain' },
            { level: 46, move: 'Fury Cutter' }
        ]
    },
    // 142
    'Aerodactyl': { 
        hp: 16, ac: 13, str: 20, dex: 26, con: 13, int: 12, wis: 15, cha: 12,
        speed: 65, type1: 'rock', type2: 'flying', size: 'Large', sr: 13,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/aerodactyl.png',
        learnset: [
            { level: 1, move: 'Wing Attack' },
            { level: 8, move: 'Agility' },
            { level: 15, move: 'Bite' },
            { level: 22, move: 'Supersonic' },
            { level: 29, move: 'Take Down' },
            { level: 36, move: 'Hyper Beam' }
        ]
    },
    // 143
    'Snorlax': { 
        hp: 32, ac: 13, str: 22, dex: 6, con: 13, int: 13, wis: 22, cha: 22,
        speed: 15, type1: 'normal', type2: '', size: 'Huge', sr: 14,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/snorlax.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 8, move: 'Amnesia' },
            { level: 15, move: 'Defense Curl' },
            { level: 22, move: 'Belly Drum' },
            { level: 29, move: 'Headbutt' },
            { level: 36, move: 'Snore' }
        ]
    },
    // 144
    'Articuno': { 
        hp: 18, ac: 18, str: 16, dex: 16, con: 18, int: 19, wis: 22, cha: 22,
        speed: 40, type1: 'ice', type2: 'flying', size: 'Large', sr: 15,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/articuno.png',
        learnset: [
            { level: 1, move: 'Gust' },
            { level: 1, move: 'Powder Snow' },
            { level: 13, move: 'Mist' },
            { level: 25, move: 'Agility' },
            { level: 37, move: 'Mind Reader' },
            { level: 49, move: 'Ice Beam' }
        ]
    },
    // 145
    'Zapdos': { 
        hp: 18, ac: 16, str: 18, dex: 18, con: 16, int: 22, wis: 18, cha: 18,
        speed: 50, type1: 'electric', type2: 'flying', size: 'Large', sr: 15,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/zapdos.png',
        learnset: [
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Thunder Shock' },
            { level: 13, move: 'Thunder Wave' },
            { level: 25, move: 'Agility' },
            { level: 37, move: 'Detect' },
            { level: 49, move: 'Drill Peck' }
        ]
    },
    // 146
    'Moltres': { 
        hp: 18, ac: 18, str: 18, dex: 18, con: 16, int: 22, wis: 16, cha: 22,
        speed: 40, type1: 'fire', type2: 'flying', size: 'Large', sr: 15,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/moltres.png',
        learnset: [
            { level: 1, move: 'Wing Attack' },
            { level: 1, move: 'Ember' },
            { level: 13, move: 'Fire Spin' },
            { level: 25, move: 'Agility' },
            { level: 37, move: 'Endure' },
            { level: 49, move: 'Flamethrower' }
        ]
    },
    // 147
    'Dratini': { 
        hp: 20, ac: 13, str: 12, dex: 12, con: 10, int: 6, wis: 10, cha: 12,
        speed: 30, type1: 'dragon', type2: '', size: 'Large', sr: 1,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/dratini.png',
        learnset: [
            { level: 1, move: 'Wrap' },
            { level: 1, move: 'Leer' },
            { level: 2, move: 'Thunder Wave' },
            { level: 2, move: 'Twister' }
        ],
        features: [
            {
                name: "Shed Skin",
                description: "If this Pokémon is affected by a negative status ailment, they can roll a d4 at the end of each of their turns. On a result of 4, they are cured."
            },
            {
                name: "Marvel Scale (Hidden)",
                description: "This Pokémon's AC increase by 2 when suffering from a negative status condition."
            }
        ],
        skillProficiencies: ['arcana'],
        saveProficiencies: ['wisdom']
    },
    // 148
    'Dragonair': { 
        hp: 53, ac: 14, str: 15, dex: 15, con: 12, int: 6, wis: 12, cha: 12,
        speed: 30, type1: 'dragon', type2: '', size: 'Medium', sr: 6,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/dragonair.png',
        learnset: [
            { level: 1, move: 'Wrap' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Thunder Wave' },
            { level: 1, move: 'Twister' },
            { level: 2, move: 'Dragon Rage' },
            { level: 2, move: 'Slam' }
        ],
        features: [
            {
                name: "Shed Skin",
                description: "If this Pokémon is affected by a negative status ailment, they can roll a d4 at the end of each of their turns. On a result of 4, they are cured."
            },
            {
                name: "Marvel Scale (Hidden)",
                description: "This Pokémon's AC increase by 2 when suffering from a negative status condition."
            }
        ],
        skillProficiencies: ['arcana'],
        saveProficiencies: ['wisdom']
    },
    // 149
    'Dragonite': { 
        hp: 18, ac: 19, str: 26, dex: 16, con: 18, int: 18, wis: 18, cha: 18,
        speed: 35, type1: 'dragon', type2: 'flying', size: 'Huge', sr: 14,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/dragonite.png',
        learnset: [
            { level: 1, move: 'Wrap' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Thunder Wave' },
            { level: 1, move: 'Twister' },
            { level: 8, move: 'Thunder Wave' },
            { level: 15, move: 'Twister' },
            { level: 22, move: 'Dragon Rage' },
            { level: 29, move: 'Slam' },
            { level: 38, move: 'Agility' },
            { level: 55, move: 'Wing Attack' }
        ]
    },
    // 150
    'Mewtwo': { 
        hp: 20, ac: 18, str: 22, dex: 26, con: 18, int: 31, wis: 18, cha: 18,
        speed: 65, type1: 'psychic', type2: '', size: 'Large', sr: 15,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/mewtwo.png',
        learnset: [
            { level: 1, move: 'Confusion' },
            { level: 1, move: 'Disable' },
            { level: 11, move: 'Barrier' },
            { level: 22, move: 'Mist' },
            { level: 33, move: 'Psychic' },
            { level: 44, move: 'Recover' }
        ]
    },
    // 151
    'Mew': { 
        hp: 20, ac: 18, str: 18, dex: 18, con: 18, int: 18, wis: 18, cha: 18,
        speed: 50, type1: 'psychic', type2: '', size: 'Small', sr: 15,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/mew.png',
        learnset: [
            { level: 1, move: 'Pound' },
            { level: 10, move: 'Transform' },
            { level: 20, move: 'Mega Punch' },
            { level: 30, move: 'Metronome' },
            { level: 40, move: 'Psychic' },
            { level: 50, move: 'Ancient Power' }
        ]
    }
};

const routeData = {
    'Route 1': {
        'Tall Grass': [
            { pokemon: 'Pidgey', rate: 55, levelRange: [1, 1] },
            { pokemon: 'Rattata', rate: 45, levelRange: [1, 1] }
        ]
    },
    'Route 2': {
        'Tall Grass': [
            { pokemon: 'Pidgey', rate: 35, levelRange: [3, 5] },
            { pokemon: 'Rattata', rate: 35, levelRange: [3, 5] },
            { pokemon: 'Caterpie', rate: 15, levelRange: [3, 5] },
            { pokemon: 'Weedle', rate: 15, levelRange: [3, 5] }
        ]
    },
    'Viridian Forest': {
        'Forest Floor': [
            { pokemon: 'Caterpie', rate: 40, levelRange: [3, 6] },
            { pokemon: 'Weedle', rate: 40, levelRange: [3, 6] },
            { pokemon: 'Pidgey', rate: 15, levelRange: [4, 6] },
            { pokemon: 'Pikachu', rate: 5, levelRange: [3, 5] }
        ]
    }
};

const loyaltyLevels = {
    'Hostile': -3,
    'Unfriendly': -2,
    'Wary': -1,
    'Neutral': 0,
    'Friendly': 1,
    'Loyal': 2,
    'Devoted': 3
};

function getMoveRange(moveName) {
    switch(moveName.toLowerCase()) {
        // Melee moves - 5 feet
        case 'tackle':
        case 'scratch':
        case 'bite':
        case 'slam':
        case 'pound':
        case 'karate chop':
        case 'low kick':
        case 'seismic toss':
        case 'fury swipes':
        case 'mega punch':
        case 'comet punch':
        case 'double kick':
        case 'vice grip':
        case 'constrict':
        case 'wrap':
        case 'bind':
        case 'horn attack':
        case 'peck':
        case 'fury attack':
        case 'double slap':
        case 'headbutt':
        case 'stomp':
        case 'take down':
        case 'body slam':
        case 'thrash':
        case 'slash':
        case 'razor leaf':
        case 'vine whip':
        case 'absorb':
        case 'mega drain':
        case 'leech life':
        case 'pin missile':
        case 'twineedle':
        case 'bone club':
        case 'lick':
        case 'rolling kick':
        case 'jump kick':
        case 'hi jump kick':
        case 'fire punch':
        case 'ice punch':
        case 'thunder punch':
        case 'guillotine':
        case 'horn drill':
        case 'super fang':
        case 'hyper fang':
        case 'crabhammer':
        case 'drill peck':
        case 'wing attack':
        case 'sky attack':
            return '5 feet';
        
        // Short range moves - 15 feet
        case 'string shot':
        case 'poison sting':
        case 'water gun':
        case 'bubble':
        case 'ember':
        case 'rock throw':
        case 'mud slap':
        case 'sludge':
        case 'acid':
        case 'spike cannon':
        case 'barrage':
        case 'egg bomb':
        case 'bone club':
        case 'bonemerang':
            return '15 feet';
            
        case 'thunder shock':
            return '20 feet';
        
        // Medium range moves - 30 feet
        case 'gust':
        case 'quick attack':
        case 'thunderbolt':
        case 'thunder':
        case 'confusion':
        case 'psybeam':
        case 'psychic':
        case 'aurora beam':
        case 'bubble beam':
        case 'water pulse':
        case 'flamethrower':
        case 'fire blast':
        case 'ice beam':
        case 'blizzard':
        case 'solar beam':
        case 'petal dance':
        case 'sleep powder':
        case 'poison powder':
        case 'stun spore':
        case 'lovely kiss':
        case 'powder snow':
        case 'icy wind':
        case 'fury cutter':
        case 'twister':
        case 'dragon rage':
        case 'night shade':
        case 'shadow ball':
        case 'sludge bomb':
        case 'mud shot':
        case 'rock slide':
        case 'ancient power':
        case 'swift':
        case 'tri attack':
        case 'hyper beam':
        case 'zap cannon':
        case 'signal beam':
        case 'air slash':
        case 'energy ball':
        case 'focus blast':
        case 'aura sphere':
        case 'dark pulse':
        case 'dragon pulse':
        case 'vacuum wave':
        case 'water shuriken':
        case 'flame wheel':
        case 'rollout':
        case 'spark':
        case 'flame charge':
        case 'aqua jet':
        case 'bullet punch':
        case 'mach punch':
        case 'shadow sneak':
        case 'sucker punch':
        case 'ice shard':
        case 'quick guard':
        case 'feint attack':
        case 'pursuit':
        case 'bite':
        case 'crunch':
        case 'thunder fang':
        case 'ice fang':
        case 'fire fang':
        case 'poison fang':
            return '30 feet';
        
        // Long range moves - 60 feet
        case 'ember':
        case 'surf':
        case 'hydro pump':
        case 'earthquake':
        case 'magnitude':
        case 'fissure':
        case 'hurricane':
        case 'thunder wave':
        case 'toxic':
        case 'will-o-wisp':
        case 'confuse ray':
        case 'supersonic':
        case 'screech':
        case 'metal sound':
        case 'sing':
        case 'hypnosis':
        case 'lovely kiss':
        case 'sleep powder':
        case 'poison powder':
        case 'stun spore':
        case 'cotton spore':
        case 'flash':
        case 'sand attack':
        case 'smokescreen':
        case 'haze':
        case 'mist':
        case 'spore':
        case 'paralysis':
        case 'burn':
        case 'freeze':
        case 'charm':
        case 'attract':
        case 'captivate':
        case 'sweet kiss':
        case 'lovely kiss':
        case 'grass whistle':
        case 'sing':
        case 'perish song':
        case 'heal bell':
        case 'aromatherapy':
            return '60 feet';
        
        case 'growl':
            return '100 feet';
        
        // Area of effect moves - special ranges
        case 'roar':
        case 'scary face':
        case 'leer':
        case 'tail whip':
        case 'intimidate':
        case 'explosion':
        case 'self-destruct':
        case 'perish song':
        case 'heal bell':
        case 'aromatherapy':
            return '15 foot radius';
        
        // Self-targeting moves
        case 'harden':
        case 'defense curl':
        case 'withdraw':
        case 'focus energy':
        case 'meditate':
        case 'sharpen':
        case 'double team':
        case 'minimize':
        case 'agility':
        case 'recover':
        case 'rest':
        case 'sleep talk':
        case 'snore':
        case 'curse':
        case 'amnesia':
        case 'barrier':
        case 'light screen':
        case 'reflect':
        case 'safeguard':
        case 'mist':
        case 'transform':
        case 'substitute':
        case 'mimic':
        case 'metronome':
        case 'splash':
        case 'teleport':
        case 'bide':
        case 'rage':
        case 'conversion':
        case 'conversion 2':
        case 'pain split':
        case 'endure':
        case 'belly drum':
        case 'milk drink':
        case 'soft-boiled':
        case 'morning sun':
        case 'synthesis':
        case 'moonlight':
        case 'wish':
        case 'refresh':
        case 'heal order':
        case 'roost':
        case 'cosmic power':
        case 'calm mind':
        case 'bulk up':
        case 'dragon dance':
        case 'swords dance':
        case 'nasty plot':
        case 'quiver dance':
        case 'shell smash':
        case 'growth':
        case 'work up':
        case 'hone claws':
        case 'coil':
        case 'stockpile':
        case 'swallow':
        case 'spit up':
            return 'Self';
        
        // Special movement moves
        case 'whirlwind':
        case 'teleport':
        case 'baton pass':
        case 'u-turn':
        case 'volt switch':
        case 'flip turn':
        case 'parting shot':
            return 'Special';
        
        // Default to melee range for unlisted moves
        default:
            return '5 feet';
    }
}

const dualStatMoves = {
    'growl': {
        primary: 'pokemon_charisma_mod',
        secondary: 'pokemon_strength_mod',
        stats: 'CHA/STR'
    },
    'thunder shock': {
        primary: 'pokemon_strength_mod',
        secondary: 'pokemon_dexterity_mod',
        stats: 'STR/DEX'
    },
    'bite': {
        primary: 'pokemon_strength_mod',
        secondary: 'pokemon_dexterity_mod',
        stats: 'STR/DEX'
    },
    'ember': {
        primary: 'pokemon_strength_mod',
        secondary: 'pokemon_dexterity_mod',
        stats: 'STR/DEX'
    }
}

function getMoveAbility(moveName) {
    const lowerMoveName = moveName.toLowerCase();
    
    // Check if this move is in the dual-stat moves list
    if (dualStatMoves[lowerMoveName]) {
        return {
            primary: dualStatMoves[lowerMoveName].primary,
            secondary: dualStatMoves[lowerMoveName].secondary,
            stats: dualStatMoves[lowerMoveName].stats,
            isDual: true
        };
    }
    
    // Single stat moves - existing logic
    switch(lowerMoveName) {
        // Charisma-based moves
        case 'roar':
        case 'charm':
            return 'pokemon_charisma_mod';
        
        // Intelligence-based moves  
        case 'thunderbolt':
        case 'psychic':
        case 'psybeam':
        case 'teleport':
        case 'barrier':
        case 'light screen':
        case 'reflect':
            return 'pokemon_intelligence_mod';
        
        // Wisdom-based moves
        case 'foresight':
        case 'detect':
        case 'mind reader':
            return 'pokemon_wisdom_mod';
        
        // Dexterity-based moves
        case 'string shot':
        case 'quick attack':
        case 'agility':
        case 'double team':
            return 'pokemon_dexterity_mod';
        
        // Constitution-based moves
        case 'poison sting':
        case 'harden':
        case 'withdraw':
            return 'pokemon_constitution_mod';
        
        // Strength-based moves (default for physical attacks)
        case 'tackle':
        case 'scratch':
        case 'slam':
        case 'pound':
        case 'karate chop':
        case 'seismic toss':
        case 'body slam':
        case 'take down':
        case 'double kick':
        case 'mega punch':
        case 'comet punch':
        case 'vine whip':
        case 'razor leaf':
        case 'peck':
        case 'fury attack':
        case 'horn attack':
        case 'thrash':
        case 'slash':
        case 'fury swipes':
        default:
            return 'pokemon_strength_mod';
    }
}

function isSpecialAttack(moveName) {
    const specialMoves = ['gust', 'supersonic', 'thunder wave', 'string shot', 'poison sting', 'leech life', 'teleport', 'roar'];
    return specialMoves.includes(moveName.toLowerCase());
}

function getMoveActualDamage(moveName) {
    const statusMoves = ['sand attack', 'growl', 'tail whip', 'defense curl', 'focus energy', 'string shot', 'supersonic', 'thunder wave', 'teleport', 'whirlwind', 'double team', 'roar'];
    
    if (statusMoves.includes(moveName.toLowerCase())) {
        return '0';
    }
    
    switch(moveName.toLowerCase()) {
        case 'bite':
            return '1d10'
        case 'rock throw':
        case 'gust':
            return '1d8';
        case 'tackle':
        case 'scratch':
        case 'quick attack':
        case 'thunder shock':
        case 'hyper fang':
        case 'twister':
        case 'astonish':
        case 'ember':
            return '1d6';
        case 'poison sting':
        case 'leech life':
            return '1d4';
        case 'magnitude':
            return '1d8';
        default:
            return '1d4';
    }
}

function getMoveType(moveName) {
    switch(moveName.toLowerCase()) {
        case 'thunder shock':
        case 'thunder wave':
            return 'Electric';
        case 'gust':
        case 'whirlwind':
        case 'twister':
            return 'Flying';
        case 'poison sting':
            return 'Poison';
        case 'leech life':
        case 'string shot':
            return 'Bug';
        case 'rock throw':
            return 'Rock';
        case 'magnitude':
        case 'sand attack':
            return 'Ground';
        case 'teleport':
            return 'Psychic';
        default:
            return 'Normal';
    }
}

function getMoveSpecialEffect(moveName) {
    switch(moveName.toLowerCase()) {
        case 'thunder wave':
            return '{{Special=Target must make DC CON save or be paralyzed}}';
        case 'supersonic':
            return '{{Special=Target must make DC WIS save or be confused}}';
        case 'string shot':
            return '{{Special=Target must make DC DEX save or be restrained}}';
        case 'poison sting':
            return '{{Special=Target must make DC CON save or be poisoned}}';
        case 'growl':
        case 'tail whip':
            return '{{Special=Target gets -1 to attack damage rolls until end of next turn (max 5)}}';
        case 'sand attack':
            return '{{Special=Target gets -1 to attack rolls until end of next turn (max 5}}';
        case 'defense curl':
            return '{{Special=+2 AC until end of next turn}}';
        case 'focus energy':
            return '{{Special=Critical hits on 19-20 for next 3 turns}}';
        case 'teleport':
            return '{{Special=Escape from battle or move up to 120 feet}}';
        case 'whirlwind':
            return '{{Special=Force opponent to switch Pokemon}}';
        case 'double team':
            return '{{Special=+2 AC against next attack}}';
        case 'roar':
            return '{{Special=ALL creatures in 15 foot radius make a DC CHA save or disengage and move up to its speed in a straight line away from user}}'
        case 'ember':
            return '{{Special=If the natural attack roll is 19 or 20, the target is burnt.'
        default:
            return '';
    }
}

on('chat:message', function(msg) {
    if (msg.type === 'api' && msg.content.indexOf('!pokemon-encounter') === 0) {
        const args = msg.content.split(' ');
        args.shift();
        const routeName = args.join(' ').replace(/"/g, '');
        
        if (!routeName) {
            sendChat('Pokemon System', '/w GM Available routes: ' + Object.keys(routeData).join(', '));
            return;
        }
        
        if (!routeData[routeName]) {
            sendChat('Pokemon System', '/w GM Route "' + routeName + '" not found. Available routes: ' + Object.keys(routeData).join(', '));
            return;
        }
        
        generateEncounter(routeName, msg.playerid);
    }
    
    if (msg.type === 'api' && msg.content === '!pokemon-routes') {
        let routeList = 'Available Routes:\n';
        Object.keys(routeData).forEach(route => {
            routeList += `**${route}**: `;
            routeList += Object.keys(routeData[route]).join(', ') + '\n';
        });
        sendChat('Pokemon System', '/w GM ' + routeList);
    }
    
    if (msg.type === 'api' && msg.content === '!pokemon-reset-counter' && playerIsGM(msg.playerid)) {
        encounterCounter = 1;
        sendChat('Pokemon System', '/w GM Encounter counter reset to #1');
    }
    
    if (msg.type === 'api' && msg.content.indexOf('!set-loyalty') === 0) {
        if (!msg.selected || msg.selected.length === 0) {
            sendChat('Pokemon System', '/w GM Please select a Pokemon token first.');
            return;
        }
        
        const args = msg.content.split(' ');
        args.shift();
        const loyaltyName = args.join(' ');
        
        if (!loyaltyLevels.hasOwnProperty(loyaltyName)) {
            const availableLoyalties = Object.keys(loyaltyLevels).join(', ');
            sendChat('Pokemon System', '/w GM Invalid loyalty level. Available: ' + availableLoyalties);
            return;
        }
        
        const token = getObj('graphic', msg.selected[0]._id);
        if (!token) {
            sendChat('Pokemon System', '/w GM Selected object is not a token.');
            return;
        }
        
        const character = getObj('character', token.get('represents'));
        if (!character) {
            sendChat('Pokemon System', '/w GM Token does not represent a character.');
            return;
        }
        
        const loyaltyAttr = findObjs({
            _type: 'attribute',
            _characterid: character.id,
            name: 'pokemon_loyalty'
        })[0];
        
        const loyaltyValueAttr = findObjs({
            _type: 'attribute',
            _characterid: character.id,
            name: 'pokemon_loyalty_value'
        })[0];
        
        if (loyaltyAttr) {
            loyaltyAttr.set('current', loyaltyName);
        }
        
        if (loyaltyValueAttr) {
            loyaltyValueAttr.set('current', loyaltyLevels[loyaltyName]);
        }
        
        sendChat('Pokemon System', `/w GM ${character.get('name')} loyalty set to ${loyaltyName} (${loyaltyLevels[loyaltyName]})`);
    }
    
    if (msg.type === 'api' && msg.content === '!fix-token-bars') {
        if (!msg.selected || msg.selected.length === 0) {
            sendChat('Pokemon System', '/w GM Please select a token first.');
            return;
        }
        
        const token = getObj('graphic', msg.selected[0]._id);
        if (!token) {
            sendChat('Pokemon System', '/w GM Selected object is not a token.');
            return;
        }
        
        const character = getObj('character', token.get('represents'));
        if (!character) {
            sendChat('Pokemon System', '/w GM Token does not represent a character.');
            return;
        }
        
        const hpAttr = findObjs({
            _type: 'attribute',
            _characterid: character.id,
            name: 'pokemon_hp'
        })[0];
        
        const acAttr = findObjs({
            _type: 'attribute',
            _characterid: character.id,
            name: 'pokemon_ac'
        })[0];
        
        const levelAttr = findObjs({
            _type: 'attribute',
            _characterid: character.id,
            name: 'pokemon_level'
        })[0];
        
        if (hpAttr) {
            const currentHP = parseInt(hpAttr.get('current')) || 0;
            const maxHP = parseInt(hpAttr.get('max')) || currentHP;
            
            token.set({
                bar1_link: hpAttr.id,
                bar1_value: currentHP,
                bar1_max: maxHP
            });
            
            sendChat('Pokemon System', `/w GM Fixed Bar 1: Linked to pokemon_hp (${currentHP}/${maxHP})`);
        }
        
        if (acAttr) {
            const currentAC = parseInt(acAttr.get('current')) || 10;
            
            token.set({
                bar2_link: acAttr.id,
                bar2_value: currentAC
            });
            
            sendChat('Pokemon System', `/w GM Fixed Bar 2: Linked to pokemon_ac (${currentAC})`);
        }
        
        if (levelAttr) {
            const currentLevel = parseInt(levelAttr.get('current')) || 1;
            
            token.set({
                bar3_link: levelAttr.id,
                bar3_value: currentLevel
            });
            
            sendChat('Pokemon System', `/w GM Fixed Bar 3: Linked to pokemon_level (${currentLevel})`);
        }
        
        sendChat('Pokemon System', '/w GM Token bar linking fixed! Check the token settings.');
    }
    
    // Add command to recalculate modifiers for existing characters
    if (msg.type === 'api' && msg.content === '!fix-modifiers') {
        if (!msg.selected || msg.selected.length === 0) {
            sendChat('Pokemon System', '/w GM Please select a Pokemon token first.');
            return;
        }
        
        const token = getObj('graphic', msg.selected[0]._id);
        if (!token) {
            sendChat('Pokemon System', '/w GM Selected object is not a token.');
            return;
        }
        
        const character = getObj('character', token.get('represents'));
        if (!character) {
            sendChat('Pokemon System', '/w GM Token does not represent a character.');
            return;
        }
        
        const levelAttr = findObjs({
            _type: 'attribute',
            _characterid: character.id,
            name: 'pokemon_level'
        })[0];
        
        const level = levelAttr ? parseInt(levelAttr.get('current')) || 1 : 1;
        
        calculateAndSetModifiers(character.id, level);
        
        sendChat('Pokemon System', `/w GM Modifiers recalculated for ${character.get('name')}!`);
    }
    
    if (msg.type === 'api' && msg.content.indexOf('!pokemon-spawn') === 0) {
        const args = msg.content.split(' ').slice(1); // Fixed: using msg.content instead of message.content
        
        const pokemonName = args[0];
        const level = args[1] ? Math.max(1, Math.min(100, parseInt(args[1]))) : 1; // Clamp level between 1-100
        
        if (!pokemonName) {
            return sendChat('Pokemon System', '/w GM Please specify a Pokémon name! Usage: !pokemon-spawn <name> [level]');
        }
        
        // Handle case-insensitive name matching
        const foundPokemon = Object.keys(pokemonDatabase).find(
            name => name.toLowerCase() === pokemonName.toLowerCase()
        );
        
        if (!foundPokemon) {
            // Suggest similar Pokemon names
            const suggestions = Object.keys(pokemonDatabase)
                .filter(name => name.toLowerCase().includes(pokemonName.toLowerCase()))
                .slice(0, 3);
            
            let errorMsg = `Pokémon "${pokemonName}" not found!`;
            if (suggestions.length > 0) {
                errorMsg += ` Did you mean: ${suggestions.join(', ')}?`;
            }
            
            return sendChat('Pokemon System', '/w GM ' + errorMsg);
        }
        
        sendChat('Pokemon System', `/w GM Creating ${foundPokemon} level ${level}...`);
        createPokemon(foundPokemon, level);
    }
});

function generateEncounter(routeName, playerId) {
    const route = routeData[routeName];
    const encounterTypes = Object.keys(route);
    const encounterType = encounterTypes[Math.floor(Math.random() * encounterTypes.length)];
    const encounters = route[encounterType];
    
    const roll = Math.random() * 100;
    let cumulativeRate = 0;
    let selectedEncounter = null;
    
    for (let encounter of encounters) {
        cumulativeRate += encounter.rate;
        if (roll <= cumulativeRate) {
            selectedEncounter = encounter;
            break;
        }
    }
    
    if (!selectedEncounter) {
        sendChat('Pokemon System', '/w GM No encounter generated.');
        return;
    }
    
    const minLevel = selectedEncounter.levelRange[0];
    const maxLevel = selectedEncounter.levelRange[1];
    const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
    
    createPokemon(selectedEncounter.pokemon, level);
}

const hitDieAverages = {
    'd4': 2.5,
    'd6': 3.5,
    'd8': 4.5,
    'd10': 5.5,
    'd12': 6.5,
    'd20': 10.5
};

// Function to calculate HP using hit dice
function calculateHitDiceHP(pokemonData, level) {
    const hitDie = pokemonData.hitDie || 'd6'; // Default to d6 if not specified
    const hitDieAverage = hitDieAverages[hitDie] || 3.5; // Default to d6 average
    
    // Calculate Constitution modifier
    const constitution = pokemonData.con || 10;
    const conModifier = Math.floor((constitution - 10) / 2);
    
    if (level === 1) {
        // Level 1: Use the HP value from the database (this is their "rolled" level 1 HP)
        return pokemonData.hp;
    } else {
        // Higher levels: Database HP at level 1 + average for additional levels
        const level1HP = pokemonData.hp;
        const additionalLevels = level - 1;
        const additionalHP = additionalLevels * Math.max(1, hitDieAverage + conModifier);
        
        return Math.floor(level1HP + additionalHP);
    }
}

function calculateCatchDC(pokemonData, level, currentHP) {
    const baseSR = Math.floor(pokemonData.sr); // Round down the base SR
    const hpComponent = Math.floor(currentHP / 10); // Round down HP/10
    const catchDC = 10 + baseSR + level + hpComponent;
    return catchDC;
}

// Modified createPokemon function - no longer creates moves or abilities
function createPokemon(pokemonName, level) {
    const pokemonData = pokemonDatabase[pokemonName];
    
    if (!pokemonData) {
        sendChat('Pokemon System', '/w GM Pokemon "' + pokemonName + '" not found in database.');
        return;
    }
    
    // Calculate HP using hit dice system
    const adjustedHP = calculateHitDiceHP(pokemonData, level);
    const adjustedAC = pokemonData.ac + Math.floor(level / 4);
    
    // Calculate initial catch DC (when at full HP)
    const initialCatchDC = calculateCatchDC(pokemonData, level, adjustedHP);
    
    const characterName = `${pokemonName} (Lv.${level}) #${encounterCounter}`;
    const tokenName = `${pokemonName} #${encounterCounter}`;
    encounterCounter++;
    
    createObj('character', {
        name: characterName,
        archived: false
    });
    
    setTimeout(() => {
        const character = findObjs({
            _type: 'character',
            name: characterName
        })[0];
        
        if (!character) {
            sendChat('Pokemon System', '/w GM Failed to create character for ' + pokemonName);
            return;
        }
        
        const characterHandoutImage = findPokemonImage(pokemonName);
        let characterImage = null;
        
        if (characterHandoutImage) {
            characterImage = characterHandoutImage;
        } else if (pokemonData.image && pokemonData.image.includes('files.d20.io')) {
            characterImage = pokemonData.image;
        }
        
        if (characterImage) {
            character.set('avatar', characterImage);
        }
        
        // Create basic character attributes
        createObj('attribute', {
            _characterid: character.id,
            name: 'CharType',
            current: '0'
        });
        
        // Store hit die information
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_hit_die',
            current: pokemonData.hitDie || 'd6'
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_hp',
            current: adjustedHP,
            max: adjustedHP
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_hp_max',
            current: adjustedHP
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_ac',
            current: adjustedAC
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_speed',
            current: pokemonData.speed
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_level',
            current: level
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_name',
            current: pokemonName
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_species',
            current: pokemonName
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_type1',
            current: pokemonData.type1
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_type2',
            current: pokemonData.type2
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_loyalty',
            current: 'Neutral'
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_catch_dc',
            current: initialCatchDC
        });
        
        // Store base SR for calculations
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_base_sr',
            current: pokemonData.sr
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_loyalty_value',
            current: 0
        });
        
        // Create bonus checkboxes - set to 0 by default
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_ace_trainer_bonus',
            current: 0
        });
        
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_specialty_bonus',
            current: 0
        });
        
        // Create ability score attributes
        ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].forEach((ability, index) => {
            const shortName = ['str', 'dex', 'con', 'int', 'wis', 'cha'][index];
            const score = pokemonData[shortName];
            
            createObj('attribute', {
                _characterid: character.id,
                name: 'pokemon_' + ability,
                current: score
            });
        });
        
        // Create empty move attributes - sheet will populate these
        for (let i = 1; i <= 4; i++) {
            createObj('attribute', {
                _characterid: character.id,
                name: 'pokemon_move' + i,
                current: ''
            });
            
            createObj('attribute', {
                _characterid: character.id,
                name: 'pokemon_move' + i + '_pp',
                current: ''
            });
            
            createObj('attribute', {
                _characterid: character.id,
                name: 'pokemon_move' + i + '_power',
                current: ''
            });
            
            createObj('attribute', {
                _characterid: character.id,
                name: 'pokemon_move' + i + '_damage',
                current: ''
            });
            
            createObj('attribute', {
                _characterid: character.id,
                name: 'pokemon_move' + i + '_time',
                current: 'action'
            });
            
            createObj('attribute', {
                _characterid: character.id,
                name: 'pokemon_move' + i + '_range',
                current: ''
            });
            
            createObj('attribute', {
                _characterid: character.id,
                name: 'pokemon_move' + i + '_type',
                current: ''
            });
            
            createObj('attribute', {
                _characterid: character.id,
                name: 'pokemon_move' + i + '_description',
                current: ''
            });
        }
        
        const profBonus = Math.ceil(level / 4) + 1;
        createObj('attribute', {
            _characterid: character.id,
            name: 'pokemon_proficiency_bonus',
            current: profBonus
        });
        
        // Initialize ALL skill proficiency attributes with 'none' by default
        const pokemonSkillsList = [
            'acrobatics', 'animal_handling', 'arcana', 'athletics', 'deception', 
            'history', 'insight', 'intimidation', 'investigation', 'medicine', 
            'nature', 'perception', 'performance', 'persuasion', 'religion', 
            'sleight_of_hand', 'stealth', 'survival'
        ];
        
        pokemonSkillsList.forEach(skill => {
            // Set default proficiency level to 'none'
            createObj('attribute', {
                _characterid: character.id,
                name: `pokemon_${skill}_prof`,
                current: 'none'
            });
        });
        
        // Set specific skill proficiencies if defined in Pokemon data
        if (pokemonData.skillProficiencies && pokemonData.skillProficiencies.length > 0) {
            pokemonData.skillProficiencies.forEach(skill => {
                // Check if Pokemon has expertise in this skill
                const hasExpertise = pokemonData.expertiseSkills && pokemonData.expertiseSkills.includes(skill);
                
                // Find and update the existing attribute
                const skillAttr = findObjs({
                    _type: 'attribute',
                    _characterid: character.id,
                    name: `pokemon_${skill}_prof`
                })[0];
                
                if (skillAttr) {
                    skillAttr.set('current', hasExpertise ? 'expertise' : 'proficient');
                }
            });
        }
        
        // Initialize saving throw proficiencies (these remain as checkboxes)
        const savesList = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        savesList.forEach(save => {
            const isProf = pokemonData.saveProficiencies && pokemonData.saveProficiencies.includes(save);
            createObj('attribute', {
                _characterid: character.id,
                name: `pokemon_${save}_save_prof`,
                current: isProf ? 'on' : '0'
            });
        });
        
        // Add features if the Pokemon has any
        if (pokemonData.features && pokemonData.features.length > 0) {
            pokemonData.features.forEach((feature, index) => {
                const slotNumber = index + 1;
                
                if (slotNumber <= 3) {
                    createObj('attribute', {
                        _characterid: character.id,
                        name: `feature_slot_${slotNumber}_active`,
                        current: "1"
                    });
                    
                    createObj('attribute', {
                        _characterid: character.id,
                        name: `feature_${slotNumber}_name`,
                        current: feature.name
                    });
                    
                    createObj('attribute', {
                        _characterid: character.id,
                        name: `feature_${slotNumber}_description`,
                        current: feature.description
                    });
                }
            });
        }
        
        // Calculate basic modifiers (sheet will handle move creation)
        setTimeout(() => {
            calculateAndSetModifiers(character.id, level);
        }, 200);
        
        // Create token
        const currentPageId = Campaign().get('playerpageid');
        
        let tokenImage = 'https://s3.amazonaws.com/files.d20.io/images/4095816/086J-nQbyz-9AjWa3DXjYQ/thumb.png?1400535580';
        
        const handoutImage = findPokemonImage(pokemonName);
        if (handoutImage) {
            tokenImage = handoutImage;
        } else if (pokemonData.image && pokemonData.image.includes('files.d20.io')) {
            tokenImage = pokemonData.image;
        }
        
        const token = createObj('graphic', {
            _pageid: currentPageId,
            _subtype: 'token',
            name: tokenName,
            left: 560,
            top: 420,
            width: 70,
            height: 70,
            layer: 'objects',
            showname: true,
            showplayers_name: true,
            playersedit_name: true,
            playersedit_bar1: true,
            playersedit_bar2: true,
            playersedit_bar3: true,
            showplayers_bar1: true,
            showplayers_bar2: true,
            showplayers_bar3: true,
            imgsrc: tokenImage
        });
        
        setTimeout(() => {
            if (token) {
                token.set('represents', character.id);
                
                setTimeout(() => {
                    const hpAttr = findObjs({
                        _type: 'attribute',
                        _characterid: character.id,
                        name: 'pokemon_hp'
                    })[0];
                    
                    const acAttr = findObjs({
                        _type: 'attribute',
                        _characterid: character.id,
                        name: 'pokemon_ac'
                    })[0];
                    
                    const levelAttr = findObjs({
                        _type: 'attribute',
                        _characterid: character.id,
                        name: 'pokemon_level'
                    })[0];
                    
                    if (hpAttr) {
                        token.set({
                            bar1_link: hpAttr.id,
                            bar1_value: adjustedHP,
                            bar1_max: adjustedHP
                        });
                    }
                    
                    if (acAttr) {
                        token.set({
                            bar2_link: acAttr.id,
                            bar2_value: adjustedAC
                        });
                    }
                    
                    if (levelAttr) {
                        token.set({
                            bar3_link: levelAttr.id,
                            bar3_value: level
                        });
                    }
                }, 300);
            }
        }, 200);
        
        let announcement = `&{template:default} {{name=Pokemon Spawned!}} `;
        announcement += `{{Pokemon=${pokemonName}}} {{Level=${level}}} {{HP=${adjustedHP}}} {{Hit Die=${pokemonData.hitDie || 'd6'}}} {{Note=Sheet will auto-populate moves when opened}}`;
        sendChat('Pokemon System', '/w GM ' + announcement);
        
    }, 100);
}

log('Pokemon Encounter System ready! Use !pokemon-encounter "Route 1" to test.');