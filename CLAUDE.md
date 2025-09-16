# Claude Code Instructions for Pokemon 5e Project

## Project Overview
This is a Pokemon 5e D&D homebrew project with two main files:
- `script.js` - Complete Pokemon database with stats, movesets, features, and proficiencies
- `sheet.html` - Character sheet with Pokemon database (movesets only) and move definitions

## File Structure

### script.js
Contains the complete Pokemon database with:
- Basic stats (HP, AC, stats, speed, type, size, SR)
- **Complete movesets** with level progression
- **Features** (abilities like "Overgrow", "Torrent", etc.)
- **Skill and save proficiencies**
- Image URLs

#### Features Format
```javascript
features: [
    {
        name: "Ability Name",
        description: "Detailed description of what the ability does in D&D terms."
    },
    {
        name: "Hidden Ability (Hidden)",
        description: "Description of hidden ability."
    }
],
```

#### Proficiencies Format
```javascript
skillProficiencies: ['athletics', 'nature', 'stealth'], // D&D skill names
saveProficiencies: ['strength', 'constitution'] // D&D save names
```

#### Hit Die Pattern
**ALWAYS get hitDie from the Pokemon's poke5e.app page:**
- Look for "Hit Dice" information in the stats section
- Common values: d6, d8, d10, d12
- **DO NOT guess based on size** - always check the website
- Example: https://poke5e.app/pokemon/pidgeot shows "Hit Dice: d12"

**Common Features by Type:**
- **Grass starters:** Overgrow, Chlorophyll (Hidden)
- **Fire starters:** Blaze, Solar Power (Hidden)
- **Water starters:** Torrent, Rain Dish (Hidden)
- **Flying types:** Often have Keen Eye, Big Pecks
- **Poison types:** Often have Poison Point, Poison Touch
- **Zubat line:** Inner Focus, Infiltrator (Hidden)

### sheet.html
Contains:
- **pokemonDatabase** (movesets only, NO features/proficiencies)
- **moveDatabase** with complete move definitions including:
  - PP, power, damage scaling by level
  - Time, range, type
  - Descriptions

## Important Rules

1. **Features and proficiencies ONLY go in script.js, NEVER in sheet.html**
2. **Movesets should be consistent between both files**
3. **When adding new moves, always add definitions to moveDatabase in sheet.html**
4. **Always update both files when changing Pokemon movesets**

## Move Data Source
**ALWAYS use https://poke5e.app/ for accurate Pokemon 5e movesets.**

### Critical Guidelines:
1. **Level Cap**: Only include moves up to level 18 maximum
2. **Exact Movesets**: Use WebFetch tool to get precise move list from poke5e.app
3. **URL Format**: https://poke5e.app/pokemon/[pokemon-name-lowercase]
4. **Verify Levels**: Double-check move levels match the website exactly

### Type Effectiveness System
**ALWAYS include all four type effectiveness arrays:**
```javascript
vulnerabilities: ['types that deal 2x damage'],
doubleVulnerabilities: ['types that deal 4x damage'],
resistances: ['types that deal 0.5x damage'],
doubleResistances: ['types that deal 0.25x damage'],
immunities: ['types that deal 0x damage']
```

### Type Effectiveness Quick Reference:
**Bug/Poison types (Weedle line):**
- vulnerabilities: ['fire', 'flying', 'psychic', 'rock']
- doubleVulnerabilities: []
- resistances: ['bug', 'poison', 'fairy']
- doubleResistances: ['grass', 'fighting']
- immunities: []

**Bug/Flying types (Butterfree):**
- vulnerabilities: ['fire', 'electric', 'ice', 'flying']
- doubleVulnerabilities: ['rock']
- resistances: ['bug']
- doubleResistances: ['grass', 'fighting']
- immunities: ['ground']

**Dual-type math**: Multiply effectiveness together (0.5 × 0.5 = 0.25 = double resistance)

## Complete Type Effectiveness Chart

### Normal Type
- **Vulnerable to**: Fighting
- **Resists**: None
- **Immune to**: None
- **Can't affect**: Ghost

### Fire Type
- **Vulnerable to**: Water, Ground, Rock
- **Resists**: Fire, Grass, Ice, Bug, Steel, Fairy
- **Immune to**: None

### Water Type
- **Vulnerable to**: Electric, Grass
- **Resists**: Fire, Water, Ice, Steel
- **Immune to**: None

### Electric Type
- **Vulnerable to**: Ground
- **Resists**: Electric, Flying, Steel
- **Immune to**: None

### Grass Type
- **Vulnerable to**: Fire, Ice, Poison, Flying, Bug
- **Resists**: Water, Electric, Grass, Ground
- **Immune to**: None

### Ice Type
- **Vulnerable to**: Fire, Fighting, Rock, Steel
- **Resists**: Ice
- **Immune to**: None

### Fighting Type
- **Vulnerable to**: Flying, Psychic, Fairy
- **Resists**: Bug, Rock, Dark
- **Immune to**: None
- **Can't affect**: Ghost

### Poison Type
- **Vulnerable to**: Ground, Psychic
- **Resists**: Grass, Fighting, Poison, Bug, Fairy
- **Immune to**: None
- **Can't affect**: Steel

### Ground Type
- **Vulnerable to**: Water, Grass, Ice
- **Resists**: Poison, Rock
- **Immune to**: Electric
- **Can't affect**: Flying

### Flying Type
- **Vulnerable to**: Electric, Ice, Rock
- **Resists**: Grass, Fighting, Bug
- **Immune to**: Ground

### Psychic Type
- **Vulnerable to**: Bug, Ghost, Dark
- **Resists**: Fighting, Psychic
- **Immune to**: None
- **Can't affect**: Dark

### Bug Type
- **Vulnerable to**: Fire, Flying, Rock
- **Resists**: Grass, Fighting, Ground
- **Immune to**: None

### Rock Type
- **Vulnerable to**: Water, Grass, Fighting, Ground, Steel
- **Resists**: Normal, Fire, Poison, Flying
- **Immune to**: None

### Ghost Type
- **Vulnerable to**: Ghost, Dark
- **Resists**: Poison, Bug
- **Immune to**: Normal, Fighting
- **Can't affect**: Normal

### Dragon Type
- **Vulnerable to**: Ice, Dragon, Fairy
- **Resists**: Fire, Water, Electric, Grass
- **Immune to**: None

### Dark Type
- **Vulnerable to**: Fighting, Bug, Fairy
- **Resists**: Ghost, Dark
- **Immune to**: Psychic

### Steel Type
- **Vulnerable to**: Fire, Fighting, Ground
- **Resists**: Normal, Grass, Ice, Flying, Psychic, Bug, Rock, Dragon, Steel, Fairy
- **Immune to**: Poison

### Fairy Type
- **Vulnerable to**: Poison, Steel
- **Resists**: Fighting, Bug, Dark
- **Immune to**: Dragon

## Dual-Type Effectiveness Examples

### How to Calculate:
1. Look up each type's effectiveness against the attacking type
2. Multiply the effectiveness values together:
   - 2x (vulnerable) × 2x (vulnerable) = **4x (doubleVulnerabilities)**
   - 2x (vulnerable) × 0.5x (resist) = 1x (neutral)
   - 0.5x (resist) × 0.5x (resist) = **0.25x (doubleResistances)**
   - 0x (immune) × anything = **0x (immunities)**

### Common Dual-Type Examples:

**Bug/Poison (Weedle line)**:
- vs Grass: Bug resists (0.5x) + Poison resists (0.5x) = **0.25x doubleResistances**
- vs Fighting: Bug resists (0.5x) + Poison resists (0.5x) = **0.25x doubleResistances**
- vs Fire: Bug weak (2x) + Poison neutral (1x) = **2x vulnerabilities**

**Bug/Flying (Butterfree)**:
- vs Rock: Bug weak (2x) + Flying weak (2x) = **4x doubleVulnerabilities**
- vs Fighting: Bug resists (0.5x) + Flying resists (0.5x) = **0.25x doubleResistances**
- vs Ground: Bug neutral (1x) + Flying immune (0x) = **0x immunities**

**Fire/Flying (Charizard)**:
- vs Rock: Fire weak (2x) + Flying weak (2x) = **4x doubleVulnerabilities**
- vs Grass: Fire resists (0.5x) + Flying neutral (1x) = **0.5x resistances**

**Water/Ground (Quagsire)**:
- vs Grass: Water weak (2x) + Ground weak (2x) = **4x doubleVulnerabilities**
- vs Electric: Water weak (2x) + Ground immune (0x) = **0x immunities**

## Common Tasks

### Adding a New Pokemon
1. Add to script.js with complete data (stats, moveset, features, proficiencies)
2. Add to sheet.html pokemonDatabase (moveset only)
3. Add any new move definitions to moveDatabase in sheet.html

### Updating Movesets
1. **FIRST**: Use WebFetch tool on https://poke5e.app/pokemon/[pokemon-name-lowercase]
2. **VERIFY**: Check levels don't exceed 18
3. Update script.js learnset array with exact moves and levels
4. Update sheet.html pokemonDatabase learnset array (identical to script.js)
5. Add any missing move definitions to moveDatabase
6. **CRITICAL**: Update type effectiveness arrays using dual-type calculations

### Move Definition Format
```javascript
'Move Name': {
    pp: 15,
    power: 'STR/DEX/INT', // or '' for status moves
    damage: [ // omit for status moves
        { level: 1, damage: '1d6' },
        { level: 5, damage: '2d6' },
        { level: 10, damage: '3d6' },
        { level: 17, damage: '4d6' }
    ],
    time: 'action/bonus action/reaction',
    range: '5 feet/60 feet/self/etc',
    type: 'Fire/Water/Grass/etc',
    description: 'Move description with D&D mechanics'
}
```

## Completed Pokemon
The following Pokemon have been fully updated with complete movesets to level 18:

**Starter Lines:**
- Bulbasaur line (Bulbasaur, Ivysaur, Venusaur)
- Squirtle line (Squirtle, Wartortle, Blastoise)
- Charmander line (Charmander, Charmeleon, Charizard)

**Bug Lines:**
- Caterpie line (Caterpie, Metapod, Butterfree)
- Weedle line (Weedle, Kakuna, Beedrill)

**Other:**
- Golbat (has complete moveset and features/proficiencies)

## Lint/Build Commands
- Check README or ask user for specific lint/typecheck commands
- Always run linting after significant changes

## Notes
- Pokemon numbering follows Pokedex order with comments (// 1, // 2, etc.)
- Use exact move names from poke5e.app
- Maintain consistent formatting and indentation
- Status moves have damage: '0' and no damage array