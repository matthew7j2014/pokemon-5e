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
        speed: 30, type1: 'grass', type2: 'poison', size: 'Small', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/bulbasaur.png',
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
        saveProficiencies: ['strength'],
        vulnerabilities: ['fire', 'flying', 'ice', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['water', 'electric', 'fighting', 'fairy'],
        doubleResistances: ['grass'],
        immunities: []
    },
    // 2
    'Ivysaur': { 
        hp: 45, ac: 15, str: 15, dex: 14, con: 12, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'grass', type2: 'poison', size: 'Medium', sr: 5, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/ivysaur.png',
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
        resistances: ['water', 'electric', 'fighting', 'fairy'],
        doubleResistances: ['grass'],
        immunities: []
    },
    // 3
    'Venusaur': { 
        hp: 102, ac: 16, str: 19, dex: 17, con: 14, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'grass', type2: 'poison', size: 'Large', sr: 13, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/venusaur.png',
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
        resistances: ['water', 'electric', 'fighting', 'fairy'],
        doubleResistances: ['grass'],
        immunities: []
    },
    // 4
    'Charmander': { 
        hp: 16, ac: 13, str: 12, dex: 14, con: 11, int: 6, wis: 10, cha: 10,
        speed: 30, type1: 'fire', type2: '', size: 'Small', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/charmander.png',
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
        speed: 30, type1: 'fire', type2: '', size: 'Medium', sr: 5, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/charmeleon.png',
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
        hp: 102, ac: 16, str: 16, dex: 19, con: 15, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'fire', type2: 'flying', size: 'Large', sr: 13, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/charizard.png',
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
        resistances: ['fire', 'grass', 'fighting', 'bug', 'steel', 'fairy'],
        doubleResistances: [],
        immunities: ['ground']
    },
    // 7
    'Squirtle': { 
        hp: 18, ac: 14, str: 12, dex: 11, con: 14, int: 6, wis: 10, cha: 10,
        speed: 30, type1: 'water', type2: '', size: 'Small', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/squirtle.png',
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
        speed: 30, type1: 'water', type2: '', size: 'Medium', sr: 5, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/wartortle.png',
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
        hp: 122, ac: 17, str: 17, dex: 14, con: 19, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'water', type2: '', size: 'Large', sr: 13, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/blastoise.png',
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
        speed: 20, type1: 'bug', type2: '', size: 'Small', sr: .125, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/caterpie.png',
        hitDie: 'd6',
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
        hp: 29, ac: 12, str: 10, dex: 9, con: 16, int: 6, wis: 10, cha: 10,
        speed: 10, type1: 'bug', type2: '', size: 'Small', sr: 1, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/metapod.png',
        features: [
            {
                name: "Shed Skin",
                description: "Once per long rest, this Pokémon can automatically recover from one status condition at the end of its turn."
            }
        ],
        skillProficiencies: ['survival'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fire', 'flying', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['grass', 'fighting', 'ground'],
        doubleResistances: [],
        immunities: []
    },
    // 12
    'Butterfree': { 
        hp: 38, ac: 14, str: 14, dex: 15, con: 10, int: 6, wis: 12, cha: 12,
        speed: 30, type1: 'bug', type2: 'flying', size: 'Medium', sr: 6, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/butterfree.png',
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
        skillProficiencies: ['acrobatics', 'persuasion'],
        saveProficiencies: ['dexterity', 'charisma'],
        vulnerabilities: ['fire', 'electric', 'ice', 'flying'],
        doubleVulnerabilities: ['rock'],
        resistances: ['bug'],
        doubleResistances: ['grass', 'fighting'],
        immunities: ['ground']
    },
    // 13
    'Weedle': {
        hp: 17, ac: 11, str: 9, dex: 10, con: 12, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'bug', type2: 'poison', size: 'Small', sr: .125, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/weedle.png',
        hitDie: 'd6',
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
        hp: 29, ac: 12, str: 10, dex: 9, con: 16, int: 6, wis: 10, cha: 10,
        speed: 5, type1: 'bug', type2: 'poison', size: 'Small', sr: 1, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/kakuna.png',
        hitDie: 'd8',
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
        hp: 47, ac: 14, str: 12, dex: 16, con: 13, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'bug', type2: 'poison', size: 'Medium', sr: 6, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/beedrill.png',
        hitDie: 'd10',
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
        saveProficiencies: ['dexterity', 'charisma'],
        vulnerabilities: ['fire', 'flying', 'psychic', 'rock'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'poison', 'fairy'],
        doubleResistances: ['grass', 'fighting'],
        immunities: []
    },
    // 16
    'Pidgey': {
        hp: 16, ac: 12, str: 10, dex: 12, con: 10, int: 6, wis: 10, cha: 10,
        speed: 25, type1: 'normal', type2: 'flying', size: 'Small', sr: .25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/pidgey.png',
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
        speed: 30, type1: 'normal', type2: 'flying', size: 'Medium', sr: 3, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/pidgeotto.png',
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
        hp: 77, ac: 16, str: 14, dex: 20, con: 12, int: 6, wis: 14, cha: 10,
        speed: 40, type1: 'normal', type2: 'flying', size: 'Large', sr: 10, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/pidgeot.png',
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
    // 19
    'Rattata': {
        hp: 16, ac: 12, str: 10, dex: 14, con: 11, int: 6, wis: 10, cha: 8,
        speed: 30, type1: 'normal', type2: '', size: 'Small', sr: .25, hitDie: 'd6',
        image: 'https://files.d20.io/images/443835565/s67sf201PBNpnE3YrModQg/original.png',
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
        speed: 30, type1: 'normal', type2: '', size: 'Medium', sr: 5, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/raticate.png',
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
    // 21
    'Spearow': {
        hp: 16, ac: 12, str: 10, dex: 14, con: 10, int: 6, wis: 10, cha: 10,
        speed: 25, type1: 'normal', type2: 'flying', size: 'Small', sr: .25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/spearow.png',
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
        hp: 40, ac: 15, str: 15, dex: 16, con: 10, int: 6, wis: 12, cha: 10,
        speed: 35, type1: 'normal', type2: 'flying', size: 'Medium', sr: 5, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/fearow.png',
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
    // 23
    'Ekans': {
        hp: 16, ac: 13, str: 12, dex: 13, con: 11, int: 8, wis: 10, cha: 10,
        speed: 30, type1: 'poison', type2: '', size: 'Small', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/ekans.png',
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
        hp: 45, ac: 15, str: 14, dex: 16, con: 12, int: 8, wis: 12, cha: 10,
        speed: 30, type1: 'poison', type2: '', size: 'Large', sr: 6, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/arbok.png',
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
        speed: 30, type1: 'electric', type2: '', size: 'Tiny', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/pikachu.png',
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
        hp: 50, ac: 15, str: 12, dex: 18, con: 15, int: 6, wis: 12, cha: 10,
        speed: 35, type1: 'electric', type2: '', size: 'Small', sr: 7,
        image: 'https://img.pokemondb.net/sprites/black-white/normal/raichu.png',
        hitDie: 'd10',
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
        speed: 20, type1: 'ground', type2: '', size: 'Tiny', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/sandshrew.png',
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
        speed: 30, type1: 'ground', type2: '', size: 'Small', sr: 7, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/sandslash.png',
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
        speed: 20, type1: 'poison', type2: '', size: 'Tiny', sr: .25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidoran-f.png',
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
        speed: 30, type1: 'poison', type2: '', size: 'Small', sr: 4, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidorina.png',
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
        hp: 122, ac: 16, str: 16, dex: 16, con: 18, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'poison', type2: 'ground', size: 'Medium', sr: 13, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidoqueen.png',
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
        vulnerabilities: ['water', 'ice', 'ground', 'psychic'],
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
        hp: 45, ac: 14, str: 13, dex: 14, con: 12, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'poison', type2: '', size: 'Small', sr: 4, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidorino.png',
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
        hp: 112, ac: 15, str: 18, dex: 16, con: 16, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'poison', type2: 'ground', size: 'Medium', sr: 13, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/nidoking.png',
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
        vulnerabilities: ['water', 'ice', 'ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['rock', 'bug', 'fairy', 'fighting'],
        doubleResistances: ['poison'],
        immunities: ['electric']
    },
    // 35
    'Clefairy': {
        hp: 18, ac: 13, str: 12, dex: 12, con: 10, int: 6, wis: 12, cha: 12,
        speed: 30, type1: 'fairy', type2: '', size: 'Tiny', sr: 1, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/clefairy.png',
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
        speed: 30, type1: 'fairy', type2: '', size: 'Medium', sr: 8, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/clefable.png',
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
        speed: 30, type1: 'fire', type2: '', size: 'Tiny', sr: .25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/vulpix.png',
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
        speed: 30, type1: 'fire', type2: '', size: 'Medium', sr: 7, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/ninetales.png',
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
        speed: 20, type1: 'normal', type2: 'fairy', size: 'Tiny', sr: 1, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/jigglypuff.png',
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
        hp: 56, ac: 15, str: 14, dex: 13, con: 14, int: 6, wis: 14, cha: 14,
        speed: 30, type1: 'normal', type2: 'fairy', size: 'Medium', sr: 6, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/wigglytuff.png',
        features: [
            {
                name: "Cute Charm",
                description: "When a creature makes a melee attack against this Pokemon, it must make a DC 13 Charisma saving throw. On a failure, the attacker is charmed for 1 minute."
            },
            {
                name: "Competitive",
                description: "When this Pokemon's abilities are reduced by an opponent, it gains advantage on its next attack roll."
            },
            {
                name: "Frisk (Hidden)",
                description: "Upon entering a battle, a single opponent's held item is revealed, if it has one."
            }
        ],
        skillProficiencies: ['insight', 'persuasion'],
        saveProficiencies: ['wisdom', 'charisma'],
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
        vulnerabilities: ['electric', 'ice', 'rock', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['fairy', 'poison'],
        doubleResistances: ['grass', 'fighting', 'bug'],
        immunities: ['ground']
    },
    // 42
    'Golbat': {
        hp: 50, ac: 15, str: 14, dex: 18, con: 14, int: 6, wis: 14, cha: 8,
        speed: 30, type1: 'poison', type2: 'flying', size: 'Medium', sr: 7, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/golbat.png',
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
        vulnerabilities: ['electric', 'ice', 'rock', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['fairy', 'poison'],
        doubleResistances: ['grass', 'fighting', 'bug'],
        immunities: ['ground']
    },
    // 43
    'Oddish': {
        hp: 17, ac: 13, str: 11, dex: 11, con: 12, int: 6, wis: 10, cha: 12,
        speed: 20, type1: 'grass', type2: 'poison', size: 'Small', sr: .25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/oddish.png',
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
        resistances: ['water', 'electric', 'fairy', 'fighting'],
        doubleResistances: ['grass'],
        immunities: []
    },
    // 44
    'Gloom': {
        hp: 50, ac: 14, str: 14, dex: 12, con: 15, int: 6, wis: 12, cha: 10,
        speed: 20, type1: 'grass', type2: 'poison', size: 'Medium', sr: 5, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/gloom.png',
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
        resistances: ['water', 'electric', 'fairy', 'fighting'],
        doubleResistances: ['grass'],
        immunities: []
    },
    // 45
    'Vileplume': {
        hp: 107, ac: 16, str: 16, dex: 14, con: 16, int: 6, wis: 14, cha: 14,
        speed: 30, type1: 'grass', type2: 'poison', size: 'Small', sr: 13, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/vileplume.png',
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
        resistances: ['water', 'electric', 'fairy', 'fighting'],
        doubleResistances: ['grass'],
        immunities: []
    },
    // 46
    'Paras': {
        hp: 18, ac: 13, str: 12, dex: 9, con: 15, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'bug', type2: 'grass', size: 'Small', sr: .25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/paras.png',
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
        vulnerabilities: ['ice', 'poison', 'bug', 'rock'],
        doubleVulnerabilities: ['fire', 'flying'],
        resistances: ['water', 'electric', 'fighting'],
        doubleResistances: ['ground', 'grass'],
        immunities: []
    },
    // 47
    'Parasect': {
        hp: 55, ac: 15, str: 16, dex: 12, con: 16, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'bug', type2: 'grass', size: 'Small', sr: 7, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/parasect.png',
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
        vulnerabilities: ['ice', 'poison', 'bug', 'rock'],
        doubleVulnerabilities: ['fire', 'flying'],
        resistances: ['water', 'electric', 'fighting'],
        doubleResistances: ['ground', 'grass'],
        immunities: []
    },
    // 48
    'Venonat': {
        hp: 16, ac: 13, str: 13, dex: 11, con: 11, int: 6, wis: 12, cha: 10,
        speed: 20, type1: 'bug', type2: 'poison', size: 'Small', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/venonat.png',
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
        resistances: ['poison', 'fairy', 'bug'],
        doubleResistances: ['grass', 'fighting'],
        immunities: []
    },
    // 49
    'Venomoth': {
        hp: 64, ac: 15, str: 14, dex: 17, con: 12, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'bug', type2: 'poison', size: 'Medium', sr: 8, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/venomoth.png',
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
        resistances: ['poison', 'fairy', 'bug'],
        doubleResistances: ['grass', 'fighting'],
        immunities: []
    },
    // 50
    'Diglett': {
        hp: 18, ac: 12, str: 12, dex: 12, con: 14, int: 6, wis: 10, cha: 10,
        speed: 20, type1: 'ground', type2: '', size: 'Tiny', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/diglett.png',
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
        speed: 30, type1: 'normal', type2: '', size: 'Tiny', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/meowth.png',
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
        skillProficiencies: ['persuasion', 'deception', 'sleight_of_hand'],
        saveProficiencies: ['dexterity', 'charisma'],
        vulnerabilities: ['fighting'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost']
    },
    // 53
    'Persian': {
        hp: 40, ac: 15, str: 14, dex: 18, con: 10, int: 8, wis: 12, cha: 14,
        speed: 35, type1: 'normal', type2: '', size: 'Small', sr: 7, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/persian.png',
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
        skillProficiencies: ['sleight_of_hand', 'deception', 'persuasion'],
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
        speed: 20, type1: 'water', type2: '', size: 'Small', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/psyduck.png',
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
        speed: 20, type1: 'fighting', type2: '', size: 'Tiny', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/mankey.png',
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
        speed: 30, type1: 'fighting', type2: '', size: 'Small', sr: 6, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/primeape.png',
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
        speed: 25, type1: 'fire', type2: '', size: 'Small', sr: .5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/growlithe.png',
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
        speed: 20, type1: 'water', type2: '', size: 'Tiny', sr: .25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/poliwag.png',
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
        speed: 20, type1: 'grass', type2: 'poison', size: 'Tiny', sr: .25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/bellsprout.png',
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
        skillProficiencies: ['sleight_of_hand'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['electric', 'ground', 'psychic'],
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
        skillProficiencies: ['sleight_of_hand'],
        saveProficiencies: ['constitution', 'strength'],
        vulnerabilities: ['electric', 'psychic', 'ground'],
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
        vulnerabilities: ['ice', 'fighting', 'ground', 'steel'],
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
        vulnerabilities: ['ice', 'fighting', 'ground', 'steel'],
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
        vulnerabilities: ['ice', 'fighting', 'ground', 'steel'],
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
        features: [
            {
                name: "Cursed Body",
                description: "When hit by a melee attack, this Pokémon may roll 1d4. On a result of 4, the opponent who made the attack cannot use the same move on its next turn."
            }
        ],
        skillProficiencies: ['stealth', 'deception'],
        saveProficiencies: ['constitution', 'charisma'],
        vulnerabilities: ['psychic', 'ghost', 'dark', 'ground'],
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
        speed: 30, type1: 'water', type2: '', size: 'Small', sr: .25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/krabby.png',
        features: [
            {
                name: "Hyper Cutter",
                description: "This Pokémon's attack or damage bonuses cannot be decreased by an opponent's moves."
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
        skillProficiencies: ['sleight_of_hand', 'survival'],
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
        skillProficiencies: ['sleight_of_hand', 'survival'],
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
        hp: 50, ac: 16, str: 18, dex: 12, con: 14, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'ground', type2: '', size: 'MediSmallum', sr: 7, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/marowak.png',
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
        skillProficiencies: ['athletics', 'survival'],
        saveProficiencies: ['strength', 'constitution'],
        vulnerabilities: ['water', 'grass', 'ice'],
        doubleVulnerabilities: [],
        resistances: ['poison', 'rock'],
        doubleResistances: [],
        immunities: ['electric']
    },
    // 106
    'Hitmonlee': {
        hp: 45, ac: 16, str: 14, dex: 16, con: 12, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'fighting', type2: '', size: 'Medium', sr: 6, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/hitmonlee.png',
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
        saveProficiencies: ['strength', 'dexterity'],
        vulnerabilities: ['fairy', 'flying', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'dark', 'rock'],
        doubleResistances: [],
        immunities: []
    },
    // 107
    'Hitmonchan': {
        hp: 45, ac: 16, str: 16, dex: 14, con: 12, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'fighting', type2: '', size: 'Medium', sr: 6, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/hitmonchan.png',
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
        saveProficiencies: ['strength', 'dexterity'],
        vulnerabilities: ['fairy', 'flying', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'dark', 'rock'],
        doubleResistances: [],
        immunities: []
    },
    // 108
    'Lickitung': {
        hp: 70, ac: 14, str: 15, dex: 12, con: 15, int: 6, wis: 10, cha: 12,
        speed: 30, type1: 'normal', type2: '', size: 'Small', sr: 7, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/lickitung.png',
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['fighting'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost']
    },
    // 109
    'Koffing': {
        hp: 18, ac: 14, str: 15, dex: 10, con: 14, int: 6, wis: 10, cha: 8,
        speed: 20, type1: 'poison', type2: '', size: 'Tiny', sr: 0.5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/koffing.png',
        features: [
            {
                name: "Levitate",
                description: "This Pokémon is immune to ground moves."
            }
        ],
        skillProficiencies: ['deception'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'fairy', 'fighting', 'grass', 'poison'],
        doubleResistances: [],
        immunities: []
    },
    // 110
    'Weezing': {
        hp: 88, ac: 16, str: 16, dex: 14, con: 18, int: 6, wis: 12, cha: 8,
        speed: 30, type1: 'poison', type2: '', size: 'Medium', sr: 10, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/weezing.png',
        features: [
            {
                name: "Levitate",
                description: "This Pokémon is immune to ground moves."
            }
        ],
        skillProficiencies: ['deception'],
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground', 'psychic'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'fairy', 'fighting', 'grass', 'poison'],
        doubleResistances: [],
        immunities: []
    },
    // 111
    'Rhyhorn': {
        hp: 40, ac: 13, str: 15, dex: 10, con: 14, int: 6, wis: 10, cha: 10,
        speed: 30, type1: 'ground', type2: 'rock', size: 'Medium', sr: 3, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/rhyhorn.png',
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
        saveProficiencies: ['strength', 'constitution'],
        vulnerabilities: ['fighting', 'ground', 'ice', 'steel'],
        doubleVulnerabilities: ['grass', 'water'],
        resistances: ['fire', 'flying', 'normal', 'poison', 'rock'],
        doubleResistances: [],
        immunities: ['electric']
    },
    // 112
    'Rhydon': {
        hp: 128, ac: 15, str: 18, dex: 13, con: 17, int: 6, wis: 12, cha: 10,
        speed: 40, type1: 'ground', type2: 'rock', size: 'Large', sr: 11, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/rhydon.png',
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
        saveProficiencies: ['strength', 'constitution'],
        vulnerabilities: ['fighting', 'ground', 'ice', 'steel'],
        doubleVulnerabilities: ['grass', 'water'],
        resistances: ['fire', 'flying', 'normal', 'poison', 'rock'],
        doubleResistances: [],
        immunities: ['electric']
    },
    // 113
    'Chansey': {
        hp: 75, ac: 13, str: 11, dex: 10, con: 18, int: 6, wis: 12, cha: 18,
        speed: 30, type1: 'normal', type2: '', size: 'Medium', sr: 7, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/chansey.png',
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
        saveProficiencies: ['wisdom', 'charisma'],
        vulnerabilities: ['fighting'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost']
    },
    // 114
    'Tangela': {
        hp: 35, ac: 15, str: 15, dex: 14, con: 15, int: 6, wis: 10, cha: 10,
        speed: 30, type1: 'grass', type2: '', size: 'Small', sr: 5, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/tangela.png',
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['bug', 'fire', 'flying', 'ice', 'poison'],
        doubleVulnerabilities: [],
        resistances: ['electric', 'grass', 'ground', 'water'],
        doubleResistances: [],
        immunities: []
    },
    // 115
    'Kangaskhan': {
        hp: 60, ac: 18, str: 19, dex: 18, con: 15, int: 6, wis: 12, cha: 8,
        speed: 30, type1: 'normal', type2: '', size: 'Large', sr: 10, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/kangaskhan.png',
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
        saveProficiencies: ['strength', 'constitution'],
        vulnerabilities: ['fighting'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost']
    },
    // 116
    'Horsea': {
        hp: 16, ac: 13, str: 11, dex: 14, con: 10, int: 6, wis: 10, cha: 12,
        speed: 5, type1: 'water', type2: '', size: 'Tiny', sr: 0.5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/horsea.png',
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
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'ice', 'steel', 'water'],
        doubleResistances: [],
        immunities: []
    },
    // 117
    'Seadra': {
        hp: 64, ac: 15, str: 15, dex: 17, con: 13, int: 6, wis: 12, cha: 10,
        speed: 5, type1: 'water', type2: '', size: 'Small', sr: 8, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/seadra.png',
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
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'ice', 'steel', 'water'],
        doubleResistances: [],
        immunities: []
    },
    // 118
    'Goldeen': {
        hp: 17, ac: 13, str: 11, dex: 13, con: 12, int: 6, wis: 10, cha: 10,
        speed: 5, type1: 'water', type2: '', size: 'Small', sr: 0.25, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/goldeen.png',
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
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'ice', 'steel', 'water'],
        doubleResistances: [],
        immunities: []
    },
    // 119
    'Seaking': {
        hp: 72, ac: 15, str: 14, dex: 17, con: 14, int: 6, wis: 12, cha: 10,
        speed: 5, type1: 'water', type2: '', size: 'Medium', sr: 9, hitDie: 'd12',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/seaking.png',
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
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'ice', 'steel', 'water'],
        doubleResistances: [],
        immunities: []
    },
    // 120
    'Staryu': {
        hp: 16, ac: 14, str: 10, dex: 14, con: 11, int: 6, wis: 12, cha: 10,
        speed: 20, type1: 'water', type2: '', size: 'Small', sr: 0.5, hitDie: 'd6',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/staryu.png',
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
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'ice', 'steel', 'water'],
        doubleResistances: [],
        immunities: []
    },
    // 121
    'Starmie': {
        hp: 64, ac: 17, str: 14, dex: 17, con: 13, int: 6, wis: 14, cha: 10,
        speed: 30, type1: 'water', type2: 'psychic', size: 'Small', sr: 9, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/starmie.png',
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
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['bug', 'dark', 'electric', 'ghost', 'grass'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'fire', 'ice', 'psychic', 'steel', 'water'],
        doubleResistances: [],
        immunities: []
    },
    // 122
    'Mr. Mime': {
        hp: 50, ac: 17, str: 12, dex: 15, con: 8, int: 12, wis: 14, cha: 12,
        speed: 30, type1: 'psychic', type2: 'fairy', size: 'Medium', sr: 9, hitDie: 'd8',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/mr-mime.png',
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
        saveProficiencies: ['charisma'],
        vulnerabilities: ['ghost', 'poison', 'steel'],
        doubleVulnerabilities: [],
        resistances: ['psychic'],
        doubleResistances: ['fighting'],
        immunities: ['dragon']
    },
    // 123
    'Scyther': {
        hp: 58, ac: 16, str: 17, dex: 18, con: 12, int: 6, wis: 10, cha: 8,
        speed: 35, type1: 'bug', type2: 'flying', size: 'Medium', sr: 8, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/scyther.png',
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
        saveProficiencies: ['dexterity'],
        vulnerabilities: ['electric', 'fire', 'flying', 'ice'],
        doubleVulnerabilities: ['rock'],
        resistances: ['bug'],
        doubleResistances: ['grass', 'fighting'],
        immunities: ['ground']
    },
    // 124
    'Jynx': {
        hp: 67, ac: 15, str: 12, dex: 16, con: 14, int: 8, wis: 16, cha: 16,
        speed: 30, type1: 'ice', type2: 'psychic', size: 'Medium', sr: 8, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/jynx.png',
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
        saveProficiencies: ['charisma'],
        vulnerabilities: ['bug', 'dark', 'fire', 'ghost', 'rock', 'steel'],
        doubleVulnerabilities: [],
        resistances: ['ice', 'psychic'],
        doubleResistances: [],
        immunities: [],
    },
    // 125
    'Electabuzz': {
        hp: 68, ac: 15, str: 15, dex: 18, con: 15, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'electric', type2: '', size: 'Small', sr: 9, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/electabuzz.png',
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
        saveProficiencies: ['constitution'],
        vulnerabilities: ['ground'],
        doubleVulnerabilities: [],
        resistances: ['electric', 'flying', 'steel'],
        doubleResistances: [],
        immunities: []
    },
    // 126
    'Magmar': {
        hp: 68, ac: 15, str: 15, dex: 18, con: 15, int: 6, wis: 12, cha: 10,
        speed: 30, type1: 'fire', type2: '', size: 'Small', sr: 9, hitDie: 'd10',
        image: 'https://img.pokemondb.net/sprites/black-white/normal/magmar.png',
        vulnerabilities: ['ground', 'rock', 'water'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'fairy', 'fire', 'grass', 'ice', 'steel'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Flame Body",
                description: "The flames from this Pokémon's body shine dim light in a 15 ft radius. On a 10, the attacker is burned."
            },
            {
                name: "Vital Spirit (Hidden)",
                description: "This Pokémon cannot be put to sleep."
            }
        ],
        skillProficiencies: ['athletics'],
        saveProficiencies: ['constitution'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'grass', 'ground'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Hyper Cutter",
                description: "Attack or damage bonuses cannot be decreased by an opponent's moves."
            },
            {
                name: "Mold Breaker",
                description: "Moves ignore any abilities that would lessen their effect."
            },
            {
                name: "Moxie (Hidden)",
                description: "Upon causing an opponent to faint, may immediately take another action."
            }
        ],
        skillProficiencies: ['athletics'],
        saveProficiencies: ['constitution'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost'],
        features: [
            {
                name: "Intimidate",
                description: "Once per short rest, you can impose disadvantage on an enemy attack roll of your choice."
            },
            {
                name: "Anger Point",
                description: "After suffering a critical hit, this Pokémon doubles the damage dice for a single move it activates on the following turn."
            },
            {
                name: "Sheer Force (Hidden)",
                description: "When activating a move that has a chance to impose a stat change or inflict a status, this creature instead doubles its move modifier for the damage with no chance of the additional effect."
            }
        ],
        skillProficiencies: ['athletics', 'intimidation'],
        saveProficiencies: ['strength', 'constitution'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'ice', 'steel', 'water'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Swift Swim",
                description: "This Pokémon's speed is doubled in rainy conditions."
            },
            {
                name: "Rattled (Hidden)",
                description: "When this Pokémon is hit by a damaging Dark, Bug, or Ghost move, it makes its next attack at advantage."
            }
        ],
        skillProficiencies: [],
        saveProficiencies: [],
        doubleVulnerabilities: [],
        resistances: ['bug', 'fighting', 'fire', 'steel', 'water'],
        doubleResistances: [],
        immunities: ['ground'],
        features: [
            {
                name: "Intimidate",
                description: "Once per short rest, you can impose disadvantage on an enemy attack roll of your choice."
            },
            {
                name: "Moxie (Hidden)",
                description: "Upon causing an opponent to faint, this Pokémon may immediately take another action."
            }
        ],
        skillProficiencies: ['athletics', 'intimidation'],
        saveProficiencies: ['strength', 'constitution'],
        doubleVulnerabilities: [],
        resistances: ['ice', 'water'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Water Absorb",
                description: "Takes no damage from water or water-type attacks. Instead, half of any water damage done is absorbed."
            },
            {
                name: "Shell Armor",
                description: "Immune to extra damage dealt by a Critical Hit."
            },
            {
                name: "Hydration (Hidden)",
                description: "Unaffected by negative status ailments in water or during rainy conditions."
            }
        ],
        skillProficiencies: ['survival', 'persuasion'],
        saveProficiencies: ['strength', 'charisma'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost'],
        features: [
            {
                name: "Limber",
                description: "This Pokémon is immune to being paralyzed."
            },
            {
                name: "Imposter (Hidden)",
                description: "This Pokémon can use Transform as a bonus action."
            }
        ],
        skillProficiencies: ['insight', 'deception'],
        saveProficiencies: ['constitution'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost'],
        features: [
            {
                name: "Run Away",
                description: "Cannot be the target of an attack of opportunity."
            },
            {
                name: "Adaptability",
                description: "When using a move of its own type, may roll damage twice and choose total."
            },
            {
                name: "Anticipation (Hidden)",
                description: "When entering battle, opponent reveals if they have a move Eevee is vulnerable to."
            }
        ],
        skillProficiencies: ['investigation', 'perception'],
        saveProficiencies: ['dexterity', 'charisma'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'ice', 'steel', 'water'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Water Absorb",
                description: "Takes no damage from water or water-type attacks. Instead, half of any water damage done is absorbed."
            },
            {
                name: "Hydration (Hidden)",
                description: "Unaffected by negative status ailments in water or during rainy conditions."
            }
        ],
        skillProficiencies: ['investigation', 'perception'],
        saveProficiencies: ['dexterity', 'charisma'],
        doubleVulnerabilities: [],
        resistances: ['electric', 'flying', 'steel'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Volt Absorb",
                description: "Takes no damage from electricity or electric-type attacks. Instead, half of any electric damage done is absorbed."
            },
            {
                name: "Quick Feet (Hidden)",
                description: "When suffering from a negative status condition, this Pokémon's speed increases by 15 ft."
            }
        ],
        skillProficiencies: ['investigation', 'perception'],
        saveProficiencies: ['dexterity', 'charisma'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'fairy', 'fire', 'grass', 'ice', 'steel'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Flash Fire",
                description: "Takes no damage from fire attacks. Double STAB bonus on next fire-type move after taking fire damage."
            },
            {
                name: "Guts (Hidden)",
                description: "Not affected by burn/poison disadvantage, still takes end-of-turn damage."
            }
        ],
        skillProficiencies: ['investigation', 'perception'],
        saveProficiencies: ['dexterity', 'charisma'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost'],
        features: [
            {
                name: "Trace",
                description: "Copies a random ability of an opponent when entering battle."
            },
            {
                name: "Download",
                description: "Choose a different damage type for one of their normal attacks (once per short rest)."
            },
            {
                name: "Analytic (Hidden)",
                description: "After this Pokémon misses an attack, its next attack is done at advantage."
            }
        ],
        skillProficiencies: ['history'],
        saveProficiencies: ['constitution'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'flying', 'ice', 'normal', 'poison'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Swift Swim",
                description: "Speed doubled in rainy conditions."
            },
            {
                name: "Shell Armor",
                description: "Immune to critical hit extra damage."
            },
            {
                name: "Weak Armor (Hidden)",
                description: "Speed increases by 5ft when hit, AC reduced by 1."
            }
        ],
        skillProficiencies: ['survival'],
        saveProficiencies: ['constitution'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'flying', 'ice', 'normal', 'poison'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Swift Swim",
                description: "Speed doubled in rain."
            },
            {
                name: "Shell Armor",
                description: "Immune to critical hit extra damage."
            },
            {
                name: "Weak Armor (Hidden)",
                description: "Speed +5 when hit, AC -1."
            }
        ],
        skillProficiencies: ['survival', 'intimidation'],
        saveProficiencies: ['constitution'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'flying', 'ice', 'normal', 'poison'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Swift Swim",
                description: "Speed is doubled in rainy conditions."
            },
            {
                name: "Battle Armor",
                description: "Immune to extra damage dealt by a Critical Hit."
            },
            {
                name: "Weak Armor (Hidden)",
                description: "Speed increases by 5 feet, but AC reduced by 1."
            }
        ],
        skillProficiencies: ['survival'],
        saveProficiencies: ['constitution'],
        doubleVulnerabilities: [],
        resistances: ['fire', 'flying', 'ice', 'normal', 'poison'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Swift Swim",
                description: "Speed is doubled in rainy conditions."
            },
            {
                name: "Battle Armor",
                description: "Immune to extra damage dealt by a Critical Hit."
            },
            {
                name: "Weak Armor (Hidden)",
                description: "Speed increases by 5 feet, but AC reduced by 1."
            }
        ],
        skillProficiencies: ['survival', 'intimidation'],
        saveProficiencies: ['constitution'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'fire', 'flying', 'normal', 'poison'],
        doubleResistances: [],
        immunities: ['ground'],
        features: [
            {
                name: "Rock Head",
                description: "This Pokémon takes no recoil damage."
            },
            {
                name: "Pressure",
                description: "Any move targeting this Pokémon directly reduces its PP by two."
            },
            {
                name: "Unnerve (Hidden)",
                description: "Opponents in combat cannot eat held berries."
            }
        ],
        skillProficiencies: ['investigation', 'perception'],
        saveProficiencies: ['strength', 'constitution'],
        doubleVulnerabilities: [],
        resistances: [],
        doubleResistances: [],
        immunities: ['ghost'],
        features: [
            {
                name: "Immunity",
                description: "Immune to becoming poisoned."
            },
            {
                name: "Thick Fat",
                description: "Takes half damage from Ice and Fire."
            },
            {
                name: "Gluttony (Hidden)",
                description: "Must eat held berry when below ½ HP."
            }
        ],
        skillProficiencies: ['survival'],
        saveProficiencies: ['strength', 'constitution'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'grass'],
        doubleResistances: [],
        immunities: ['ground'],
        features: [
            {
                name: "Pressure",
                description: "Any move targeting this Pokémon directly reduces its PP by two when activated."
            },
            {
                name: "Snow Cloak (Hidden)",
                description: "This Pokémon is immune to Hail damage. It's AC is increased by 2 in arctic conditions."
            }
        ],
        skillProficiencies: ['arcana', 'insight', 'intimidation'],
        saveProficiencies: ['dexterity', 'constitution'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'fighting', 'flying', 'grass', 'steel'],
        doubleResistances: [],
        immunities: ['ground'],
        features: [
            {
                name: "Pressure",
                description: "Any move targeting this Pokémon directly reduces its PP by two."
            },
            {
                name: "Static (Hidden)",
                description: "When this Pokémon is hit by a melee attack, roll a d4. On a result of 4, the attacker takes an amount of electric damage."
            }
        ],
        skillProficiencies: ['arcana', 'insight', 'intimidation'],
        saveProficiencies: ['dexterity', 'strength'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'fairy', 'fighting', 'fire', 'grass', 'steel'],
        doubleResistances: [],
        immunities: ['ground'],
        features: [
            {
                name: "Pressure",
                description: "Any move targeting this Pokémon directly reduces its PP by two."
            },
            {
                name: "Flame Body",
                description: "Flames shine dim light in a 15 ft radius. When a creature hits you with a melee attack, they must make a Constitution saving throw or be burned."
            }
        ],
        skillProficiencies: [],
        saveProficiencies: ['intelligence', 'wisdom', 'charisma'],
        doubleVulnerabilities: [],
        resistances: ['electric', 'fire', 'grass', 'water'],
        doubleResistances: [],
        immunities: [],
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
        saveProficiencies: ['wisdom'],
        doubleVulnerabilities: [],
        resistances: ['electric', 'fire', 'grass', 'water'],
        doubleResistances: [],
        immunities: [],
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
        saveProficiencies: ['wisdom'],
        doubleVulnerabilities: [],
        resistances: ['bug', 'fighting', 'fire', 'grass', 'water'],
        doubleResistances: [],
        immunities: ['ground'],
        features: [
            {
                name: "Inner Focus",
                description: "This Pokémon is immune to flinching."
            },
            {
                name: "Multiscale (Hidden)",
                description: "If this Pokémon is at full health, the first damage dealt to it is halved."
            }
        ],
        skillProficiencies: ['arcana', 'athletics'],
        saveProficiencies: ['strength', 'wisdom'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'psychic'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Pressure",
                description: "Any move targeting this Pokémon directly reduces its PP by two."
            },
            {
                name: "Unnerve",
                description: "Prevents opponents from eating held berries."
            }
        ],
        skillProficiencies: [],
        saveProficiencies: ['intelligence', 'wisdom', 'charisma'],
        doubleVulnerabilities: [],
        resistances: ['fighting', 'psychic'],
        doubleResistances: [],
        immunities: [],
        features: [
            {
                name: "Synchronize",
                description: "When you are poisoned, burned, or paralyzed by another creature, that creature is also afflicted with the same condition."
            }
        ],
        skillProficiencies: [],
        saveProficiencies: ['intelligence', 'wisdom', 'charisma'],
        learnset: [
            { level: 1, move: 'Reflect Type' },
            { level: 1, move: 'Pound' },
            { level: 10, move: 'Transform' },
            { level: 20, move: 'Mega Punch' },
            { level: 30, move: 'Metronome' },
            { level: 40, move: 'Psychic' },
            { level: 50, move: 'Barrier' },
            { level: 60, move: 'Ancient Power' },
            { level: 70, move: 'Amnesia' },
            { level: 80, move: 'Me First' },
            { level: 90, move: 'Baton Pass' },
            { level: 100, move: 'Nasty Plot' }
        ]
    }
};

on('chat:message', function(msg) {
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
    
    const characterName = `${pokemonName} #${encounterCounter}`;
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

        // Create default token with linked bars
        setTimeout(() => {
            // Get the attribute IDs for linking
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

            // Create a temporary token to set as default
            const pageId = Campaign().get('playerpageid');
            const tempToken = createObj('graphic', {
                _pageid: pageId,
                _subtype: 'token',
                layer: 'gmlayer',
                left: -9999,
                top: -9999,
                width: 70,
                height: 70,
                name: pokemonName, // Use just the Pokemon name without #1
                imgsrc: characterImage || 'https://s3.amazonaws.com/files.d20.io/images/4095816/086J-nQbyz-9AjWa3DXjYQ/thumb.png?1400535580',
                represents: character.id,
                bar1_link: hpAttr ? hpAttr.id : '',
                bar2_link: acAttr ? acAttr.id : '',
                bar3_link: levelAttr ? levelAttr.id : '',
                showname: false, // Disable nameplate
                showplayers_name: false, // Players can't see nameplate
                playersedit_name: true,
                playersedit_bar1: true,
                playersedit_bar2: false, // Players can't edit AC
                playersedit_bar3: false, // Players can't edit Level
                showplayers_bar1: true,
                showplayers_bar2: false, // Players can't see AC
                showplayers_bar3: false // Players can't see Level
            });

            // Set as default token
            setDefaultTokenForCharacter(character, tempToken);

            // Remove the temporary token
            tempToken.remove();

            // IMMEDIATELY restore attributes in case setDefaultTokenForCharacter corrupted them
            setTimeout(() => {
                const hpCheck = findObjs({_type: 'attribute', _characterid: character.id, name: 'pokemon_hp'})[0];
                const acCheck = findObjs({_type: 'attribute', _characterid: character.id, name: 'pokemon_ac'})[0];
                const levelCheck = findObjs({_type: 'attribute', _characterid: character.id, name: 'pokemon_level'})[0];

                if (!hpCheck || !hpCheck.get('current')) {
                    sendChat('Pokemon System', `/w GM HP was corrupted, restoring...`);
                    if (hpCheck) {
                        hpCheck.set('current', adjustedHP);
                        hpCheck.set('max', adjustedHP);
                    } else {
                        createObj('attribute', {
                            _characterid: character.id,
                            name: 'pokemon_hp',
                            current: adjustedHP,
                            max: adjustedHP
                        });
                    }
                }

                if (!acCheck || !acCheck.get('current')) {
                    sendChat('Pokemon System', `/w GM AC was corrupted, restoring...`);
                    if (acCheck) {
                        acCheck.set('current', adjustedAC);
                    } else {
                        createObj('attribute', {
                            _characterid: character.id,
                            name: 'pokemon_ac',
                            current: adjustedAC
                        });
                    }
                }

                if (!levelCheck || !levelCheck.get('current')) {
                    sendChat('Pokemon System', `/w GM Level was corrupted, restoring...`);
                    if (levelCheck) {
                        levelCheck.set('current', level);
                    } else {
                        createObj('attribute', {
                            _characterid: character.id,
                            name: 'pokemon_level',
                            current: level
                        });
                    }
                }
            }, 50);

            sendChat('Pokemon System', `/w GM Default token configured with linked bars: HP→bar1, AC→bar2, Level→bar3`);
        }, 300);

        let announcement = `&{template:default} {{name=Pokemon Spawned!}} `;
        announcement += `{{Pokemon=${pokemonName}}} {{Level=${level}}} {{HP=${adjustedHP}}} {{Hit Die=${pokemonData.hitDie || 'd6'}}} {{Note=Default token saved with linked bars}}`;
        sendChat('Pokemon System', '/w GM ' + announcement);
        
    }, 100);
}

log('Pokemon Encounter System ready! Use !pokemon-encounter "Route 1" to test.');