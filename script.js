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
        speed: 30, type1: 'poison', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/ekans.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Wrap' },
            { level: 1, move: 'Poison Sting' },
            { level: 2, move: 'Bite' },
            { level: 2, move: 'Glare' },
            { level: 6, move: 'Screech' },
            { level: 6, move: 'Acid' },
            { level: 10, move: 'Spit Up' },
            { level: 10, move: 'Stockpile' },
            { level: 10, move: 'Swallow' },
            { level: 14, move: 'Acid Spray' },
            { level: 14, move: 'Mud Bomb' },
            { level: 14, move: 'Gastro Acid' },
            { level: 18, move: 'Haze' },
            { level: 18, move: 'Coil' },
            { level: 18, move: 'Gunk Shot' },
            { level: 18, move: 'Belch' }
        ],
        features: [
            {
                name: "Intimidate",
                description: "Once per short rest, you can impose disadvantage on an enemy attack roll of your choice."
            },
            {
                name: "Shed Skin",
                description: "If this Pokémon is affected by a negative status ailment, they can roll a d4 at the end of each of their turns. On a result of 4, they are cured."
            },
            {
                name: "Unnerve (Hidden)",
                description: "Opponents in combat with this Pokémon cannot eat held berries."
            }
        ],
        skillProficiencies: ['stealth', 'deception'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 24
    'Arbok': {
        hp: 45, ac: 15, str: 17, dex: 16, con: 14, int: 13, wis: 16, cha: 12,
        speed: 30, type1: 'poison', type2: '', size: 'Large', sr: 6,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/arbok.png',
        hitDie: 'd10',
        learnset: [
            { level: 1, move: 'Bite' },
            { level: 1, move: 'Crunch' },
            { level: 1, move: 'Fire Fang' },
            { level: 1, move: 'Ice Fang' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Poison Sting' },
            { level: 1, move: 'Thunder Fang' },
            { level: 1, move: 'Wrap' },
            { level: 6, move: 'Glare' },
            { level: 6, move: 'Screech' },
            { level: 10, move: 'Acid' },
            { level: 10, move: 'Spit Up' },
            { level: 10, move: 'Stockpile' },
            { level: 10, move: 'Swallow' },
            { level: 14, move: 'Acid Spray' },
            { level: 14, move: 'Mud Bomb' },
            { level: 14, move: 'Gastro Acid' },
            { level: 18, move: 'Haze' },
            { level: 18, move: 'Coil' },
            { level: 18, move: 'Gunk Shot' },
            { level: 18, move: 'Belch' }
        ],
        features: [
            {
                name: "Intimidate",
                description: "Once per short rest, you can impose disadvantage on an enemy attack roll of your choice."
            },
            {
                name: "Shed Skin",
                description: "If this Pokémon is affected by a negative status ailment, they can roll a d4 at the end of each of their turns. On a result of 4, they are cured."
            },
            {
                name: "Unnerve (Hidden)",
                description: "Opponents in combat with this Pokémon cannot eat held berries."
            }
        ],
        skillProficiencies: ['stealth', 'deception', 'intimidation'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 25
    'Pikachu': {
        hp: 16, ac: 13, str: 11, dex: 15, con: 10, int: 6, wis: 10, cha: 12,
        speed: 30, type1: 'electric', type2: '', size: 'Tiny', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/pikachu.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Thunder Shock' },
            { level: 1, move: 'Play Nice' },
            { level: 2, move: 'Growl' },
            { level: 2, move: 'Quick Attack' },
            { level: 6, move: 'Electro Ball' },
            { level: 6, move: 'Thunder Wave' },
            { level: 6, move: 'Feint' },
            { level: 10, move: 'Double Team' },
            { level: 10, move: 'Spark' },
            { level: 10, move: 'Discharge' },
            { level: 10, move: 'Nuzzle' },
            { level: 14, move: 'Slam' },
            { level: 14, move: 'Thunderbolt' },
            { level: 14, move: 'Agility' },
            { level: 18, move: 'Wild Charge' },
            { level: 18, move: 'Light Screen' },
            { level: 18, move: 'Thunder' }
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
        saveProficiencies: ['dexterity', 'charisma'],
        vulnerabilities: ['ground'],
        doubleVulnerabilities: [],
        resistances: ['electric', 'flying', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 26
    'Raichu': {
        hp: 50, ac: 15, str: 16, dex: 18, con: 13, int: 16, wis: 16, cha: 12,
        speed: 35, type1: 'electric', type2: '', size: 'Small', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/raichu.png',
        hitDie: 'd10',
        learnset: [
            { level: 1, move: 'Quick Attack' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Thunder Shock' },
            { level: 1, move: 'Thunderbolt' }
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
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['ground'],
        doubleVulnerabilities: [],
        resistances: ['electric', 'flying', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 27
    'Sandshrew': {
        hp: 17, ac: 14, str: 14, dex: 10, con: 12, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'ground', type2: '', size: 'Tiny', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/sandshrew.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Defense Curl' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Sand Attack' },
            { level: 2, move: 'Poison Sting' },
            { level: 2, move: 'Rollout' },
            { level: 2, move: 'Rapid Spin' },
            { level: 2, move: 'Fury Cutter' },
            { level: 6, move: 'Magnitude' },
            { level: 6, move: 'Swift' },
            { level: 10, move: 'Fury Swipes' },
            { level: 10, move: 'Sand Tomb' },
            { level: 10, move: 'Slash' },
            { level: 14, move: 'Dig' },
            { level: 14, move: 'Gyro Ball' },
            { level: 18, move: 'Swords Dance' },
            { level: 18, move: 'Sandstorm' },
            { level: 18, move: 'Earthquake' }
        ],
        features: [
            {
                name: "Sand Veil",
                description: "This Pokémon is immune to Sandstorm damage. In addition, its AC increases by 2 in desert terrain, or during a Sandstorm."
            },
            {
                name: "Sand Rush (Hidden)",
                description: "This Pokémon is immune to Sandstorm damage, and its speed is doubled in desert terrain, or during a Sandstorm."
            }
        ],
        skillProficiencies: ['athletics'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['grass', 'ice', 'water'],
        doubleVulnerabilities: [],
        resistances: ['poison', 'rock'],
        doubleResistances: [],
        immunities: ['electric']
    },
    // 28
    'Sandslash': {
        hp: 50, ac: 16, str: 16, dex: 14, con: 14, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'ground', type2: '', size: 'Small', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/sandslash.png',
        hitDie: 'd10',
        learnset: [
            { level: 1, move: 'Crush Claw' },
            { level: 1, move: 'Defense Curl' },
            { level: 1, move: 'Poison Sting' },
            { level: 1, move: 'Sand Attack' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Rollout' },
            { level: 1, move: 'Rapid Spin' },
            { level: 1, move: 'Fury Cutter' },
            { level: 6, move: 'Magnitude' },
            { level: 6, move: 'Swift' },
            { level: 10, move: 'Fury Swipes' },
            { level: 10, move: 'Sand Tomb' },
            { level: 14, move: 'Slash' },
            { level: 14, move: 'Dig' },
            { level: 18, move: 'Gyro Ball' },
            { level: 18, move: 'Swords Dance' },
            { level: 18, move: 'Sandstorm' },
            { level: 18, move: 'Earthquake' }
        ],
        features: [
            {
                name: "Sand Veil",
                description: "This Pokémon is immune to Sandstorm damage. In addition, its AC increases by 2 in desert terrain, or during a Sandstorm."
            },
            {
                name: "Sand Rush (Hidden)",
                description: "This Pokémon is immune to Sandstorm damage, and its speed is doubled in desert terrain, or during a Sandstorm."
            }
        ],
        skillProficiencies: ['athletics'],
        saveProficiencies: ['constitution', 'strength'],
        vulnerabilities: ['grass', 'ice', 'water'],
        doubleVulnerabilities: [],
        resistances: ['poison', 'rock'],
        doubleResistances: [],
        immunities: ['electric']
    },
    // 29
    'Nidoran (F)': {
        hp: 17, ac: 12, str: 12, dex: 12, con: 12, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'poison', type2: '', size: 'Tiny', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidoran-f.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Scratch' },
            { level: 2, move: 'Tail Whip' },
            { level: 2, move: 'Double Kick' },
            { level: 6, move: 'Poison Sting' },
            { level: 6, move: 'Fury Swipes' },
            { level: 10, move: 'Bite' },
            { level: 10, move: 'Helping Hand' },
            { level: 14, move: 'Toxic Spikes' },
            { level: 14, move: 'Flatter' },
            { level: 18, move: 'Crunch' },
            { level: 18, move: 'Captivate' },
            { level: 18, move: 'Poison Fang' }
        ],
        features: [
            {
                name: "Poison Point",
                description: "When this Pokémon is hit with a melee attack, roll a 1d4. On a result of 4, the attacker takes an amount of poison damage equal to this Pokémon's proficiency modifier."
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 30
    'Nidorina': {
        hp: 45, ac: 14, str: 14, dex: 13, con: 12, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'poison', type2: '', size: 'Small', sr: 4,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidorina.png',
        hitDie: 'd8',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Double Kick' },
            { level: 6, move: 'Poison Sting' },
            { level: 10, move: 'Fury Swipes' },
            { level: 10, move: 'Bite' },
            { level: 14, move: 'Helping Hand' },
            { level: 14, move: 'Toxic Spikes' },
            { level: 18, move: 'Flatter' },
            { level: 18, move: 'Crunch' },
            { level: 18, move: 'Captivate' },
            { level: 18, move: 'Poison Fang' }
        ],
        features: [
            {
                name: "Poison Point",
                description: "When this Pokémon is hit with a melee attack, roll a 1d4. On a result of 4, the attacker takes an amount of poison damage equal to this Pokémon's proficiency modifier."
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 31
    'Nidoqueen': {
        hp: 122, ac: 16, str: 18, dex: 15, con: 16, int: 15, wis: 15, cha: 15,
        speed: 30, type1: 'poison', type2: 'ground', size: 'Medium', sr: 13,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidoqueen.png',
        hitDie: 'd12',
        learnset: [
            { level: 1, move: 'Double Kick' },
            { level: 1, move: 'Poison Sting' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Chip Away' },
            { level: 14, move: 'Body Slam' },
            { level: 18, move: 'Earth Power' },
            { level: 18, move: 'Superpower' }
        ],
        features: [
            {
                name: "Poison Point",
                description: "When this Pokémon is hit with a melee attack, roll a 1d4. On a result of 4, the attacker takes an amount of poison damage equal to this Pokémon's proficiency modifier."
            },
            {
                name: "Rivalry",
                description: "This Pokémon adds its proficiency bonus to damage when attacking a Pokémon of the same type."
            },
            {
                name: "Sheer Force (Hidden)",
                description: "When activating a move that has a chance to impose a stat change or inflict a status, this creature instead doubles its move modifier."
            }
        ],
        skillProficiencies: ['perception', 'survival'],
        saveProficiencies: ['constitution', 'strength'],
        vulnerabilities: ['water', 'ice', 'ground'],
        doubleVulnerabilities: [],
        resistances: ['rock', 'bug', 'fairy', 'fighting'],
        doubleResistances: ['poison'],
        immunities: ['electric']
    },
    // 32
    'Nidoran (M)': {
        hp: 17, ac: 12, str: 12, dex: 12, con: 12, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'poison', type2: '', size: 'Tiny', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidoran-m.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Peck' },
            { level: 2, move: 'Focus Energy' },
            { level: 2, move: 'Double Kick' },
            { level: 6, move: 'Poison Sting' },
            { level: 6, move: 'Fury Attack' },
            { level: 10, move: 'Horn Attack' },
            { level: 10, move: 'Helping Hand' },
            { level: 14, move: 'Toxic Spikes' },
            { level: 14, move: 'Flatter' },
            { level: 18, move: 'Poison Jab' },
            { level: 18, move: 'Captivate' },
            { level: 18, move: 'Horn Drill' }
        ],
        features: [
            {
                name: "Poison Point",
                description: "When this Pokémon is hit with a melee attack, roll a 1d4. On a result of 4, the attacker takes an amount of poison damage equal to this Pokémon's proficiency modifier."
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 33
    'Nidorino': {
        hp: 45, ac: 14, str: 14, dex: 13, con: 12, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'poison', type2: '', size: 'Small', sr: 4,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidorino.png',
        hitDie: 'd8',
        learnset: [
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Focus Energy' },
            { level: 1, move: 'Double Kick' },
            { level: 6, move: 'Poison Sting' },
            { level: 10, move: 'Fury Attack' },
            { level: 10, move: 'Horn Attack' },
            { level: 14, move: 'Helping Hand' },
            { level: 14, move: 'Toxic Spikes' },
            { level: 18, move: 'Flatter' },
            { level: 18, move: 'Poison Jab' },
            { level: 18, move: 'Captivate' },
            { level: 18, move: 'Horn Drill' }
        ],
        features: [
            {
                name: "Poison Point",
                description: "When this Pokémon is hit with a melee attack, roll a 1d4. On a result of 4, the attacker takes an amount of poison damage equal to this Pokémon's proficiency modifier."
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 34
    'Nidoking': {
        hp: 112, ac: 15, str: 20, dex: 16, con: 15, int: 16, wis: 15, cha: 15,
        speed: 30, type1: 'poison', type2: 'ground', size: 'Medium', sr: 13,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidoking.png',
        hitDie: 'd12',
        learnset: [
            { level: 1, move: 'Double Kick' },
            { level: 1, move: 'Focus Energy' },
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Poison Sting' },
            { level: 1, move: 'Chip Away' },
            { level: 1, move: 'Thrash' },
            { level: 18, move: 'Earth Power' },
            { level: 18, move: 'Megahorn' }
        ],
        features: [
            {
                name: "Poison Point",
                description: "When this Pokémon is hit with a melee attack, roll a 1d4. On a result of 4, the attacker takes an amount of poison damage equal to this Pokémon's proficiency modifier."
            },
            {
                name: "Rivalry",
                description: "This Pokémon adds its proficiency bonus to damage when attacking a Pokémon of the same type."
            },
            {
                name: "Sheer Force (Hidden)",
                description: "When activating a move that has a chance to impose a stat change or inflict a status, this creature instead doubles its move modifier."
            }
        ],
        skillProficiencies: ['perception', 'survival'],
        saveProficiencies: ['constitution', 'strength'],
        vulnerabilities: ['water', 'ice', 'ground'],
        doubleVulnerabilities: [],
        resistances: ['rock', 'bug', 'fairy', 'fighting'],
        doubleResistances: ['poison'],
        immunities: ['electric']
    },
    // 35
    'Clefairy': {
        hp: 18, ac: 13, str: 12, dex: 12, con: 10, int: 6, wis: 12, cha: 12,
        speed: 30, type1: 'fairy', type2: '', size: 'Tiny', sr: 1,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/clefairy.png',
        hitDie: 'd8',
        learnset: [
            { level: 1, move: 'Disarming Voice' },
            { level: 1, move: 'Encore' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Pound' },
            { level: 1, move: 'Spotlight' },
            { level: 2, move: 'Sing' },
            { level: 2, move: 'Double Slap' },
            { level: 6, move: 'Defense Curl' },
            { level: 6, move: 'Follow Me' },
            { level: 6, move: 'Bestow' },
            { level: 6, move: 'Life Dew' },
            { level: 10, move: 'Wake-Up Slap' },
            { level: 10, move: 'Minimize' },
            { level: 14, move: 'Stored Power' },
            { level: 14, move: 'Metronome' },
            { level: 14, move: 'Cosmic Power' },
            { level: 18, move: 'Lucky Chant' },
            { level: 18, move: 'Body Slam' },
            { level: 18, move: 'Moonlight' },
            { level: 18, move: 'Moonblast' },
            { level: 18, move: 'Gravity' },
            { level: 18, move: 'Meteor Mash' },
            { level: 18, move: 'Healing Wish' },
            { level: 18, move: 'After You' }
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
        saveProficiencies: ['wisdom', 'charisma'],
        vulnerabilities: ['poison', 'steel'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'bug', 'dark'],
        doubleResistances: [],
        immunities: ['dragon']
    },
    // 36
    'Clefable': {
        hp: 51, ac: 15, str: 14, dex: 15, con: 12, int: 6, wis: 14, cha: 14,
        speed: 30, type1: 'fairy', type2: '', size: 'Medium', sr: 8,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/clefable.png',
        hitDie: 'd12',
        learnset: [
            { level: 1, move: 'Disarming Voice' },
            { level: 1, move: 'Double Slap' },
            { level: 1, move: 'Metronome' },
            { level: 1, move: 'Minimize' },
            { level: 1, move: 'Sing' },
            { level: 1, move: 'Spotlight' },
            { level: 1, move: 'Life Dew' }
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
                name: "Unaware (Hidden)",
                description: "When this Pokémon attacks an opponent, it ignores any stat changes the opponent has been affected with after the start of battle."
            }
        ],
        skillProficiencies: ['insight', 'persuasion'],
        saveProficiencies: ['wisdom', 'charisma'],
        vulnerabilities: ['poison', 'steel'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'bug', 'dark'],
        doubleResistances: [],
        immunities: ['dragon']
    },
    // 37
    'Vulpix': {
        hp: 16, ac: 13, str: 10, dex: 13, con: 10, int: 6, wis: 10, cha: 12,
        speed: 30, type1: 'fire', type2: '', size: 'Tiny', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/vulpix.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Ember' },
            { level: 1, move: 'Tail Whip' },
            { level: 2, move: 'Roar' },
            { level: 2, move: 'Baby-Doll Eyes' },
            { level: 2, move: 'Quick Attack' },
            { level: 6, move: 'Confuse Ray' },
            { level: 6, move: 'Fire Spin' },
            { level: 6, move: 'Payback' },
            { level: 10, move: 'Will-O-Wisp' },
            { level: 10, move: 'Feint Attack' },
            { level: 10, move: 'Hex' },
            { level: 14, move: 'Flame Burst' },
            { level: 14, move: 'Extrasensory' },
            { level: 14, move: 'Safeguard' },
            { level: 18, move: 'Flamethrower' },
            { level: 18, move: 'Imprison' },
            { level: 18, move: 'Fire Blast' },
            { level: 18, move: 'Grudge' },
            { level: 18, move: 'Captivate' },
            { level: 18, move: 'Inferno' }
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
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['water', 'ground', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 38
    'Ninetales': {
        hp: 40, ac: 17, str: 14, dex: 18, con: 11, int: 6, wis: 12, cha: 12,
        speed: 30, type1: 'fire', type2: '', size: 'Medium', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/ninetales.png',
        hitDie: 'd10',
        learnset: [
            { level: 1, move: 'Confuse Ray' },
            { level: 1, move: 'Flamethrower' },
            { level: 1, move: 'Imprison' },
            { level: 1, move: 'Nasty Plot' },
            { level: 1, move: 'Quick Attack' },
            { level: 1, move: 'Safeguard' }
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
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['water', 'ground', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 39
    'Jigglypuff': {
        hp: 18, ac: 13, str: 12, dex: 12, con: 10, int: 6, wis: 12, cha: 12,
        speed: 20, type1: 'normal', type2: 'fairy', size: 'Tiny', sr: 1,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/jigglypuff.png',
        hitDie: 'd8',
        learnset: [
            { level: 1, move: 'Sing' },
            { level: 1, move: 'Defense Curl' },
            { level: 2, move: 'Pound' },
            { level: 2, move: 'Disarming Voice' },
            { level: 2, move: 'Play Nice' },
            { level: 6, move: 'Disable' },
            { level: 6, move: 'Double Slap' },
            { level: 10, move: 'Rollout' },
            { level: 10, move: 'Round' },
            { level: 10, move: 'Spit Up' },
            { level: 10, move: 'Stockpile' },
            { level: 10, move: 'Swallow' },
            { level: 10, move: 'Wake-Up Slap' },
            { level: 14, move: 'Rest' },
            { level: 14, move: 'Body Slam' },
            { level: 14, move: 'Gyro Ball' },
            { level: 14, move: 'Mimic' },
            { level: 18, move: 'Hyper Voice' },
            { level: 18, move: 'Double-Edge' }
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
        saveProficiencies: ['wisdom', 'charisma'],
        vulnerabilities: ['poison', 'steel'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'dark'],
        doubleResistances: [],
        immunities: ['dragon', 'ghost']
    },
    // 40
    'Wigglytuff': {
        hp: 63, ac: 12, str: 14, dex: 9, con: 13, int: 15, wis: 10, cha: 18,
        speed: 25, type1: 'normal', type2: 'fairy', size: 'Medium', sr: 6, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/wigglytuff.png',
        learnset: [
            { level: 1, move: 'Sing' },
            { level: 1, move: 'Disable' },
            { level: 1, move: 'Defense Curl' },
            { level: 1, move: 'Double Slap' },
            { level: 1, move: 'Copycat' },
            { level: 1, move: 'Covet' },
            { level: 1, move: 'Pound' },
            { level: 1, move: 'Disarming Voice' },
            { level: 1, move: 'Round' },
            { level: 4, move: 'Rollout' },
            { level: 7, move: 'Rest' },
            { level: 10, move: 'Body Slam' },
            { level: 13, move: 'Mimic' },
            { level: 16, move: 'Gyro Ball' },
            { level: 18, move: 'Hyper Voice' }
        ],
        features: [
            {
                name: "Cute Charm",
                description: "When a creature makes a melee attack against this Pokemon, it must make a DC 13 Charisma saving throw. On a failure, the attacker is charmed for 1 minute."
            },
            {
                name: "Competitive (Hidden)",
                description: "When this Pokemon's abilities are reduced by an opponent, it gains advantage on its next attack roll."
            }
        ],
        skillProficiencies: ['performance', 'persuasion'],
        saveProficiencies: ['charisma'],
        vulnerabilities: ['poison', 'steel'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'dark'],
        doubleResistances: [],
        immunities: ['dragon', 'ghost']
    },
    // 41
    'Zubat': {
        hp: 17, ac: 12, str: 10, dex: 14, con: 12, int: 6, wis: 12, cha: 8,
        speed: 25, type1: 'poison', type2: 'flying', size: 'Small', sr: .25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/zubat.png',
        learnset: [
            { level: 1, move: 'Absorb' },
            { level: 2, move: 'Supersonic' },
            { level: 2, move: 'Astonish' },
            { level: 2, move: 'Bite' },
            { level: 6, move: 'Wing Attack' },
            { level: 6, move: 'Confuse Ray' },
            { level: 6, move: 'Air Cutter' },
            { level: 10, move: 'Swift' },
            { level: 10, move: 'Poison Fang' },
            { level: 14, move: 'Mean Look' },
            { level: 14, move: 'Leech Life' },
            { level: 14, move: 'Haze' },
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
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'ice', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'poison', 'bug'],
        doubleResistances: ['grass'],
        immunities: ['ground']
    },
    // 42
    'Golbat': {
        hp: 50, ac: 15, str: 14, dex: 18, con: 14, int: 6, wis: 14, cha: 8,
        speed: 30, type1: 'poison', type2: 'flying', size: 'Medium', sr: 7, hitDie: 'd10',
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
        saveProficiencies: ['dexterity', 'constitution'],
        vulnerabilities: ['electric', 'ice', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'poison', 'bug'],
        doubleResistances: ['grass'],
        immunities: ['ground']
    },
    // 43
    'Oddish': {
        hp: 17, ac: 13, str: 11, dex: 11, con: 12, int: 6, wis: 10, cha: 12,
        speed: 20, type1: 'grass', type2: 'poison', size: 'Small', sr: .25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/oddish.png',
        learnset: [
            { level: 1, move: 'Absorb' },
            { level: 1, move: 'Growth' },
            { level: 2, move: 'Sweet Scent' },
            { level: 2, move: 'Acid' },
            { level: 6, move: 'Poison Powder' },
            { level: 6, move: 'Stun Spore' },
            { level: 6, move: 'Sleep Powder' },
            { level: 10, move: 'Mega Drain' },
            { level: 10, move: 'Lucky Chant' },
            { level: 10, move: 'Moonlight' },
            { level: 14, move: 'Giga Drain' },
            { level: 14, move: 'Toxic' },
            { level: 18, move: 'Natural Gift' },
            { level: 18, move: 'Moonblast' },
            { level: 18, move: 'Petal Dance' },
            { level: 18, move: 'Grassy Terrain' }
        ],
        features: [
            {
                name: "Chlorophyll",
                description: "This Pokémon's speed is doubled in harsh sunlight."
            },
            {
                name: "Run Away (Hidden)",
                description: "This Pokémon cannot be the target of an attack of opportunity."
            }
        ],
        skillProficiencies: ['nature', 'survival'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fire', 'ice', 'flying', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['water', 'electric', 'grass', 'fighting'],
        doubleResistances: [],
        immunities: []
    },
    // 44
    'Gloom': {
        hp: 50, ac: 14, str: 14, dex: 12, con: 15, int: 6, wis: 12, cha: 10,
        speed: 20, type1: 'grass', type2: 'poison', size: 'Medium', sr: 5, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/gloom.png',
        learnset: [
            { level: 1, move: 'Absorb' },
            { level: 1, move: 'Acid' },
            { level: 1, move: 'Growth' },
            { level: 1, move: 'Sweet Scent' },
            { level: 6, move: 'Poison Powder' },
            { level: 6, move: 'Stun Spore' },
            { level: 6, move: 'Sleep Powder' },
            { level: 10, move: 'Mega Drain' },
            { level: 10, move: 'Lucky Chant' },
            { level: 14, move: 'Moonlight' },
            { level: 14, move: 'Giga Drain' },
            { level: 14, move: 'Toxic' },
            { level: 18, move: 'Natural Gift' },
            { level: 18, move: 'Petal Dance' },
            { level: 18, move: 'Petal Blizzard' },
            { level: 18, move: 'Grassy Terrain' }
        ],
        features: [
            {
                name: "Chlorophyll",
                description: "This Pokémon's speed is doubled in harsh sunlight."
            },
            {
                name: "Stench (Hidden)",
                description: "When this Pokémon is hit by a melee attack, roll a d10. On a 10, the attacker flinches."
            }
        ],
        skillProficiencies: ['nature', 'survival'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fire', 'ice', 'flying', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['water', 'electric', 'grass', 'fighting'],
        doubleResistances: [],
        immunities: []
    },
    // 45
    'Vileplume': {
        hp: 107, ac: 16, str: 14, dex: 12, con: 16, int: 18, wis: 16, cha: 14,
        speed: 30, type1: 'grass', type2: 'poison', size: 'Small', sr: 13, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/vileplume.png',
        learnset: [
            { level: 1, move: 'Aromatherapy' },
            { level: 1, move: 'Mega Drain' },
            { level: 1, move: 'Poison Powder' },
            { level: 1, move: 'Stun Spore' },
            { level: 18, move: 'Petal Dance' },
            { level: 18, move: 'Solar Beam' },
            { level: 18, move: 'Petal Blizzard' }
        ],
        features: [
            {
                name: "Chlorophyll",
                description: "This Pokémon's speed is doubled in harsh sunlight."
            },
            {
                name: "Effect Spore (Hidden)",
                description: "When hit by a melee attack, roll a d4. On a 4, deal an amount of grass damage equal to your proficiency modifier to your attacker."
            }
        ],
        skillProficiencies: ['nature', 'survival', 'persuasion'],
        saveProficiencies: ['constitution', 'charisma'],
        vulnerabilities: ['fire', 'ice', 'flying', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['water', 'electric', 'grass', 'fighting'],
        doubleResistances: [],
        immunities: []
    },
    // 46
    'Paras': {
        hp: 18, ac: 13, str: 12, dex: 9, con: 15, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'bug', type2: 'grass', size: 'Small', sr: .25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/paras.png',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 2, move: 'Poison Powder' },
            { level: 2, move: 'Stun Spore' },
            { level: 2, move: 'Absorb' },
            { level: 6, move: 'Fury Cutter' },
            { level: 10, move: 'Spore' },
            { level: 10, move: 'Slash' },
            { level: 14, move: 'Growth' },
            { level: 18, move: 'Giga Drain' },
            { level: 18, move: 'Aromatherapy' },
            { level: 18, move: 'Rage Powder' },
            { level: 18, move: 'X-Scissor' }
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fire', 'ice', 'poison', 'flying', 'bug', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['water', 'electric', 'grass'],
        doubleResistances: ['ground', 'fighting'],
        immunities: []
    },
    // 47
    'Parasect': {
        hp: 55, ac: 15, str: 16, dex: 12, con: 16, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'bug', type2: 'grass', size: 'Medium', sr: 7, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/parasect.png',
        learnset: [
            { level: 1, move: 'Absorb' },
            { level: 1, move: 'Cross Poison' },
            { level: 1, move: 'Poison Powder' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Stun Spore' },
            { level: 6, move: 'Fury Cutter' },
            { level: 10, move: 'Spore' },
            { level: 14, move: 'Slash' },
            { level: 14, move: 'Growth' },
            { level: 18, move: 'Giga Drain' },
            { level: 18, move: 'Aromatherapy' },
            { level: 18, move: 'Rage Powder' },
            { level: 18, move: 'X-Scissor' }
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
        skillProficiencies: ['nature', 'survival'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fire', 'ice', 'poison', 'flying', 'bug', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['water', 'electric', 'grass'],
        doubleResistances: ['ground', 'fighting'],
        immunities: []
    },
    // 48
    'Venonat': {
        hp: 16, ac: 13, str: 13, dex: 11, con: 11, int: 6, wis: 12, cha: 10,
        speed: 20, type1: 'bug', type2: 'poison', size: 'Medium', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/venonat.png',
        learnset: [
            { level: 1, move: 'Disable' },
            { level: 1, move: 'Foresight' },
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Supersonic' },
            { level: 2, move: 'Confusion' },
            { level: 6, move: 'Poison Powder' },
            { level: 6, move: 'Psybeam' },
            { level: 10, move: 'Stun Spore' },
            { level: 10, move: 'Signal Beam' },
            { level: 14, move: 'Sleep Powder' },
            { level: 14, move: 'Leech Life' },
            { level: 18, move: 'Zen Headbutt' },
            { level: 18, move: 'Poison Fang' },
            { level: 18, move: 'Psychic' }
        ],
        features: [
            {
                name: "Compound Eyes",
                description: "This Pokémon gets an additional +1 to attack rolls."
            },
            {
                name: "Tinted Lens",
                description: "This Pokémon's moves ignore resistances."
            },
            {
                name: "Run Away (Hidden)",
                description: "This Pokémon cannot be the target of an attack of opportunity."
            }
        ],
        skillProficiencies: ['nature'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fire', 'flying', 'psychic', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['poison', 'bug'],
        doubleResistances: ['grass', 'fighting'],
        immunities: []
    },
    // 49
    'Venomoth': {
        hp: 64, ac: 15, str: 14, dex: 17, con: 12, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'bug', type2: 'poison', size: 'Medium', sr: 8, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/venomoth.png',
        learnset: [
            { level: 1, move: 'Disable' },
            { level: 1, move: 'Foresight' },
            { level: 1, move: 'Gust' },
            { level: 1, move: 'Quiver Dance' },
            { level: 1, move: 'Silver Wind' },
            { level: 1, move: 'Supersonic' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Confusion' },
            { level: 1, move: 'Poison Powder' },
            { level: 1, move: 'Psybeam' },
            { level: 10, move: 'Stun Spore' },
            { level: 10, move: 'Signal Beam' },
            { level: 14, move: 'Sleep Powder' },
            { level: 14, move: 'Leech Life' },
            { level: 14, move: 'Pounce' },
            { level: 18, move: 'Zen Headbutt' },
            { level: 18, move: 'Poison Fang' },
            { level: 18, move: 'Psychic' },
            { level: 18, move: 'Bug Buzz' }
        ],
        features: [
            {
                name: "Shield Dust",
                description: "Once per long rest, this Pokémon can ignore a negative status condition."
            },
            {
                name: "Tinted Lens",
                description: "This Pokémon's moves ignore resistances."
            },
            {
                name: "Wonder Skin (Hidden)",
                description: "This Pokémon has advantage on all saving throws against being burned, frozen, poisoned, or paralyzed."
            }
        ],
        skillProficiencies: ['nature'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fire', 'flying', 'psychic', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['poison', 'bug'],
        doubleResistances: ['grass', 'fighting'],
        immunities: []
    },
    // 50
    'Diglett': {
        hp: 18, ac: 12, str: 12, dex: 12, con: 14, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'ground', type2: '', size: 'Small', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/diglett.png',
        learnset: [
            { level: 1, move: 'Sand Attack' },
            { level: 1, move: 'Scratch' },
            { level: 2, move: 'Growl' },
            { level: 2, move: 'Astonish' },
            { level: 6, move: 'Mud-Slap' },
            { level: 6, move: 'Magnitude' },
            { level: 6, move: 'Bulldoze' },
            { level: 10, move: 'Sucker Punch' },
            { level: 10, move: 'Mud Bomb' },
            { level: 14, move: 'Earth Power' },
            { level: 14, move: 'Dig' },
            { level: 14, move: 'Slash' },
            { level: 18, move: 'Earthquake' },
            { level: 18, move: 'Fissure' }
        ],
        features: [
            {
                name: "Sand Veil",
                description: "Immune to Sandstorm damage. AC increases by 2 in desert terrain, or during a Sandstorm."
            },
            {
                name: "Arena Trap",
                description: "Grounded creatures within 50 feet may not flee or switch out, except by item, Move, or ability."
            },
            {
                name: "Sand Force (Hidden)",
                description: "During a Sandstorm, can double its STAB when it hits an opponent."
            }
        ],
        skillProficiencies: ['athletics', 'stealth'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['water', 'grass', 'ice'],
        doubleVulnerabilities: [],
        resistances: ['poison', 'rock'],
        doubleResistances: [],
        immunities: ['electric']
    },
    // 51
    'Dugtrio': {
        hp: 55, ac: 15, str: 15, dex: 18, con: 16, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'ground', type2: '', size: 'Small', sr: 8, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/dugtrio.png',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Night Slash' },
            { level: 1, move: 'Sand Attack' },
            { level: 1, move: 'Sand Tomb' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Tri Attack' },
            { level: 1, move: 'Astonish' },
            { level: 1, move: 'Rototiller' },
            { level: 6, move: 'Mud-Slap' },
            { level: 6, move: 'Magnitude' },
            { level: 6, move: 'Bulldoze' },
            { level: 10, move: 'Sucker Punch' },
            { level: 10, move: 'Mud Bomb' },
            { level: 14, move: 'Earth Power' },
            { level: 14, move: 'Dig' },
            { level: 18, move: 'Slash' },
            { level: 18, move: 'Earthquake' },
            { level: 18, move: 'Fissure' }
        ],
        features: [
            {
                name: "Sand Veil",
                description: "Immune to Sandstorm damage. AC increases by 2 in desert terrain, or during a Sandstorm."
            },
            {
                name: "Arena Trap",
                description: "Grounded creatures within 50 feet may not flee or switch out, except by item, Move, or ability."
            },
            {
                name: "Sand Force (Hidden)",
                description: "During a Sandstorm, can double its STAB when it hits an opponent."
            }
        ],
        skillProficiencies: ['athletics', 'stealth'],
        saveProficiencies: ['dexterity', 'constitution'],
        vulnerabilities: ['water', 'grass', 'ice'],
        doubleVulnerabilities: [],
        resistances: ['poison', 'rock'],
        doubleResistances: [],
        immunities: ['electric']
    },
    // 52
    'Meowth': { 
        hp: 16, ac: 13, str: 10, dex: 15, con: 10, int: 8, wis: 10, cha: 12,
        speed: 30, type1: 'normal', type2: '', size: 'Small', sr: .5,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/meowth.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Scratch' },
            { level: 2, move: 'Bite' },
            { level: 2, move: 'Fake Out' },
            { level: 6, move: 'Fury Swipes' },
            { level: 6, move: 'Screech' },
            { level: 10, move: 'Feint Attack' },
            { level: 10, move: 'Taunt' },
            { level: 14, move: 'Pay Day' },
            { level: 14, move: 'Slash' },
            { level: 18, move: 'Nasty Plot' },
            { level: 18, move: 'Assurance' },
            { level: 18, move: 'Captivate' },
            { level: 18, move: 'Night Slash' },
            { level: 18, move: 'Feint' }
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
        skillProficiencies: ['persuasion', 'deception', 'sleight of hand'],
        saveProficiencies: ['dexterity', 'charisma'],
        vulnerabilities: ['fighting'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost']
    },
    // 53
    'Persian': {
        hp: 40, ac: 15, str: 14, dex: 16, con: 13, int: 13, wis: 13, cha: 16,
        speed: 35, type1: 'normal', type2: '', size: 'Medium', sr: 7, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/persian.png',
        learnset: [
            { level: 1, move: 'Bite' },
            { level: 1, move: 'Fake Out' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Play Rough' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Swift' },
            { level: 1, move: 'Switcheroo' },
            { level: 6, move: 'Fury Swipes' },
            { level: 6, move: 'Screech' },
            { level: 10, move: 'Feint Attack' },
            { level: 10, move: 'Taunt' },
            { level: 14, move: 'Power Gem' },
            { level: 18, move: 'Slash' },
            { level: 18, move: 'Nasty Plot' },
            { level: 18, move: 'Assurance' },
            { level: 18, move: 'Captivate' },
            { level: 18, move: 'Night Slash' },
            { level: 18, move: 'Feint' }
        ],
        features: [
            {
                name: "Limber",
                description: "This Pokémon is immune to being paralyzed."
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
        skillProficiencies: ['sleight of hand', 'deception', 'persuasion'],
        saveProficiencies: ['dexterity', 'charisma'],
        vulnerabilities: ['fighting'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost']
    },
    // 54
    'Psyduck': {
        hp: 18, ac: 13, str: 11, dex: 12, con: 14, int: 6, wis: 12, cha: 10,
        speed: 20, type1: 'water', type2: '', size: 'Medium', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/psyduck.png',
        learnset: [
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Water Sport' },
            { level: 2, move: 'Tail Whip' },
            { level: 2, move: 'Water Gun' },
            { level: 2, move: 'Confusion' },
            { level: 6, move: 'Fury Swipes' },
            { level: 6, move: 'Water Pulse' },
            { level: 6, move: 'Disable' },
            { level: 10, move: 'Screech' },
            { level: 10, move: 'Zen Headbutt' },
            { level: 14, move: 'Aqua Tail' },
            { level: 14, move: 'Soak' },
            { level: 14, move: 'Psych Up' },
            { level: 18, move: 'Amnesia' },
            { level: 18, move: 'Hydro Pump' },
            { level: 18, move: 'Wonder Room' }
        ],
        features: [
            {
                name: "Damp",
                description: "This Pokémon is unaffected by Self Destruct and Explosion moves."
            },
            {
                name: "Cloud Nine",
                description: "Weather-related abilities have no effect while this Pokémon is in battle."
            },
            {
                name: "Swift Swim (Hidden)",
                description: "This Pokémon's speed is doubled in rainy conditions."
            }
        ],
        skillProficiencies: ['insight'],
        saveProficiencies: ['constitution', 'wisdom'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 55
    'Golduck': {
        hp: 72, ac: 16, str: 14, dex: 15, con: 14, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'water', type2: '', size: 'Medium', sr: 10, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/golduck.png',
        learnset: [
            { level: 1, move: 'Aqua Jet' },
            { level: 1, move: 'Me First' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Water Gun' },
            { level: 1, move: 'Water Sport' },
            { level: 1, move: 'Confusion' },
            { level: 1, move: 'Fury Swipes' },
            { level: 1, move: 'Water Pulse' },
            { level: 1, move: 'Disable' },
            { level: 10, move: 'Screech' },
            { level: 10, move: 'Zen Headbutt' },
            { level: 14, move: 'Aqua Tail' },
            { level: 14, move: 'Soak' },
            { level: 18, move: 'Psych Up' },
            { level: 18, move: 'Amnesia' },
            { level: 18, move: 'Hydro Pump' },
            { level: 18, move: 'Wonder Room' }
        ],
        features: [
            {
                name: "Damp",
                description: "This Pokémon is unaffected by Self Destruct and Explosion moves."
            },
            {
                name: "Cloud Nine",
                description: "Weather-related abilities have no effect while this Pokémon is in battle."
            },
            {
                name: "Swift Swim (Hidden)",
                description: "This Pokémon's speed is doubled in rainy conditions."
            }
        ],
        skillProficiencies: ['insight'],
        saveProficiencies: ['constitution', 'wisdom'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 56
    'Mankey': {
        hp: 16, ac: 12, str: 12, dex: 14, con: 11, int: 6, wis: 10, cha: 8,
        speed: 20, type1: 'fighting', type2: '', size: 'Small', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/mankey.png',
        learnset: [
            { level: 1, move: 'Covet' },
            { level: 1, move: 'Focus Energy' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Low Kick' },
            { level: 1, move: 'Scratch' },
            { level: 2, move: 'Fury Swipes' },
            { level: 2, move: 'Karate Chop' },
            { level: 6, move: 'Pursuit' },
            { level: 6, move: 'Seismic Toss' },
            { level: 6, move: 'Swagger' },
            { level: 10, move: 'Cross Chop' },
            { level: 10, move: 'Assurance' },
            { level: 14, move: 'Punishment' },
            { level: 14, move: 'Thrash' },
            { level: 14, move: 'Stomping Tantrum' },
            { level: 18, move: 'Close Combat' },
            { level: 18, move: 'Screech' },
            { level: 18, move: 'Outrage' },
            { level: 18, move: 'Final Gambit' }
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
        skillProficiencies: ['athletics', 'acrobatics'],
        saveProficiencies: ['dexterity', 'strength'],
        vulnerabilities: ['flying', 'psychic', 'fairy'],
        doubleVulnerabilities: [],
        resistances: ['rock', 'bug', 'dark'],
        doubleResistances: [],
        immunities: []
    },
    // 57
    'Primeape': {
        hp: 45, ac: 15, str: 16, dex: 16, con: 13, int: 6, wis: 12, cha: 8,
        speed: 30, type1: 'fighting', type2: '', size: 'Medium', sr: 6, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/primeape.png',
        learnset: [
            { level: 1, move: 'Fling' },
            { level: 1, move: 'Focus Energy' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Low Kick' },
            { level: 1, move: 'Rage' },
            { level: 1, move: 'Scratch' },
            { level: 1, move: 'Fury Swipes' },
            { level: 1, move: 'Karate Chop' },
            { level: 6, move: 'Pursuit' },
            { level: 6, move: 'Seismic Toss' },
            { level: 10, move: 'Swagger' },
            { level: 10, move: 'Cross Chop' },
            { level: 10, move: 'Assurance' },
            { level: 10, move: 'Rage Fist' },
            { level: 14, move: 'Punishment' },
            { level: 14, move: 'Thrash' },
            { level: 18, move: 'Stomping Tantrum' },
            { level: 18, move: 'Close Combat' },
            { level: 18, move: 'Screech' },
            { level: 18, move: 'Outrage' },
            { level: 18, move: 'Final Gambit' }
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
        skillProficiencies: ['athletics', 'acrobatics'],
        saveProficiencies: ['dexterity', 'strength'],
        vulnerabilities: ['flying', 'psychic', 'fairy'],
        doubleVulnerabilities: [],
        resistances: ['rock', 'bug', 'dark'],
        doubleResistances: [],
        immunities: []
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
            { level: 2, move: 'Leer' },
            { level: 2, move: 'Odor Sleuth' },
            { level: 6, move: 'Helping Hand' },
            { level: 6, move: 'Flame Wheel' },
            { level: 10, move: 'Reversal' },
            { level: 10, move: 'Fire Fang' },
            { level: 10, move: 'Take Down' },
            { level: 14, move: 'Flame Burst' },
            { level: 14, move: 'Agility' },
            { level: 14, move: 'Retaliate' },
            { level: 14, move: 'Flamethrower' },
            { level: 18, move: 'Crunch' },
            { level: 18, move: 'Heat Wave' },
            { level: 18, move: 'Outrage' },
            { level: 18, move: 'Flare Blitz' }
        ],
        features: [
            {
                name: "Intimidate",
                description: "Once per short rest, you can impose disadvantage on an enemy attack roll of your choice."
            },
            {
                name: "Flash Fire",
                description: "This Pokémon takes no damage from fire or fire-type attacks. Instead, immediately after taking a hit from a fire-type move, or in open flames, double the STAB bonus on the next fire-type move."
            },
            {
                name: "Justified (Hidden)",
                description: "When this Pokémon is hit by a dark-type move, it gets advantage on its next attack."
            }
        ],
        skillProficiencies: ['perception'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['water', 'ground', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 59
    'Arcanine': {
        hp: 80, ac: 16, str: 16, dex: 18, con: 16, int: 6, wis: 12, cha: 10,
        speed: 35, type1: 'fire', type2: '', size: 'Large', sr: 11, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/arcanine.png',
        learnset: [
            { level: 1, move: 'Bite' },
            { level: 1, move: 'Fire Fang' },
            { level: 1, move: 'Odor Sleuth' },
            { level: 1, move: 'Roar' },
            { level: 1, move: 'Thunder Fang' },
            { level: 14, move: 'Extreme Speed' }
        ],
        features: [
            {
                name: "Intimidate",
                description: "Once per short rest, you can impose disadvantage on an enemy attack roll of your choice."
            },
            {
                name: "Flash Fire",
                description: "This Pokémon takes no damage from fire or fire-type attacks."
            },
            {
                name: "Justified (Hidden)",
                description: "When this Pokémon is hit by a dark-type move, it gets advantage on its next attack."
            }
        ],
        skillProficiencies: ['arcana', 'perception'],
        saveProficiencies: ['dexterity', 'strength'],
        vulnerabilities: ['water', 'ground', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
        doubleResistances: [],
        immunities: []
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
            { level: 2, move: 'Bubble' },
            { level: 6, move: 'Double Slap' },
            { level: 6, move: 'Rain Dance' },
            { level: 10, move: 'Body Slam' },
            { level: 10, move: 'Bubble Beam' },
            { level: 14, move: 'Mud Shot' },
            { level: 14, move: 'Belly Drum' },
            { level: 14, move: 'Wake-Up Slap' },
            { level: 18, move: 'Hydro Pump' },
            { level: 18, move: 'Mud Bomb' }
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
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 61
    'Poliwhirl': {
        hp: 45, ac: 14, str: 12, dex: 15, con: 12, int: 6, wis: 12, cha: 10,
        speed: 25, type1: 'water', type2: '', size: 'Small', sr: 3, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/poliwhirl.png',
        learnset: [
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Water Gun' },
            { level: 1, move: 'Water Sport' },
            { level: 1, move: 'Bubble' },
            { level: 6, move: 'Double Slap' },
            { level: 6, move: 'Rain Dance' },
            { level: 10, move: 'Body Slam' },
            { level: 10, move: 'Bubble Beam' },
            { level: 14, move: 'Mud Shot' },
            { level: 18, move: 'Belly Drum' },
            { level: 18, move: 'Wake-Up Slap' },
            { level: 18, move: 'Hydro Pump' },
            { level: 18, move: 'Mud Bomb' }
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
        skillProficiencies: ['athletics', 'acrobatics'],
        saveProficiencies: ['dexterity', 'strength'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 62
    'Poliwrath': {
        hp: 97, ac: 16, str: 19, dex: 17, con: 14, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'water', type2: 'fighting', size: 'Medium', sr: 12, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/poliwrath.png',
        learnset: [
            { level: 1, move: 'Bubble Beam' },
            { level: 1, move: 'Double Slap' },
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Submission' },
            { level: 14, move: 'Dynamic Punch' },
            { level: 18, move: 'Mind Reader' },
            { level: 18, move: 'Circle Throw' }
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
        skillProficiencies: ['athletics', 'acrobatics'],
        saveProficiencies: ['dexterity', 'strength'],
        vulnerabilities: ['electric', 'grass', 'flying', 'psychic', 'fairy'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel', 'rock', 'bug', 'dark'],
        doubleResistances: [],
        immunities: []
    },
    // 63
    'Abra': {
        hp: 15, ac: 12, str: 9, dex: 13, con: 8, int: 12, wis: 12, cha: 10,
        speed: 20, type1: 'psychic', type2: '', size: 'Small', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/abra.png',
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
                name: "Magic Guard (Hidden)",
                description: "If this Pokémon is subjected to a move that forces it to make a saving throw to take only half damage, it instead takes no damage on a success."
            }
        ],
        skillProficiencies: ['arcana', 'insight'],
        saveProficiencies: ['wisdom'],
        vulnerabilities: ['bug', 'ghost', 'dark'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'psychic'],
        doubleResistances: [],
        immunities: []
    },
    // 64
    'Kadabra': {
        hp: 40, ac: 14, str: 11, dex: 15, con: 10, int: 14, wis: 14, cha: 10,
        speed: 30, type1: 'psychic', type2: '', size: 'Medium', sr: 6, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/kadabra.png',
        learnset: [
            { level: 1, move: 'Confusion' },
            { level: 1, move: 'Kinesis' },
            { level: 1, move: 'Teleport' },
            { level: 6, move: 'Disable' },
            { level: 10, move: 'Psybeam' },
            { level: 10, move: 'Miracle Eye' },
            { level: 10, move: 'Reflect' },
            { level: 14, move: 'Psycho Cut' },
            { level: 14, move: 'Recover' },
            { level: 14, move: 'Telekinesis' },
            { level: 14, move: 'Psychic' },
            { level: 18, move: 'Ally Switch' },
            { level: 18, move: 'Role Play' },
            { level: 18, move: 'Future Sight' },
            { level: 18, move: 'Trick' }
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
                name: "Magic Guard (Hidden)",
                description: "If this Pokémon is subjected to a move that forces it to make a saving throw to take only half damage, it instead takes no damage on a success."
            }
        ],
        skillProficiencies: ['arcana', 'insight'],
        saveProficiencies: ['wisdom'],
        vulnerabilities: ['bug', 'ghost', 'dark'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'psychic'],
        doubleResistances: [],
        immunities: []
    },
    // 65
    'Alakazam': {
        hp: 87, ac: 17, str: 12, dex: 16, con: 12, int: 16, wis: 16, cha: 10,
        speed: 30, type1: 'psychic', type2: '', size: 'Medium', sr: 12, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/alakazam.png',
        learnset: [
            { level: 1, move: 'Confusion' },
            { level: 1, move: 'Kinesis' },
            { level: 1, move: 'Teleport' },
            { level: 1, move: 'Disable' },
            { level: 1, move: 'Psybeam' },
            { level: 1, move: 'Miracle Eye' },
            { level: 1, move: 'Reflect' },
            { level: 14, move: 'Psycho Cut' },
            { level: 14, move: 'Recover' },
            { level: 14, move: 'Telekinesis' },
            { level: 14, move: 'Psychic' },
            { level: 18, move: 'Ally Switch' },
            { level: 18, move: 'Calm Mind' },
            { level: 18, move: 'Future Sight' },
            { level: 18, move: 'Trick' }
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
                name: "Magic Guard (Hidden)",
                description: "If this Pokémon is subjected to a move that forces it to make a saving throw to take only half damage, it instead takes no damage on a success."
            }
        ],
        skillProficiencies: ['arcana', 'insight'],
        saveProficiencies: ['charisma', 'wisdom'],
        vulnerabilities: ['bug', 'ghost', 'dark'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'psychic'],
        doubleResistances: [],
        immunities: []
    },
    // 66
    'Machop': {
        hp: 17, ac: 12, str: 14, dex: 12, con: 12, int: 6, wis: 10, cha: 10,
        speed: 25, type1: 'fighting', type2: '', size: 'Tiny', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/machop.png',
        learnset: [
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Low Kick' },
            { level: 1, move: 'Focus Energy' },
            { level: 2, move: 'Karate Chop' },
            { level: 2, move: 'Foresight' },
            { level: 6, move: 'Low Sweep' },
            { level: 6, move: 'Seismic Toss' },
            { level: 6, move: 'Revenge' },
            { level: 10, move: 'Knock Off' },
            { level: 10, move: 'Vital Throw' },
            { level: 10, move: 'Wake-Up Slap' },
            { level: 14, move: 'Dual Chop' },
            { level: 14, move: 'Submission' },
            { level: 14, move: 'Bulk Up' },
            { level: 18, move: 'Cross Chop' },
            { level: 18, move: 'Scary Face' },
            { level: 18, move: 'Dynamic Punch' }
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
        saveProficiencies: ['strength', 'dexterity'],
        vulnerabilities: ['flying', 'psychic', 'fairy'],
        doubleVulnerabilities: [],
        resistances: ['rock', 'bug', 'dark'],
        doubleResistances: [],
        immunities: []
    },
    // 67
    'Machoke': {
        hp: 50, ac: 14, str: 15, dex: 13, con: 14, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'fighting', type2: '', size: 'Medium', sr: 5, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/machoke.png',
        learnset: [
            { level: 1, move: 'Focus Energy' },
            { level: 1, move: 'Karate Chop' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Low Kick' },
            { level: 1, move: 'Foresight' },
            { level: 6, move: 'Low Sweep' },
            { level: 6, move: 'Seismic Toss' },
            { level: 6, move: 'Revenge' },
            { level: 10, move: 'Knock Off' },
            { level: 10, move: 'Vital Throw' },
            { level: 10, move: 'Wake-Up Slap' },
            { level: 14, move: 'Dual Chop' },
            { level: 14, move: 'Submission' },
            { level: 14, move: 'Bulk Up' },
            { level: 18, move: 'Cross Chop' },
            { level: 18, move: 'Scary Face' },
            { level: 18, move: 'Dynamic Punch' }
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
        saveProficiencies: ['strength', 'dexterity'],
        vulnerabilities: ['flying', 'psychic', 'fairy'],
        doubleVulnerabilities: [],
        resistances: ['rock', 'bug', 'dark'],
        doubleResistances: [],
        immunities: []
    },
    // 68
    'Machamp': {
        hp: 107, ac: 15, str: 18, dex: 16, con: 16, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'fighting', type2: '', size: 'Medium', sr: 12, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/machamp.png',
        learnset: [
            { level: 1, move: 'Focus Energy' },
            { level: 1, move: 'Karate Chop' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Low Kick' },
            { level: 1, move: 'Strength' },
            { level: 1, move: 'Wide Guard' },
            { level: 1, move: 'Foresight' },
            { level: 1, move: 'Low Sweep' },
            { level: 1, move: 'Seismic Toss' },
            { level: 1, move: 'Revenge' },
            { level: 1, move: 'Knock Off' },
            { level: 1, move: 'Vital Throw' },
            { level: 1, move: 'Wake-Up Slap' },
            { level: 14, move: 'Dual Chop' },
            { level: 14, move: 'Submission' },
            { level: 14, move: 'Bulk Up' },
            { level: 18, move: 'Cross Chop' },
            { level: 18, move: 'Scary Face' },
            { level: 18, move: 'Dynamic Punch' }
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
        saveProficiencies: ['strength', 'dexterity'],
        vulnerabilities: ['flying', 'psychic', 'fairy'],
        doubleVulnerabilities: [],
        resistances: ['rock', 'bug', 'dark'],
        doubleResistances: [],
        immunities: []
    },
    // 69
    'Bellsprout': { 
        hp: 18, ac: 11, str: 10, dex: 12, con: 14, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'grass', type2: 'poison', size: 'Tiny', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/bellsprout.png',
        hitDie: 'd6',
        learnset: [
            { level: 1, move: 'Vine Whip' },
            { level: 2, move: 'Growth' },
            { level: 2, move: 'Wrap' },
            { level: 6, move: 'Sleep Powder' },
            { level: 6, move: 'Poison Powder' },
            { level: 6, move: 'Stun Spore' },
            { level: 10, move: 'Acid' },
            { level: 10, move: 'Knock Off' },
            { level: 14, move: 'Sweet Scent' },
            { level: 14, move: 'Gastro Acid' },
            { level: 18, move: 'Razor Leaf' },
            { level: 18, move: 'Poison Jab' },
            { level: 18, move: 'Slam' },
            { level: 18, move: 'Wring Out' }
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fire', 'ice', 'flying', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['water', 'electric', 'fighting', 'fairy'],
        doubleResistances: ['grass'],
        immunities: []
    },
    // 70
    'Weepinbell': {
        hp: 50, ac: 13, str: 13, dex: 14, con: 15, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'grass', type2: 'poison', size: 'Small', sr: 5, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/weepinbell.png',
        learnset: [
            { level: 1, move: 'Growth' },
            { level: 1, move: 'Vine Whip' },
            { level: 1, move: 'Wrap' },
            { level: 6, move: 'Sleep Powder' },
            { level: 6, move: 'Poison Powder' },
            { level: 6, move: 'Stun Spore' },
            { level: 10, move: 'Acid' },
            { level: 14, move: 'Knock Off' },
            { level: 14, move: 'Sweet Scent' },
            { level: 18, move: 'Gastro Acid' },
            { level: 18, move: 'Razor Leaf' },
            { level: 18, move: 'Poison Jab' },
            { level: 18, move: 'Slam' },
            { level: 18, move: 'Wring Out' }
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fire', 'ice', 'flying', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['water', 'electric', 'fighting', 'fairy'],
        doubleResistances: ['grass'],
        immunities: []
    },
    // 71
    'Victreebel': {
        hp: 122, ac: 14, str: 16, dex: 16, con: 18, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'grass', type2: 'poison', size: 'Large', sr: 12, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/victreebel.png',
        learnset: [
            { level: 1, move: 'Leaf Tornado' },
            { level: 1, move: 'Razor Leaf' },
            { level: 1, move: 'Sleep Powder' },
            { level: 1, move: 'Spit Up' },
            { level: 1, move: 'Stockpile' },
            { level: 1, move: 'Swallow' },
            { level: 1, move: 'Sweet Scent' },
            { level: 1, move: 'Vine Whip' },
            { level: 14, move: 'Leaf Storm' },
            { level: 18, move: 'Leaf Blade' }
        ],
        features: [
            {
                name: "Chlorophyll",
                description: "This Pokémon's speed is doubled in harsh sunlight."
            },
            {
                name: "Gluttony (Hidden)",
                description: "This Pokémon must eat its held berry when it falls below ½ of its maximum HP."
            }
        ],
        skillProficiencies: ['nature', 'survival'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fire', 'ice', 'flying', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['water', 'electric', 'fighting', 'fairy'],
        doubleResistances: ['grass'],
        immunities: []
    },
    // 72
    'Tentacool': {
        hp: 18, ac: 14, str: 14, dex: 14, con: 14, int: 6, wis: 10, cha: 8,
        speed: 5, type1: 'water', type2: 'poison', size: 'Small', sr: 2, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/tentacool.png',
        learnset: [
            { level: 1, move: 'Poison Sting' },
            { level: 2, move: 'Supersonic' },
            { level: 2, move: 'Constrict' },
            { level: 2, move: 'Acid' },
            { level: 6, move: 'Toxic Spikes' },
            { level: 6, move: 'Water Pulse' },
            { level: 6, move: 'Wrap' },
            { level: 10, move: 'Acid Spray' },
            { level: 10, move: 'Bubble Beam' },
            { level: 14, move: 'Barrier' },
            { level: 14, move: 'Poison Jab' },
            { level: 14, move: 'Brine' },
            { level: 18, move: 'Screech' },
            { level: 18, move: 'Hex' },
            { level: 18, move: 'Sludge Wave' },
            { level: 18, move: 'Hydro Pump' },
            { level: 18, move: 'Wring Out' }
        ],
        features: [
            {
                name: "Clear Body",
                description: "Other Pokémon's moves or abilities cannot lower this Pokémon's stats."
            },
            {
                name: "Liquid Ooze",
                description: "If an enemy uses a leeching or absorb move against this Pokémon, the Pokémon must make a DC 12 CON save or become poisoned."
            },
            {
                name: "Rain Dish (Hidden)",
                description: "In rainy conditions, this Pokémon heals for an amount of HP equal to its proficiency bonus at the end of each of its turns."
            }
        ],
        skillProficiencies: ['sleight-of-hand'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['electric', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel', 'fighting', 'poison', 'bug', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 73
    'Tentacruel': {
        hp: 50, ac: 17, str: 17, dex: 18, con: 15, int: 6, wis: 10, cha: 8,
        speed: 20, type1: 'water', type2: 'poison', size: 'Medium', sr: 8, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/tentacruel.png',
        learnset: [
            { level: 1, move: 'Acid' },
            { level: 1, move: 'Constrict' },
            { level: 1, move: 'Poison Sting' },
            { level: 1, move: 'Reflect Type' },
            { level: 1, move: 'Supersonic' },
            { level: 6, move: 'Toxic Spikes' },
            { level: 6, move: 'Water Pulse' },
            { level: 6, move: 'Wrap' },
            { level: 10, move: 'Acid Spray' },
            { level: 10, move: 'Bubble Beam' },
            { level: 14, move: 'Barrier' },
            { level: 14, move: 'Poison Jab' },
            { level: 18, move: 'Brine' },
            { level: 18, move: 'Screech' },
            { level: 18, move: 'Hex' },
            { level: 18, move: 'Sludge Wave' },
            { level: 18, move: 'Hydro Pump' },
            { level: 18, move: 'Wring Out' }
        ],
        features: [
            {
                name: "Clear Body",
                description: "Other Pokémon's moves or abilities cannot lower this Pokémon's stats."
            },
            {
                name: "Liquid Ooze",
                description: "If an enemy uses a leeching or absorb move against this Pokémon, the Pokémon must make a DC 12 CON save or become poisoned."
            },
            {
                name: "Rain Dish (Hidden)",
                description: "In rainy conditions, this Pokémon heals for an amount of HP equal to its proficiency bonus at the end of each of its turns."
            }
        ],
        skillProficiencies: ['sleight-of-hand'],
        saveProficiencies: ['constitution', 'strength'],
        vulnerabilities: ['electric', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel', 'fighting', 'poison', 'bug', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 74
    'Geodude': { 
        hp: 18, ac: 13, str: 14, dex: 9, con: 14, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'rock', type2: 'ground', size: 'Tiny', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/geodude.png',
        learnset: [
            { level: 1, move: 'Defense Curl' },
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Mud Sport' },
            { level: 2, move: 'Rock Polish' },
            { level: 2, move: 'Rollout' },
            { level: 6, move: 'Magnitude' },
            { level: 6, move: 'Rock Throw' },
            { level: 6, move: 'Smack Down' },
            { level: 10, move: 'Bulldoze' },
            { level: 10, move: 'Self-Destruct' },
            { level: 14, move: 'Stealth Rock' },
            { level: 14, move: 'Rock Blast' },
            { level: 14, move: 'Earthquake' },
            { level: 18, move: 'Explosion' },
            { level: 18, move: 'Double-Edge' },
            { level: 18, move: 'Stone Edge' }
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['water', 'ice', 'fighting', 'ground', 'steel'],
        doubleVulnerabilities: ['grass', 'water'],
        resistances: ['normal', 'fire', 'poison', 'flying', 'rock'],
        doubleResistances: [],
        immunities: ['electric']
    },
    // 75
    'Graveler': { 
        hp: 55, ac: 15, str: 16, dex: 10, con: 16, int: 6, wis: 12, cha: 10,
        speed: 25, type1: 'rock', type2: 'ground', size: 'Medium', sr: 6, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/graveler.png',
        learnset: [
            { level: 1, move: 'Defense Curl' },
            { level: 1, move: 'Mud Sport' },
            { level: 1, move: 'Rock Polish' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Rollout' },
            { level: 6, move: 'Magnitude' },
            { level: 6, move: 'Rock Throw' },
            { level: 6, move: 'Smack Down' },
            { level: 10, move: 'Bulldoze' },
            { level: 10, move: 'Self-Destruct' },
            { level: 14, move: 'Stealth Rock' },
            { level: 14, move: 'Rock Blast' },
            { level: 14, move: 'Earthquake' },
            { level: 18, move: 'Explosion' },
            { level: 18, move: 'Double-Edge' },
            { level: 18, move: 'Stone Edge' }
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
        saveProficiencies: ['constitution', 'strength'],
        vulnerabilities: ['water', 'ice', 'fighting', 'ground', 'steel'],
        doubleVulnerabilities: ['grass', 'water'],
        resistances: ['normal', 'fire', 'poison', 'flying', 'rock'],
        doubleResistances: [],
        immunities: ['electric']
    },
    // 76
    'Golem': {
        hp: 117, ac: 16, str: 19, dex: 13, con: 18, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'rock', type2: 'ground', size: 'Medium', sr: 13, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/golem.png',
        learnset: [
            { level: 1, move: 'Defense Curl' },
            { level: 1, move: 'Mud Sport' },
            { level: 1, move: 'Rock Polish' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Steamroller' },
            { level: 1, move: 'Magnitude' },
            { level: 1, move: 'Rock Throw' },
            { level: 1, move: 'Smack Down' },
            { level: 1, move: 'Bulldoze' },
            { level: 1, move: 'Self-Destruct' },
            { level: 14, move: 'Stealth Rock' },
            { level: 14, move: 'Rock Blast' },
            { level: 14, move: 'Earthquake' },
            { level: 18, move: 'Explosion' },
            { level: 18, move: 'Double-Edge' },
            { level: 18, move: 'Stone Edge' },
            { level: 18, move: 'Heavy Slam' }
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
        saveProficiencies: ['constitution', 'strength'],
        vulnerabilities: ['water', 'ice', 'fighting', 'ground', 'steel'],
        doubleVulnerabilities: ['grass', 'water'],
        resistances: ['normal', 'fire', 'poison', 'flying', 'rock'],
        doubleResistances: [],
        immunities: ['electric']
    },
    // 77
    'Ponyta': { 
        hp: 18, ac: 14, str: 12, dex: 15, con: 10, int: 6, wis: 10, cha: 10,
        speed: 30, type1: 'fire', type2: '', size: 'Small', sr: .5, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/ponyta.png',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Tail Whip' },
            { level: 2, move: 'Ember' },
            { level: 6, move: 'Flame Wheel' },
            { level: 6, move: 'Stomp' },
            { level: 10, move: 'Flame Charge' },
            { level: 10, move: 'Fire Spin' },
            { level: 14, move: 'Take Down' },
            { level: 14, move: 'Inferno' },
            { level: 14, move: 'Agility' },
            { level: 18, move: 'Fire Blast' },
            { level: 18, move: 'Bounce' },
            { level: 18, move: 'Flare Blitz' }
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
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['water', 'ground', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 78
    'Rapidash': { 
        hp: 98, ac: 16, str: 16, dex: 18, con: 14, int: 6, wis: 12, cha: 12,
        speed: 40, type1: 'fire', type2: '', size: 'Large', sr: 11, hitDie: 'd10',
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
            { level: 1, move: 'Fire Spin' },
            { level: 14, move: 'Take Down' },
            { level: 14, move: 'Inferno' },
            { level: 14, move: 'Agility' },
            { level: 18, move: 'Fire Blast' },
            { level: 18, move: 'Bounce' },
            { level: 18, move: 'Flare Blitz' }
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
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['water', 'ground', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 79
    'Slowpoke': { 
        hp: 20, ac: 12, str: 12, dex: 8, con: 14, int: 6, wis: 12, cha: 10,
        speed: 15, type1: 'water', type2: 'psychic', size: 'Medium', sr: .5, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/slowpoke.png',
        learnset: [
            { level: 1, move: 'Curse' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Yawn' },
            { level: 2, move: 'Growl' },
            { level: 2, move: 'Water Gun' },
            { level: 6, move: 'Confusion' },
            { level: 6, move: 'Disable' },
            { level: 10, move: 'Headbutt' },
            { level: 14, move: 'Water Pulse' },
            { level: 14, move: 'Zen Headbutt' },
            { level: 14, move: 'Slack Off' },
            { level: 14, move: 'Amnesia' },
            { level: 18, move: 'Psychic' },
            { level: 18, move: 'Rain Dance' },
            { level: 18, move: 'Psych Up' },
            { level: 18, move: 'Heal Pulse' }
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
        saveProficiencies: ['constitution', 'wisdom'],
        vulnerabilities: ['electric', 'grass', 'bug', 'ghost', 'dark'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel', 'fighting', 'psychic'],
        doubleResistances: [],
        immunities: []
    },
    // 80
    'Slowbro': { 
        hp: 97, ac: 16, str: 16, dex: 12, con: 18, int: 6, wis: 16, cha: 10,
        speed: 20, type1: 'water', type2: 'psychic', size: 'Medium', sr: 11, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/slowbro.png',
        learnset: [
            { level: 1, move: 'Curse' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Withdraw' },
            { level: 1, move: 'Yawn' },
            { level: 1, move: 'Water Gun' },
            { level: 1, move: 'Confusion' },
            { level: 1, move: 'Disable' },
            { level: 10, move: 'Headbutt' },
            { level: 14, move: 'Water Pulse' },
            { level: 14, move: 'Zen Headbutt' },
            { level: 14, move: 'Slack Off' },
            { level: 18, move: 'Amnesia' },
            { level: 18, move: 'Psychic' },
            { level: 18, move: 'Rain Dance' },
            { level: 18, move: 'Psych Up' },
            { level: 18, move: 'Heal Pulse' }
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
        saveProficiencies: ['constitution', 'wisdom'],
        vulnerabilities: ['electric', 'grass', 'bug', 'ghost', 'dark'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel', 'fighting', 'psychic'],
        doubleResistances: [],
        immunities: []
    },
    // 81
    'Magnemite': { 
        hp: 18, ac: 14, str: 10, dex: 12, con: 14, int: 8, wis: 10, cha: 8,
        speed: 20, type1: 'electric', type2: 'steel', size: 'Tiny', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/magnemite.png',
        learnset: [
            { level: 1, move: 'Supersonic' },
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Thunder Shock' },
            { level: 2, move: 'Magnet Bomb' },
            { level: 2, move: 'Thunder Wave' },
            { level: 6, move: 'Light Screen' },
            { level: 6, move: 'Sonic Boom' },
            { level: 6, move: 'Spark' },
            { level: 10, move: 'Mirror Shot' },
            { level: 10, move: 'Metal Sound' },
            { level: 14, move: 'Electro Ball' },
            { level: 14, move: 'Flash Cannon' },
            { level: 14, move: 'Screech' },
            { level: 14, move: 'Discharge' },
            { level: 18, move: 'Lock-On' },
            { level: 18, move: 'Magnet Rise' },
            { level: 18, move: 'Gyro Ball' },
            { level: 18, move: 'Zap Cannon' }
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fire', 'fighting'],
        doubleVulnerabilities: ['ground'],
        resistances: ['normal', 'electric', 'grass', 'ice', 'psychic', 'bug', 'rock', 'dragon', 'fairy'],
        doubleResistances: ['flying', 'steel'],
        immunities: ['poison']
    },
    // 82
    'Magneton': {
        hp: 55, ac: 16, str: 13, dex: 15, con: 17, int: 8, wis: 12, cha: 8,
        speed: 30, type1: 'electric', type2: 'steel', size: 'Small', sr: 8, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/magneton.png',
        learnset: [
            { level: 1, move: 'Magnet Bomb' },
            { level: 1, move: 'Supersonic' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Thunder Shock' },
            { level: 1, move: 'Tri-Attack' },
            { level: 1, move: 'Thunder Wave' },
            { level: 1, move: 'Electric Terrain' },
            { level: 6, move: 'Light Screen' },
            { level: 6, move: 'Sonic Boom' },
            { level: 10, move: 'Spark' },
            { level: 10, move: 'Mirror Shot' },
            { level: 10, move: 'Metal Sound' },
            { level: 14, move: 'Electro Ball' },
            { level: 14, move: 'Flash Cannon' },
            { level: 14, move: 'Screech' },
            { level: 18, move: 'Discharge' },
            { level: 18, move: 'Lock-On' },
            { level: 18, move: 'Magnet Rise' },
            { level: 18, move: 'Gyro Ball' },
            { level: 18, move: 'Zap Cannon' }
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
        skillProficiencies: ['acrobatics', 'insight'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fire', 'fighting'],
        doubleVulnerabilities: ['ground'],
        resistances: ['normal', 'electric', 'grass', 'ice', 'psychic', 'bug', 'rock', 'dragon', 'fairy'],
        doubleResistances: ['flying', 'steel'],
        immunities: ['poison']
    },
    // 83
    "Farfetch'd": {
        hp: 25, ac: 14, str: 14, dex: 14, con: 12, int: 6, wis: 12, cha: 10,
        speed: 25, type1: 'normal', type2: 'flying', size: 'Tiny', sr: 3, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/farfetchd.png',
        learnset: [
            { level: 1, move: 'Fury Cutter' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Poison Jab' },
            { level: 1, move: 'Sand Attack' },
            { level: 2, move: 'Fury Attack' },
            { level: 2, move: 'Aerial Ace' },
            { level: 6, move: 'Knock Off' },
            { level: 6, move: 'Slash' },
            { level: 10, move: 'Air Cutter' },
            { level: 10, move: 'Swords Dance' },
            { level: 14, move: 'Agility' },
            { level: 14, move: 'Night Slash' },
            { level: 18, move: 'Acrobatics' },
            { level: 18, move: 'Feint' },
            { level: 18, move: 'False Swipe' },
            { level: 18, move: 'Air Slash' },
            { level: 18, move: 'Brave Bird' }
        ],
        features: [
            {
                name: "Keen Eye",
                description: "This Pokémon ignores disadvantage when it relates to sight."
            },
            {
                name: "Inner Focus",
                description: "This Pokémon is immune to flinching."
            },
            {
                name: "Defiant (Hidden)",
                description: "While this Pokémon is suffering from a negative status effect or stat change imposed by an opponent, it gains +2 to all attack rolls."
            }
        ],
        skillProficiencies: ['perception', 'intimidation'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'ice', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'bug'],
        doubleResistances: [],
        immunities: ['ground', 'ghost']
    },
    // 84
    'Doduo': {
        hp: 17, ac: 12, str: 10, dex: 15, con: 12, int: 6, wis: 10, cha: 10,
        speed: 35, type1: 'normal', type2: 'flying', size: 'Small', sr: 0.25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/doduo.png',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Peck' },
            { level: 2, move: 'Quick Attack' },
            { level: 2, move: 'Rage' },
            { level: 6, move: 'Fury Attack' },
            { level: 6, move: 'Pursuit' },
            { level: 6, move: 'Pluck' },
            { level: 10, move: 'Double Hit' },
            { level: 10, move: 'Agility' },
            { level: 14, move: 'Uproar' },
            { level: 14, move: 'Acupressure' },
            { level: 14, move: 'Swords Dance' },
            { level: 14, move: 'Jump Kick' },
            { level: 18, move: 'Drill Peck' },
            { level: 18, move: 'Endeavor' },
            { level: 18, move: 'Thrash' }
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
        skillProficiencies: ['acrobatics', 'perception'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'ice', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'bug'],
        doubleResistances: [],
        immunities: ['ground', 'ghost']
    },
    // 85
    'Dodrio': {
        hp: 64, ac: 15, str: 16, dex: 19, con: 13, int: 6, wis: 12, cha: 10,
        speed: 40, type1: 'normal', type2: 'flying', size: 'Medium', sr: 9, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/dodrio.png',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Quick Attack' },
            { level: 1, move: 'Rage' },
            { level: 1, move: 'Tri-Attack' },
            { level: 1, move: 'Fury Attack' },
            { level: 1, move: 'Pursuit' },
            { level: 1, move: 'Pluck' },
            { level: 10, move: 'Double Hit' },
            { level: 10, move: 'Agility' },
            { level: 14, move: 'Uproar' },
            { level: 14, move: 'Acupressure' },
            { level: 14, move: 'Swords Dance' },
            { level: 18, move: 'Jump Kick' },
            { level: 18, move: 'Drill Peck' },
            { level: 18, move: 'Endeavor' },
            { level: 18, move: 'Thrash' }
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
        skillProficiencies: ['acrobatics', 'perception'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'ice', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'bug'],
        doubleResistances: [],
        immunities: ['ground', 'ghost']
    },
    // 86
    'Seel': {
        hp: 17, ac: 14, str: 13, dex: 11, con: 12, int: 6, wis: 10, cha: 10,
        speed: 10, type1: 'water', type2: '', size: 'Small', sr: 0.5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/seel.png',
        learnset: [
            { level: 1, move: 'Headbutt' },
            { level: 1, move: 'Growl' },
            { level: 2, move: 'Water Sport' },
            { level: 2, move: 'Icy Wind' },
            { level: 6, move: 'Encore' },
            { level: 6, move: 'Ice Shard' },
            { level: 6, move: 'Rest' },
            { level: 10, move: 'Aqua Ring' },
            { level: 10, move: 'Aurora Beam' },
            { level: 14, move: 'Aqua Jet' },
            { level: 14, move: 'Brine' },
            { level: 14, move: 'Take Down' },
            { level: 14, move: 'Dive' },
            { level: 18, move: 'Aqua Tail' },
            { level: 18, move: 'Ice Beam' },
            { level: 18, move: 'Safeguard' },
            { level: 18, move: 'Hail' },
            { level: 18, move: 'Snowscape' }
        ],
        features: [
            {
                name: "Thick Fat",
                description: "Half damage from Ice and Fire."
            },
            {
                name: "Hydration",
                description: "Unaffected by status ailments in water/rain."
            },
            {
                name: "Ice Body (Hidden)",
                description: "Heals HP during snow/hail."
            }
        ],
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 87
    'Dewgong': {
        hp: 72, ac: 16, str: 17, dex: 16, con: 14, int: 6, wis: 12, cha: 12,
        speed: 15, type1: 'water', type2: 'ice', size: 'Large', sr: 10, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/dewgong.png',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Headbutt' },
            { level: 1, move: 'Icy Wind' },
            { level: 1, move: 'Sheer Cold' },
            { level: 1, move: 'Signal Beam' },
            { level: 1, move: 'Encore' },
            { level: 1, move: 'Ice Shard' },
            { level: 10, move: 'Rest' },
            { level: 10, move: 'Aqua Ring' },
            { level: 10, move: 'Aurora Beam' },
            { level: 14, move: 'Aqua Jet' },
            { level: 14, move: 'Brine' },
            { level: 14, move: 'Take Down' },
            { level: 14, move: 'Dive' },
            { level: 18, move: 'Aqua Tail' },
            { level: 18, move: 'Ice Beam' },
            { level: 18, move: 'Safeguard' },
            { level: 18, move: 'Hail' },
            { level: 18, move: 'Snowscape' }
        ],
        features: [
            {
                name: "Thick Fat",
                description: "Takes half damage from Ice and Fire damage."
            },
            {
                name: "Hydration",
                description: "Unaffected by negative status ailments in water or during rainy conditions."
            },
            {
                name: "Ice Body (Hidden)",
                description: "Heals HP equal to proficiency modifier while snowing/hailing."
            }
        ],
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'grass', 'fighting', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['water'],
        doubleResistances: ['ice'],
        immunities: []
    },
    // 88
    'Grimer': {
        hp: 19, ac: 12, str: 14, dex: 9, con: 16, int: 6, wis: 10, cha: 8,
        speed: 15, type1: 'poison', type2: '', size: 'Small', sr: 0.5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/grimer.png',
        learnset: [
            { level: 1, move: 'Poison Gas' },
            { level: 1, move: 'Pound' },
            { level: 2, move: 'Harden' },
            { level: 2, move: 'Mud-Slap' },
            { level: 6, move: 'Disable' },
            { level: 6, move: 'Sludge' },
            { level: 6, move: 'Mud-Bomb' },
            { level: 10, move: 'Minimize' },
            { level: 10, move: 'Fling' },
            { level: 14, move: 'Sludge Bomb' },
            { level: 14, move: 'Sludge Wave' },
            { level: 14, move: 'Screech' },
            { level: 18, move: 'Gunk Shot' },
            { level: 18, move: 'Acid Armor' },
            { level: 18, move: 'Memento' },
            { level: 18, move: 'Belch' }
        ],
        features: [
            {
                name: "Stench",
                description: "When this Pokémon is hit by a melee attack, roll a d10. On a 10, the attacker flinches."
            },
            {
                name: "Sticky Hold",
                description: "Held items cannot be stolen or knocked away from this Pokémon."
            },
            {
                name: "Poison Touch (Hidden)",
                description: "On melee attacks made by this Pokémon, roll a d10 on a hit. On a result of a 10, the target is poisoned."
            }
        ],
        skillProficiencies: ['stealth'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 89
    'Muk': {
        hp: 80, ac: 16, str: 17, dex: 13, con: 20, int: 6, wis: 12, cha: 8,
        speed: 20, type1: 'poison', type2: '', size: 'Medium', sr: 10, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/muk.png',
        learnset: [
            { level: 1, move: 'Harden' },
            { level: 1, move: 'Mud-Slap' },
            { level: 1, move: 'Poison Gas' },
            { level: 1, move: 'Pound' },
            { level: 1, move: 'Disable' },
            { level: 1, move: 'Sludge' },
            { level: 1, move: 'Mud-Bomb' },
            { level: 1, move: 'Venom Drench' },
            { level: 10, move: 'Minimize' },
            { level: 10, move: 'Fling' },
            { level: 14, move: 'Sludge Bomb' },
            { level: 14, move: 'Sludge Wave' },
            { level: 14, move: 'Screech' },
            { level: 18, move: 'Gunk Shot' },
            { level: 18, move: 'Acid Armor' },
            { level: 18, move: 'Memento' },
            { level: 18, move: 'Belch' }
        ],
        features: [
            {
                name: "Stench",
                description: "When this Pokémon is hit by a melee attack, roll a d10. On a 10, the attacker flinches."
            },
            {
                name: "Sticky Hold",
                description: "Held items cannot be stolen or knocked away from this Pokémon."
            },
            {
                name: "Poison Touch (Hidden)",
                description: "On melee attacks made by this Pokémon, roll a d10 on a hit. On a result of a 10, the target is poisoned."
            }
        ],
        skillProficiencies: ['stealth'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
        doubleResistances: [],
        immunities: []
    },
    // 90
    'Shellder': {
        hp: 18, ac: 14, str: 12, dex: 10, con: 14, int: 6, wis: 10, cha: 10,
        speed: 5, type1: 'water', type2: '', size: 'Tiny', sr: 0.5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/shellder.png',
        learnset: [
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Water Gun' },
            { level: 2, move: 'Withdraw' },
            { level: 2, move: 'Supersonic' },
            { level: 6, move: 'Icicle Spear' },
            { level: 6, move: 'Protect' },
            { level: 10, move: 'Leer' },
            { level: 10, move: 'Clamp' },
            { level: 14, move: 'Ice Shard' },
            { level: 14, move: 'Razor Shell' },
            { level: 14, move: 'Aurora Beam' },
            { level: 14, move: 'Whirlpool' },
            { level: 18, move: 'Brine' },
            { level: 18, move: 'Iron Defense' },
            { level: 18, move: 'Ice Beam' },
            { level: 18, move: 'Shell Smash' },
            { level: 18, move: 'Hydro Pump' }
        ],
        features: [
            {
                name: "Shell Armor",
                description: "This Pokémon is immune to extra damage dealt by a Critical Hit."
            },
            {
                name: "Skill Link",
                description: "Combo moves that have the ability to hit more than once are guaranteed to hit at least twice."
            },
            {
                name: "Overcoat (Hidden)",
                description: "This Pokémon does not take damage from weather-related moves."
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
    // 91
    'Cloyster': {
        hp: 55, ac: 18, str: 15, dex: 12, con: 16, int: 6, wis: 12, cha: 10,
        speed: 5, type1: 'water', type2: 'ice', size: 'Medium', sr: 8, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/cloyster.png',
        learnset: [
            { level: 1, move: 'Aurora Beam' },
            { level: 1, move: 'Hydro Pump' },
            { level: 1, move: 'Protect' },
            { level: 1, move: 'Shell Smash' },
            { level: 1, move: 'Supersonic' },
            { level: 1, move: 'Toxic Spikes' },
            { level: 1, move: 'Withdraw' },
            { level: 6, move: 'Spike Cannon' },
            { level: 14, move: 'Spikes' },
            { level: 18, move: 'Icicle Crash' }
        ],
        features: [
            {
                name: "Shell Armor",
                description: "Immune to extra damage dealt by a Critical Hit."
            },
            {
                name: "Skill Link",
                description: "Combo moves guaranteed to hit at least twice."
            },
            {
                name: "Overcoat (Hidden)",
                description: "Does not take damage from weather-related moves."
            }
        ],
        skillProficiencies: ['survival'],
        saveProficiencies: ['constitution', 'strength'],
        vulnerabilities: ['electric', 'grass', 'fighting', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['water'],
        doubleResistances: ['ice'],
        immunities: []
    },
    // 92
    'Gastly': {
        hp: 16, ac: 12, str: 9, dex: 13, con: 11, int: 6, wis: 14, cha: 10,
        speed: 25, type1: 'ghost', type2: 'poison', size: 'Small', sr: 0.5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/gastly.png',
        learnset: [
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Lick' },
            { level: 2, move: 'Spite' },
            { level: 2, move: 'Mean Look' },
            { level: 6, move: 'Curse' },
            { level: 6, move: 'Night Shade' },
            { level: 10, move: 'Confuse Ray' },
            { level: 10, move: 'Sucker Punch' },
            { level: 10, move: 'Payback' },
            { level: 14, move: 'Shadow Ball' },
            { level: 14, move: 'Dream Eater' },
            { level: 18, move: 'Dark Pulse' },
            { level: 18, move: 'Destiny Bond' },
            { level: 18, move: 'Hex' },
            { level: 18, move: 'Nightmare' }
        ],
        features: [
            {
                name: "Levitate",
                description: "This Pokémon is immune to ground moves."
            }
        ],
        skillProficiencies: ['stealth', 'deception'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['psychic', 'ghost', 'dark'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fairy'],
        doubleResistances: ['poison', 'bug'],
        immunities: ['normal', 'fighting', 'ground']
    },
    // 93
    'Haunter': {
        hp: 45, ac: 14, str: 12, dex: 15, con: 13, int: 6, wis: 15, cha: 10,
        speed: 30, type1: 'ghost', type2: 'poison', size: 'Medium', sr: 5, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/haunter.png',
        learnset: [
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Lick' },
            { level: 1, move: 'Shadow Punch' },
            { level: 1, move: 'Spite' },
            { level: 1, move: 'Mean Look' },
            { level: 6, move: 'Curse' },
            { level: 6, move: 'Night Shade' },
            { level: 10, move: 'Confuse Ray' },
            { level: 10, move: 'Sucker Punch' },
            { level: 14, move: 'Payback' },
            { level: 14, move: 'Shadow Ball' },
            { level: 18, move: 'Dream Eater' },
            { level: 18, move: 'Dark Pulse' },
            { level: 18, move: 'Destiny Bond' },
            { level: 18, move: 'Hex' },
            { level: 18, move: 'Nightmare' }
        ],
        features: [
            {
                name: "Levitate",
                description: "This Pokémon is immune to ground moves."
            }
        ],
        skillProficiencies: ['stealth', 'deception'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['psychic', 'ghost', 'dark'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fairy'],
        doubleResistances: ['poison', 'bug'],
        immunities: ['normal', 'fighting', 'ground']
    },
    // 94
    'Gengar': {
        hp: 102, ac: 15, str: 14, dex: 18, con: 14, int: 8, wis: 16, cha: 10,
        speed: 35, type1: 'ghost', type2: 'poison', size: 'Medium', sr: 12, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/gengar.png',
        learnset: [
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Lick' },
            { level: 1, move: 'Shadow Punch' },
            { level: 1, move: 'Spite' },
            { level: 1, move: 'Mean Look' },
            { level: 1, move: 'Curse' },
            { level: 1, move: 'Night Shade' },
            { level: 1, move: 'Confuse Ray' },
            { level: 1, move: 'Sucker Punch' },
            { level: 14, move: 'Payback' },
            { level: 14, move: 'Shadow Ball' },
            { level: 18, move: 'Payback' },
            { level: 18, move: 'Dream Eater' },
            { level: 18, move: 'Dark Pulse' },
            { level: 18, move: 'Destiny Bond' },
            { level: 18, move: 'Hex' },
            { level: 18, move: 'Nightmare' }
        ],
        features: [
            {
                name: "Cursed Body",
                description: "When hit by a melee attack, this Pokémon may roll 1d4. On a result of 4, the opponent who made the attack cannot use the same move on its next turn."
            }
        ],
        skillProficiencies: ['stealth', 'deception'],
        saveProficiencies: ['constitution', 'charisma'],
        vulnerabilities: ['psychic', 'ghost', 'dark'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fairy'],
        doubleResistances: ['poison', 'bug'],
        immunities: ['normal', 'fighting']
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
            { level: 6, move: 'Rock Polish' },
            { level: 10, move: 'Gyro Ball' },
            { level: 10, move: 'Smack Down' },
            { level: 10, move: 'Dragon Breath' },
            { level: 10, move: 'Slam' },
            { level: 14, move: 'Screech' },
            { level: 14, move: 'Rock Slide' },
            { level: 14, move: 'Sand Tomb' },
            { level: 14, move: 'Iron Tail' },
            { level: 18, move: 'Dig' },
            { level: 18, move: 'Stone Edge' },
            { level: 18, move: 'Double-Edge' },
            { level: 18, move: 'Sandstorm' }
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
        saveProficiencies: ['constitution', 'strength'],
        vulnerabilities: ['fighting', 'ground', 'steel', 'ice'],
        doubleVulnerabilities: ['water', 'grass'],
        resistances: ['normal', 'fire', 'flying', 'rock'],
        doubleResistances: ['poison'],
        immunities: ['electric']
    },
    // 96
    'Drowzee': {
        hp: 17, ac: 14, str: 13, dex: 10, con: 12, int: 6, wis: 14, cha: 8,
        speed: 25, type1: 'psychic', type2: '', size: 'Small', sr: 0.5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/drowzee.png',
        learnset: [
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Pound' },
            { level: 2, move: 'Disable' },
            { level: 2, move: 'Confusion' },
            { level: 6, move: 'Headbutt' },
            { level: 6, move: 'Poison Gas' },
            { level: 10, move: 'Meditate' },
            { level: 10, move: 'Psybeam' },
            { level: 14, move: 'Psych Up' },
            { level: 18, move: 'Synchronoise' },
            { level: 18, move: 'Zen Headbutt' },
            { level: 18, move: 'Swagger' },
            { level: 18, move: 'Psychic' },
            { level: 18, move: 'Nasty Plot' },
            { level: 18, move: 'Psyshock' },
            { level: 18, move: 'Future Sight' }
        ],
        features: [
            {
                name: "Insomnia",
                description: "This Pokémon is immune to sleep."
            },
            {
                name: "Forewarn",
                description: "When this Pokémon enters battle, it selects a target to reveal the move it knows with the most damage output."
            },
            {
                name: "Inner Focus (Hidden)",
                description: "This Pokémon is immune to flinching."
            }
        ],
        skillProficiencies: ['insight', 'persuasion'],
        saveProficiencies: ['wisdom'],
        vulnerabilities: ['bug', 'ghost', 'dark'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'psychic'],
        doubleResistances: [],
        immunities: []
    },
    // 97
    'Hypno': {
        hp: 45, ac: 16, str: 14, dex: 15, con: 13, int: 8, wis: 16, cha: 8,
        speed: 30, type1: 'psychic', type2: '', size: 'Medium', sr: 8, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/hypno.png',
        learnset: [
            { level: 1, move: 'Confusion' },
            { level: 1, move: 'Disable' },
            { level: 1, move: 'Future Sight' },
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Nasty Plot' },
            { level: 1, move: 'Nightmare' },
            { level: 1, move: 'Pound' },
            { level: 1, move: 'Switcheroo' },
            { level: 6, move: 'Headbutt' },
            { level: 6, move: 'Poison Gas' },
            { level: 10, move: 'Meditate' },
            { level: 10, move: 'Psybeam' },
            { level: 14, move: 'Psych Up' },
            { level: 18, move: 'Synchronoise' },
            { level: 18, move: 'Zen Headbutt' },
            { level: 18, move: 'Swagger' },
            { level: 18, move: 'Psychic' },
            { level: 18, move: 'Psyshock' }
        ],
        features: [
            {
                name: "Insomnia",
                description: "This Pokémon is immune to sleep."
            },
            {
                name: "Forewarn",
                description: "When this Pokémon enters battle, it selects a target to reveal the move it knows with the most damage output."
            },
            {
                name: "Inner Focus (Hidden)",
                description: "This Pokémon is immune to flinching."
            }
        ],
        skillProficiencies: ['insight', 'persuasion'],
        saveProficiencies: ['charisma', 'wisdom'],
        vulnerabilities: ['bug', 'ghost', 'dark'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'psychic'],
        doubleResistances: [],
        immunities: []
    },
    // 98
    'Krabby': { 
        hp: 17, ac: 13, str: 14, dex: 12, con: 12, int: 6, wis: 10, cha: 8,
        speed: 30, type1: 'water', type2: '', size: 'Small', sr: .25,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/krabby.png',
        learnset: [
            { level: 1, move: 'Bubble' },
            { level: 1, move: 'Mud Sport' },
            { level: 2, move: 'Vice Grip' },
            { level: 2, move: 'Leer' },
            { level: 2, move: 'Harden' },
            { level: 6, move: 'Bubble Beam' },
            { level: 6, move: 'Mud Shot' },
            { level: 10, move: 'Metal Claw' },
            { level: 10, move: 'Stomp' },
            { level: 14, move: 'Protect' },
            { level: 14, move: 'Guillotine' },
            { level: 14, move: 'Slam' },
            { level: 18, move: 'Brine' },
            { level: 18, move: 'Crabhammer' },
            { level: 18, move: 'Flail' }
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
        skillProficiencies: ['sleight of hand', 'survival'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 99
    'Kingler': { 
        hp: 50, ac: 16, str: 17, dex: 15, con: 15, int: 6, wis: 12, cha: 8,
        speed: 30, type1: 'water', type2: '', size: 'Medium', sr: 8, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/kingler.png',
        learnset: [
            { level: 1, move: 'Bubble' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Mud Sport' },
            { level: 1, move: 'Vice Grip' },
            { level: 1, move: 'Wide Guard' },
            { level: 1, move: 'Harden' },
            { level: 6, move: 'Bubble Beam' },
            { level: 6, move: 'Mud Shot' },
            { level: 10, move: 'Metal Claw' },
            { level: 10, move: 'Stomp' },
            { level: 14, move: 'Protect' },
            { level: 14, move: 'Slam' },
            { level: 18, move: 'Guillotine' },
            { level: 18, move: 'Brine' },
            { level: 18, move: 'Crabhammer' },
            { level: 18, move: 'Flail' }
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
        skillProficiencies: ['sleight of hand', 'survival'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'water', 'ice', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 100
    'Voltorb': { 
        hp: 17, ac: 14, str: 12, dex: 14, con: 12, int: 6, wis: 10, cha: 8,
        speed: 25, type1: 'electric', type2: '', size: 'Tiny', sr: 0.5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/voltorb.png',
        learnset: [
            { level: 1, move: 'Charge' },
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Sonic Boom' },
            { level: 2, move: 'Spark' },
            { level: 2, move: 'Eerie Impulse' },
            { level: 6, move: 'Rollout' },
            { level: 6, move: 'Screech' },
            { level: 6, move: 'Charge Beam' },
            { level: 10, move: 'Swift' },
            { level: 10, move: 'Electro Ball' },
            { level: 10, move: 'Self-Destruct' },
            { level: 14, move: 'Light Screen' },
            { level: 14, move: 'Magnet Rise' },
            { level: 18, move: 'Discharge' },
            { level: 18, move: 'Explosion' },
            { level: 18, move: 'Gyro Ball' },
            { level: 18, move: 'Mirror Coat' }
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground'],
        doubleVulnerabilities: [],
        resistances: ['electric', 'flying', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 101
    'Electrode': {
        hp: 50, ac: 17, str: 14, dex: 17, con: 15, int: 6, wis: 12, cha: 8,
        speed: 40, type1: 'electric', type2: '', size: 'Small', sr: 8, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/electrode.png',
        learnset: [
            { level: 1, move: 'Charge' },
            { level: 1, move: 'Sonic Boom' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Spark' },
            { level: 1, move: 'Eerie Impulse' },
            { level: 1, move: 'Magnetic Flux' },
            { level: 6, move: 'Rollout' },
            { level: 6, move: 'Screech' },
            { level: 6, move: 'Charge Beam' },
            { level: 10, move: 'Swift' },
            { level: 10, move: 'Electro Ball' },
            { level: 10, move: 'Self-Destruct' },
            { level: 14, move: 'Light Screen' },
            { level: 18, move: 'Magnet Rise' },
            { level: 18, move: 'Discharge' },
            { level: 18, move: 'Explosion' },
            { level: 18, move: 'Gyro Ball' },
            { level: 18, move: 'Mirror Coat' }
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground'],
        doubleVulnerabilities: [],
        resistances: ['electric', 'flying', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 102
    'Exeggcute': {
        hp: 19, ac: 14, str: 13, dex: 12, con: 12, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'grass', type2: 'psychic', size: 'Tiny', sr: 0.5, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/exeggcute.png',
        learnset: [
            { level: 1, move: 'Barrage' },
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Uproar' },
            { level: 2, move: 'Reflect' },
            { level: 2, move: 'Leech Seed' },
            { level: 6, move: 'Bullet Seed' },
            { level: 6, move: 'Stun Spore' },
            { level: 10, move: 'Poison Powder' },
            { level: 10, move: 'Sleep Powder' },
            { level: 14, move: 'Confusion' },
            { level: 14, move: 'Worry Seed' },
            { level: 18, move: 'Natural Gift' },
            { level: 18, move: 'Solar Beam' },
            { level: 18, move: 'Extrasensory' },
            { level: 18, move: 'Bestow' }
        ],
        features: [
            {
                name: "Chlorophyll",
                description: "This Pokémon's speed is doubled in harsh sunlight."
            },
            {
                name: "Harvest (Hidden)",
                description: "At the end of this Pokémon's turn, if it used a berry, roll 1d4. On a result of 3 or 4, it regains that berry as a held item."
            }
        ],
        skillProficiencies: ['nature'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['fire', 'ice', 'poison', 'flying', 'ghost', 'dark'],
        doubleVulnerabilities: ['bug'],
        resistances: ['fighting', 'water', 'electric', 'ground', 'grass', 'psychic'],
        doubleResistances: [],
        immunities: []
    },
    // 103
    'Exeggutor': {
        hp: 56, ac: 15, str: 16, dex: 14, con: 14, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'grass', type2: 'psychic', size: 'Large', sr: 8, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/exeggutor.png',
        learnset: [
            { level: 1, move: 'Barrage' },
            { level: 1, move: 'Confusion' },
            { level: 1, move: 'Hypnosis' },
            { level: 1, move: 'Seed Bomb' },
            { level: 1, move: 'Stomp' },
            { level: 6, move: 'Psyshock' },
            { level: 10, move: 'Egg Bomb' },
            { level: 18, move: 'Wood Hammer' },
            { level: 18, move: 'Leaf Storm' }
        ],
        features: [
            {
                name: "Chlorophyll",
                description: "This Pokémon's speed is doubled in harsh sunlight."
            },
            {
                name: "Harvest (Hidden)",
                description: "At the end of this Pokémon's turn, if it used a berry, roll 1d4. On a result of 3 or 4, it regains that berry as a held item."
            }
        ],
        skillProficiencies: ['nature'],
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['fire', 'ice', 'poison', 'flying', 'ghost', 'dark'],
        doubleVulnerabilities: ['bug'],
        resistances: ['fighting', 'water', 'electric', 'ground', 'grass', 'psychic'],
        doubleResistances: [],
        immunities: []
    },
    // 104
    'Cubone': { 
        hp: 17, ac: 14, str: 12, dex: 11, con: 12, int: 6, wis: 10, cha: 12,
        speed: 30, type1: 'ground', type2: '', size: 'Tiny', sr: 0.5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/cubone.png',
        learnset: [
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Tail Whip' },
            { level: 2, move: 'Bone Club' },
            { level: 2, move: 'Headbutt' },
            { level: 6, move: 'Leer' },
            { level: 6, move: 'Focus Energy' },
            { level: 10, move: 'Bonemerang' },
            { level: 10, move: 'Rage' },
            { level: 10, move: 'False Swipe' },
            { level: 14, move: 'Thrash' },
            { level: 14, move: 'Fling' },
            { level: 14, move: 'Stomping Tantrum' },
            { level: 18, move: 'Endeavor' },
            { level: 18, move: 'Double-Edge' },
            { level: 18, move: 'Retaliate' },
            { level: 18, move: 'Bone Rush' }
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['water', 'grass', 'ice'],
        doubleVulnerabilities: [],
        resistances: ['poison', 'rock'],
        doubleResistances: [],
        immunities: ['electric']
    },
    // 105
    'Marowak': {
        hp: 13, ac: 22, str: 16, dex: 9, con: 16, int: 10, wis: 16, cha: 12,
        speed: 25, type1: 'ground', type2: '', size: 'Medium', sr: 7, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/marowak.png',
        learnset: [
            { level: 1, move: 'Bone Club' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Headbutt' },
            { level: 1, move: 'Tail Whip' },
            { level: 6, move: 'Leer' },
            { level: 6, move: 'Focus Energy' },
            { level: 10, move: 'Bonemerang' },
            { level: 10, move: 'Rage' },
            { level: 14, move: 'False Swipe' },
            { level: 14, move: 'Thrash' },
            { level: 18, move: 'Stomping Tantrum' },
            { level: 18, move: 'Fling' },
            { level: 18, move: 'Endeavor' },
            { level: 18, move: 'Double-Edge' },
            { level: 18, move: 'Retaliate' },
            { level: 18, move: 'Bone Rush' }
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['water', 'grass', 'ice'],
        doubleVulnerabilities: [],
        resistances: ['poison', 'rock'],
        doubleResistances: [],
        immunities: ['electric']
    },
    // 106
    'Hitmonlee': {
        hp: 45, ac: 16, str: 14, dex: 16, con: 12, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'fighting', type2: '', size: 'Medium', sr: 6,
        hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/hitmonlee.png',
        vulnerabilities: ['fairy', 'flying', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'dark', 'rock'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Double Kick' },
            { level: 1, move: 'Revenge' },
            { level: 1, move: 'Reversal' },
            { level: 1, move: 'Meditate' },
            { level: 1, move: 'Rolling Kick' },
            { level: 6, move: 'Jump Kick' },
            { level: 6, move: 'Brick Break' },
            { level: 10, move: 'Focus Energy' },
            { level: 10, move: 'Feint' },
            { level: 10, move: 'Foresight' },
            { level: 14, move: 'High Jump Kick' },
            { level: 14, move: 'Mind Reader' },
            { level: 14, move: 'Axe Kick' },
            { level: 18, move: 'Wide Guard' },
            { level: 18, move: 'Blaze Kick' },
            { level: 18, move: 'Endure' },
            { level: 18, move: 'Mega Kick' },
            { level: 18, move: 'Close Combat' }
        ],
        features: [
            {
                name: "Limber",
                description: "This Pokémon is immune to being paralyzed."
            },
            {
                name: "Reckless",
                description: "When attacking with moves with recoil damage, this Pokémon doubles its STAB bonus."
            },
            {
                name: "Unburden (Hidden)",
                description: "While this Pokémon is not holding an item, it gains 10 feet to its speed."
            }
        ],
        skillProficiencies: ['athletics', 'acrobatics'],
        saveProficiencies: ['strength', 'dexterity']
    },
    // 107
    'Hitmonchan': {
        hp: 45, ac: 16, str: 16, dex: 14, con: 12, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'fighting', type2: '', size: 'Medium', sr: 6,
        hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/hitmonchan.png',
        vulnerabilities: ['fairy', 'flying', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'dark', 'rock'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Comet Punch' },
            { level: 1, move: 'Pursuit' },
            { level: 1, move: 'Revenge' },
            { level: 1, move: 'Agility' },
            { level: 6, move: 'Bullet Punch' },
            { level: 6, move: 'Mach Punch' },
            { level: 10, move: 'Feint' },
            { level: 10, move: 'Vacuum Wave' },
            { level: 10, move: 'Fire Punch' },
            { level: 10, move: 'Ice Punch' },
            { level: 10, move: 'Thunder Punch' },
            { level: 14, move: 'Quick Guard' },
            { level: 14, move: 'Sky Uppercut' },
            { level: 14, move: 'Mega Punch' },
            { level: 18, move: 'Detect' },
            { level: 18, move: 'Focus Punch' },
            { level: 18, move: 'Counter' },
            { level: 18, move: 'Close Combat' }
        ],
        features: [
            {
                name: "Keen Eye",
                description: "This Pokémon ignores disadvantage when it relates to sight."
            },
            {
                name: "Iron Fist",
                description: "When attacking with a punch-based move, may roll damage twice and choose either total."
            },
            {
                name: "Inner Focus (Hidden)",
                description: "This Pokémon is immune to flinching."
            }
        ],
        skillProficiencies: ['athletics', 'acrobatics'],
        saveProficiencies: ['strength', 'dexterity']
    },
    // 108
    'Lickitung': {
        hp: 70, ac: 14, str: 15, dex: 12, con: 15, int: 6, wis: 10, cha: 12,
        speed: 30, type1: 'normal', type2: '', size: 'Small', sr: 7,
        hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/lickitung.png',
        vulnerabilities: ['fighting'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost'],
        learnset: [
            { level: 1, move: 'Lick' },
            { level: 1, move: 'Supersonic' },
            { level: 1, move: 'Defense Curl' },
            { level: 6, move: 'Knock Off' },
            { level: 6, move: 'Wrap' },
            { level: 10, move: 'Stomp' },
            { level: 10, move: 'Disable' },
            { level: 14, move: 'Slam' },
            { level: 14, move: 'Rollout' },
            { level: 18, move: 'Chip Away' },
            { level: 18, move: 'Me First' },
            { level: 18, move: 'Refresh' },
            { level: 18, move: 'Screech' },
            { level: 18, move: 'Power Whip' },
            { level: 18, move: 'Wring Out' }
        ],
        features: [
            {
                name: "Own Tempo",
                description: "This Pokémon is immune to becoming confused."
            },
            {
                name: "Oblivious",
                description: "This Pokémon is immune to moves that attempt to charm or taunt it."
            },
            {
                name: "Cloud Nine (Hidden)",
                description: "While this Pokémon is in battle, weather-related abilities have no effect."
            }
        ],
        skillProficiencies: ['perception'],
        saveProficiencies: ['constitution']
    },
    // 109
    'Koffing': {
        hp: 18, ac: 14, str: 15, dex: 10, con: 14, int: 6, wis: 10, cha: 8,
        speed: 20, type1: 'poison', type2: '', size: 'Tiny', sr: 0.5,
        hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/koffing.png',
        vulnerabilities: ['ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'fairy', 'fighting', 'grass', 'poison'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Poison Gas' },
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Smog' },
            { level: 2, move: 'Smokescreen' },
            { level: 6, move: 'Assurance' },
            { level: 6, move: 'Clear Smog' },
            { level: 6, move: 'Sludge' },
            { level: 10, move: 'Self-Destruct' },
            { level: 10, move: 'Haze' },
            { level: 14, move: 'Gyro Ball' },
            { level: 14, move: 'Sludge Bomb' },
            { level: 18, move: 'Explosion' },
            { level: 18, move: 'Destiny Bond' },
            { level: 18, move: 'Memento' },
            { level: 18, move: 'Belch' }
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
        hp: 88, ac: 16, str: 16, dex: 14, con: 18, int: 6, wis: 12, cha: 8,
        speed: 30, type1: 'poison', type2: '', size: 'Medium', sr: 10,
        hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/weezing.png',
        vulnerabilities: ['ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'fairy', 'fighting', 'grass', 'poison'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Double Hit' },
            { level: 1, move: 'Poison Gas' },
            { level: 1, move: 'Smog' },
            { level: 1, move: 'Smokescreen' },
            { level: 1, move: 'Tackle' },
            { level: 1, move: 'Assurance' },
            { level: 1, move: 'Clear Smog' },
            { level: 1, move: 'Sludge' },
            { level: 10, move: 'Self-Destruct' },
            { level: 10, move: 'Haze' },
            { level: 14, move: 'Gyro Ball' },
            { level: 14, move: 'Sludge Bomb' },
            { level: 18, move: 'Explosion' },
            { level: 18, move: 'Destiny Bond' },
            { level: 18, move: 'Memento' },
            { level: 18, move: 'Belch' }
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
    // 111
    'Rhyhorn': {
        hp: 40, ac: 13, str: 15, dex: 10, con: 14, int: 6, wis: 10, cha: 10,
        speed: 30, type1: 'ground', type2: 'rock', size: 'Medium', sr: 3,
        hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/rhyhorn.png',
        vulnerabilities: ['fighting', 'grass', 'ground', 'ice', 'steel', 'water'],
        doubleVulnerabilities: ['grass', 'water'],
        resistances: ['fire', 'flying', 'normal', 'poison', 'rock'],
        doubleResistances: [],
        immunities: ['electric'],
        learnset: [
            { level: 1, move: 'Horn Attack' },
            { level: 1, move: 'Tail Whip' },
            { level: 2, move: 'Fury Attack' },
            { level: 2, move: 'Scary Face' },
            { level: 6, move: 'Smack Down' },
            { level: 6, move: 'Stomp' },
            { level: 10, move: 'Bulldoze' },
            { level: 10, move: 'Chip Away' },
            { level: 10, move: 'Head Smash' },
            { level: 14, move: 'Rock Blast' },
            { level: 14, move: 'Drill Run' },
            { level: 14, move: 'Take Down' },
            { level: 14, move: 'Stone Edge' },
            { level: 18, move: 'Earthquake' },
            { level: 18, move: 'Megahorn' },
            { level: 18, move: 'Horn Drill' },
            { level: 18, move: 'Double Edge' }
        ],
        features: [
            {
                name: "Lightning Rod",
                description: "This Pokémon draws electrical attacks to itself, becoming immune to Electric-type damage and gaining +1 to attack rolls when targeted by Electric moves."
            },
            {
                name: "Rock Head",
                description: "This Pokémon is immune to recoil damage from its own moves."
            },
            {
                name: "Reckless (Hidden)",
                description: "When attacking with moves with recoil damage, this Pokémon doubles its STAB bonus."
            }
        ],
        skillProficiencies: ['athletics'],
        saveProficiencies: ['strength', 'constitution']
    },
    // 112
    'Rhydon': {
        hp: 128, ac: 15, str: 18, dex: 13, con: 17, int: 6, wis: 12, cha: 10,
        speed: 40, type1: 'ground', type2: 'rock', size: 'Large', sr: 11,
        hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/rhydon.png',
        vulnerabilities: ['fighting', 'grass', 'ground', 'ice', 'steel', 'water'],
        doubleVulnerabilities: ['grass', 'water'],
        resistances: ['fire', 'flying', 'normal', 'poison', 'rock'],
        doubleResistances: [],
        immunities: ['electric'],
        learnset: [
            { level: 1, move: 'Fury Attack' },
            { level: 1, move: 'Hammer Arm' },
            { level: 1, move: 'Horn Attack' },
            { level: 1, move: 'Scary Face' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Smack Down' },
            { level: 1, move: 'Stomp' },
            { level: 1, move: 'Bulldoze' },
            { level: 1, move: 'Chip Away' },
            { level: 14, move: 'Rock Blast' },
            { level: 14, move: 'Drill Run' },
            { level: 14, move: 'Take Down' },
            { level: 14, move: 'Head Smash' },
            { level: 18, move: 'Stone Edge' },
            { level: 18, move: 'Earthquake' },
            { level: 18, move: 'Megahorn' },
            { level: 18, move: 'Horn Drill' },
            { level: 18, move: 'Double Edge' }
        ],
        features: [
            {
                name: "Lightning Rod",
                description: "This Pokémon draws electrical attacks to itself, becoming immune to Electric-type damage and gaining +1 to attack rolls when targeted by Electric moves."
            },
            {
                name: "Rock Head",
                description: "This Pokémon is immune to recoil damage from its own moves."
            },
            {
                name: "Reckless (Hidden)",
                description: "When attacking with moves with recoil damage, this Pokémon doubles its STAB bonus."
            }
        ],
        skillProficiencies: ['athletics'],
        saveProficiencies: ['strength', 'constitution']
    },
    // 113
    'Chansey': {
        hp: 75, ac: 13, str: 11, dex: 10, con: 18, int: 6, wis: 12, cha: 18,
        speed: 30, type1: 'normal', type2: '', size: 'Medium', sr: 7,
        hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/chansey.png',
        vulnerabilities: ['fighting'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost'],
        learnset: [
            { level: 1, move: 'Defense Curl' },
            { level: 1, move: 'Growl' },
            { level: 1, move: 'Pound' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Refresh' },
            { level: 6, move: 'Double Slap' },
            { level: 6, move: 'Soft-Boiled' },
            { level: 6, move: 'Life Dew' },
            { level: 10, move: 'Bestow' },
            { level: 10, move: 'Minimize' },
            { level: 10, move: 'Take Down' },
            { level: 14, move: 'Sing' },
            { level: 14, move: 'Fling' },
            { level: 18, move: 'Heal Pulse' },
            { level: 18, move: 'Egg Bomb' },
            { level: 18, move: 'Light Screen' },
            { level: 18, move: 'Healing Wish' },
            { level: 18, move: 'Double Edge' }
        ],
        features: [
            {
                name: "Natural Cure",
                description: "This Pokémon is cured of negative status ailments upon returning to its Pokeball."
            },
            {
                name: "Serene Grace",
                description: "The Move DC to pass a saving throw against one of this Pokémon's moves is increased by 1."
            },
            {
                name: "Healer (Hidden)",
                description: "As an action, this Pokemon may touch a creature to heal poison, burn, or paralysis."
            }
        ],
        skillProficiencies: ['arcana', 'medicine'],
        saveProficiencies: ['wisdom', 'charisma']
    },
    // 114
    'Tangela': {
        hp: 35, ac: 15, str: 15, dex: 14, con: 15, int: 6, wis: 10, cha: 10,
        speed: 30, type1: 'grass', type2: '', size: 'Small', sr: 5,
        hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/tangela.png',
        vulnerabilities: ['bug', 'fire', 'flying', 'ice', 'poison'],
        doubleVulnerabilities: [],
        resistances: ['electric', 'grass', 'ground', 'water'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Constrict' },
            { level: 1, move: 'Ingrain' },
            { level: 1, move: 'Sleep Powder' },
            { level: 1, move: 'Vine Whip' },
            { level: 1, move: 'Absorb' },
            { level: 6, move: 'Poison Powder' },
            { level: 6, move: 'Bind' },
            { level: 10, move: 'Growth' },
            { level: 10, move: 'Mega Drain' },
            { level: 14, move: 'Knock Off' },
            { level: 14, move: 'Stun Spore' },
            { level: 14, move: 'Natural Gift' },
            { level: 14, move: 'Ancient Power' },
            { level: 18, move: 'Giga Drain' },
            { level: 18, move: 'Slam' },
            { level: 18, move: 'Tickle' },
            { level: 18, move: 'Wring Out' },
            { level: 18, move: 'Power Whip' },
            { level: 18, move: 'Grassy Terrain' }
        ],
        features: [
            {
                name: "Chlorophyll",
                description: "This Pokémon's speed is doubled in harsh sunlight."
            },
            {
                name: "Leaf Guard",
                description: "This Pokémon does not suffer from any negative status ailments in harsh sunlight."
            },
            {
                name: "Regenerator (Hidden)",
                description: "Once per long rest, this Pokémon regains hit points equal to its level when it returns to its Pokéball."
            }
        ],
        skillProficiencies: ['nature'],
        saveProficiencies: ['constitution']
    },
    // 115
    'Kangaskhan': {
        hp: 60, ac: 18, str: 19, dex: 18, con: 15, int: 6, wis: 12, cha: 8,
        speed: 30, type1: 'normal', type2: '', size: 'Large', sr: 10,
        hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/kangaskhan.png',
        vulnerabilities: ['fighting'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost'],
        learnset: [
            { level: 1, move: 'Comet Punch' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Fake Out' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Bite' },
            { level: 1, move: 'Double Hit' },
            { level: 10, move: 'Rage' },
            { level: 10, move: 'Mega Punch' },
            { level: 14, move: 'Chip Away' },
            { level: 14, move: 'Dizzy Punch' },
            { level: 14, move: 'Crunch' },
            { level: 18, move: 'Endure' },
            { level: 18, move: 'Outrage' },
            { level: 18, move: 'Sucker Punch' },
            { level: 18, move: 'Reversal' }
        ],
        features: [
            {
                name: "Early Bird",
                description: "This Pokémon has advantage on rolls to wake from sleep."
            },
            {
                name: "Scrappy",
                description: "This Pokémon's Normal and Fighting type moves ignore immunities."
            },
            {
                name: "Inner Focus (Hidden)",
                description: "This Pokémon is immune to flinching."
            }
        ],
        skillProficiencies: ['athletics', 'perception', 'intimidation'],
        saveProficiencies: ['strength', 'constitution']
    },
    // 116
    'Horsea': {
        hp: 16, ac: 13, str: 11, dex: 14, con: 10, int: 6, wis: 10, cha: 12,
        speed: 5, type1: 'water', type2: '', size: 'Tiny', sr: 0.5,
        hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/horsea.png',
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'ice', 'steel', 'water'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Bubble' },
            { level: 2, move: 'Smokescreen' },
            { level: 2, move: 'Leer' },
            { level: 6, move: 'Water Gun' },
            { level: 6, move: 'Twister' },
            { level: 10, move: 'Bubble Beam' },
            { level: 10, move: 'Focus Energy' },
            { level: 14, move: 'Brine' },
            { level: 14, move: 'Agility' },
            { level: 18, move: 'Dragon Pulse' },
            { level: 18, move: 'Dragon Dance' },
            { level: 18, move: 'Hydro Pump' }
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
        hp: 64, ac: 15, str: 15, dex: 17, con: 13, int: 6, wis: 12, cha: 10,
        speed: 35, type1: 'water', type2: '', size: 'Small', sr: 8,
        hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/seadra.png',
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'ice', 'steel', 'water'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Bubble' },
            { level: 1, move: 'Hydro Pump' },
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Smokescreen' },
            { level: 1, move: 'Water Gun' },
            { level: 1, move: 'Twister' },
            { level: 10, move: 'Bubble Beam' },
            { level: 10, move: 'Focus Energy' },
            { level: 14, move: 'Brine' },
            { level: 18, move: 'Agility' },
            { level: 18, move: 'Dragon Pulse' },
            { level: 18, move: 'Dragon Dance' }
        ],
        features: [
            {
                name: "Poison Point",
                description: "When this Pokémon is hit with a melee attack, roll a 1d4. On a result of 4, the attacker takes an amount of poison damage equal to this Pokémon's proficiency modifier."
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
    // 118
    'Goldeen': {
        hp: 17, ac: 13, str: 11, dex: 13, con: 12, int: 6, wis: 10, cha: 10,
        speed: 30, type1: 'water', type2: '', size: 'Small', sr: 0.25,
        hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/goldeen.png',
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'ice', 'steel', 'water'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Water Sport' },
            { level: 2, move: 'Supersonic' },
            { level: 2, move: 'Horn Attack' },
            { level: 6, move: 'Flail' },
            { level: 6, move: 'Water Pulse' },
            { level: 10, move: 'Aqua Ring' },
            { level: 10, move: 'Fury Attack' },
            { level: 14, move: 'Agility' },
            { level: 14, move: 'Waterfall' },
            { level: 18, move: 'Horn Drill' },
            { level: 18, move: 'Soak' },
            { level: 18, move: 'Megahorn' }
        ],
        features: [
            {
                name: "Swift Swim",
                description: "This Pokémon's speed is doubled in rainy conditions."
            },
            {
                name: "Water Veil",
                description: "This Pokémon is immune to burning."
            },
            {
                name: "Lightning Rod (Hidden)",
                description: "If this Pokemon or an ally within 30 feet is targeted with a direct electric-type, damage-dealing move, the Pokemon may use a reaction to redirect the target to itself and take half damage from it if it hits."
            }
        ],
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity']
    },
    // 119
    'Seaking': {
        hp: 72, ac: 15, str: 14, dex: 17, con: 14, int: 6, wis: 12, cha: 10,
        speed: 35, type1: 'water', type2: '', size: 'Medium', sr: 9,
        hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/seaking.png',
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'ice', 'steel', 'water'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Peck' },
            { level: 1, move: 'Poison Jab' },
            { level: 1, move: 'Tail Whip' },
            { level: 1, move: 'Water Sport' },
            { level: 1, move: 'Supersonic' },
            { level: 1, move: 'Horn Attack' },
            { level: 1, move: 'Flail' },
            { level: 1, move: 'Water Pulse' },
            { level: 10, move: 'Aqua Ring' },
            { level: 10, move: 'Fury Attack' },
            { level: 14, move: 'Agility' },
            { level: 14, move: 'Waterfall' },
            { level: 18, move: 'Horn Drill' },
            { level: 18, move: 'Soak' },
            { level: 18, move: 'Megahorn' }
        ],
        features: [
            {
                name: "Swift Swim",
                description: "This Pokémon's speed is doubled in rainy conditions."
            },
            {
                name: "Water Veil",
                description: "This Pokémon is immune to burning."
            },
            {
                name: "Lightning Rod (Hidden)",
                description: "If this Pokemon or an ally within 30 feet is targeted with a direct electric-type, damage-dealing move, the Pokemon may use a reaction to redirect the target to itself and take half damage from it if it hits."
            }
        ],
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity']
    },
    // 120
    'Staryu': {
        hp: 16, ac: 14, str: 10, dex: 14, con: 11, int: 6, wis: 12, cha: 10,
        speed: 20, type1: 'water', type2: '', size: 'Small', sr: 0.5,
        hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/staryu.png',
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'ice', 'steel', 'water'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Harden' },
            { level: 1, move: 'Tackle' },
            { level: 2, move: 'Water Gun' },
            { level: 2, move: 'Rapid Spin' },
            { level: 2, move: 'Recover' },
            { level: 6, move: 'Psywave' },
            { level: 6, move: 'Swift' },
            { level: 10, move: 'Bubble Beam' },
            { level: 10, move: 'Camouflage' },
            { level: 10, move: 'Gyro Ball' },
            { level: 14, move: 'Brine' },
            { level: 14, move: 'Minimize' },
            { level: 14, move: 'Reflect Type' },
            { level: 14, move: 'Confuse Ray' },
            { level: 18, move: 'Power Gem' },
            { level: 18, move: 'Psychic' },
            { level: 18, move: 'Light Screen' },
            { level: 18, move: 'Cosmic Power' },
            { level: 18, move: 'Hydro Pump' }
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
        hp: 64, ac: 17, str: 14, dex: 17, con: 13, int: 6, wis: 14, cha: 10,
        speed: 40, type1: 'water', type2: 'psychic', size: 'Small', sr: 9,
        hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/starmie.png',
        vulnerabilities: ['bug', 'dark', 'electric', 'ghost', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'fire', 'ice', 'psychic', 'steel', 'water'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Hydro Pump' },
            { level: 1, move: 'Rapid Spin' },
            { level: 1, move: 'Recover' },
            { level: 1, move: 'Spotlight' },
            { level: 1, move: 'Swift' },
            { level: 1, move: 'Water Gun' },
            { level: 18, move: 'Confuse Ray' }
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
    // 122
    'Mr. Mime': {
        hp: 50, ac: 17, str: 12, dex: 15, con: 8, int: 12, wis: 14, cha: 12,
        speed: 30, type1: 'psychic', type2: 'fairy', size: 'Medium', sr: 9,
        hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/mr-mime.png',
        vulnerabilities: ['ghost', 'poison', 'steel'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'psychic'],
        doubleResistances: [],
        immunities: ['dragon'],
        learnset: [
            { level: 1, move: 'Barrier' },
            { level: 1, move: 'Confusion' },
            { level: 1, move: 'Guard Swap' },
            { level: 1, move: 'Magical Leaf' },
            { level: 1, move: 'Misty Terrain' },
            { level: 1, move: 'Power Swap' },
            { level: 1, move: 'Quick Guard' },
            { level: 1, move: 'Wide Guard' },
            { level: 1, move: 'Copycat' },
            { level: 1, move: 'Meditate' },
            { level: 1, move: 'Double Slap' },
            { level: 6, move: 'Mimic' },
            { level: 6, move: 'Psywave' },
            { level: 6, move: 'Encore' },
            { level: 10, move: 'Light Screen' },
            { level: 10, move: 'Reflect' },
            { level: 10, move: 'Psybeam' },
            { level: 14, move: 'Substitute' },
            { level: 14, move: 'Recycle' },
            { level: 14, move: 'Trick' },
            { level: 18, move: 'Psychic' },
            { level: 18, move: 'Role Play' },
            { level: 18, move: 'Baton Pass' },
            { level: 18, move: 'Safeguard' }
        ],
        features: [
            {
                name: "Soundproof",
                description: "This Pokémon is immune to sound-based moves."
            },
            {
                name: "Filter",
                description: "When hit by a move type this Pokémon is vulnerable to, it may roll a d4. On a result of 4, it does not take the additional damage."
            },
            {
                name: "Technician (Hidden)",
                description: "For damaging moves activated by this Pokémon with 15 max PP or more, they may roll the damage twice and choose either total."
            }
        ],
        skillProficiencies: ['performance'],
        saveProficiencies: ['charisma']
    },
    // 123
    'Scyther': {
        hp: 58, ac: 16, str: 17, dex: 18, con: 12, int: 6, wis: 10, cha: 8,
        speed: 35, type1: 'bug', type2: 'flying', size: 'Medium', sr: 8,
        hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/scyther.png',
        vulnerabilities: ['electric', 'fire', 'flying', 'ice', 'rock'],
        doubleVulnerabilities: ['rock'],
        resistances: ['bug'],
        doubleResistances: ['grass', 'fighting'],
        immunities: ['ground'],
        learnset: [
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Quick Attack' },
            { level: 1, move: 'Vacuum Wave' },
            { level: 1, move: 'Focus Energy' },
            { level: 1, move: 'Pursuit' },
            { level: 6, move: 'False Swipe' },
            { level: 6, move: 'Agility' },
            { level: 6, move: 'Wing Attack' },
            { level: 10, move: 'Fury Cutter' },
            { level: 10, move: 'Slash' },
            { level: 14, move: 'Razor Wind' },
            { level: 14, move: 'Double Team' },
            { level: 18, move: 'X-Scissor' },
            { level: 18, move: 'Night Slash' },
            { level: 18, move: 'Double Hit' },
            { level: 18, move: 'Air Slash' },
            { level: 18, move: 'Swords Dance' },
            { level: 18, move: 'Feint' }
        ],
        features: [
            {
                name: "Swarm",
                description: "Doubles its STAB bonus when it has 25% or less of its maximum health."
            },
            {
                name: "Technician",
                description: "For damaging moves activated by this Pokémon, they may roll damage twice and choose either total."
            },
            {
                name: "Steadfast (Hidden)",
                description: "Once per long rest, when failing a saving throw against a negative condition, can choose to pass instead."
            }
        ],
        skillProficiencies: ['acrobatics'],
        saveProficiencies: ['dexterity']
    },
    // 124
    'Jynx': {
        hp: 67, ac: 15, str: 12, dex: 16, con: 14, int: 8, wis: 16, cha: 16,
        speed: 30, type1: 'ice', type2: 'psychic', size: 'Medium', sr: 8,
        hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/jynx.png',
        vulnerabilities: ['bug', 'dark', 'fire', 'ghost', 'rock', 'steel'],
        doubleVulnerabilities: [],
        resistances: ['ice', 'psychic'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Draining Kiss' },
            { level: 1, move: 'Pound' },
            { level: 1, move: 'Lick' },
            { level: 1, move: 'Lovely Kiss' },
            { level: 1, move: 'Powder Snow' },
            { level: 6, move: 'Double Slap' },
            { level: 6, move: 'Ice Punch' },
            { level: 10, move: 'Heart Stamp' },
            { level: 10, move: 'Mean Look' },
            { level: 14, move: 'Fake Tears' },
            { level: 14, move: 'Wake-Up Slap' },
            { level: 18, move: 'Avalanche' },
            { level: 18, move: 'Body Slam' },
            { level: 18, move: 'Wring Out' },
            { level: 18, move: 'Perish Song' },
            { level: 18, move: 'Blizzard' }
        ],
        features: [
            {
                name: "Oblivious",
                description: "This Pokémon is immune to moves that attempt to charm or taunt it."
            },
            {
                name: "Forewarn",
                description: "Reveals the move with most damage output when entering battle."
            },
            {
                name: "Dry Skin (Hidden)",
                description: "Takes/heals damage equal to proficiency modifier in sunlight/rain."
            }
        ],
        skillProficiencies: ['insight', 'deception'],
        saveProficiencies: ['charisma']
    },
    // 125
    'Electabuzz': {
        hp: 68, ac: 15, str: 15, dex: 18, con: 15, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'electric', type2: '', size: 'Small', sr: 9,
        hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/electabuzz.png',
        vulnerabilities: ['ground'],
        doubleVulnerabilities: [],
        resistances: ['electric', 'flying', 'steel'],
        doubleResistances: [],
        immunities: [],
        learnset: [
            { level: 1, move: 'Leer' },
            { level: 1, move: 'Quick Attack' },
            { level: 1, move: 'Thunder Shock' },
            { level: 1, move: 'Low Kick' },
            { level: 6, move: 'Swift' },
            { level: 6, move: 'Shock Wave' },
            { level: 10, move: 'Thunder Wave' },
            { level: 10, move: 'Electro Ball' },
            { level: 10, move: 'Light Screen' },
            { level: 14, move: 'Thunder Punch' },
            { level: 14, move: 'Discharge' },
            { level: 18, move: 'Screech' },
            { level: 18, move: 'Thunderbolt' },
            { level: 18, move: 'Thunder' }
        ],
        features: [
            {
                name: "Static",
                description: "When this Pokémon is hit by a melee attack, roll a d4. On a result of 4, the attacker takes an amount of electric damage equal to this Pokemon's proficiency bonus."
            },
            {
                name: "Vital Spirit (Hidden)",
                description: "This Pokémon cannot be put to sleep."
            }
        ],
        skillProficiencies: ['athletics'],
        saveProficiencies: ['constitution']
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