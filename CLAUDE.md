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
Use https://poke5e.app/ for accurate Pokemon 5e movesets. The site provides:
- Starting moves
- Level progression moves up to level 18
- TM compatibility

## Common Tasks

### Adding a New Pokemon
1. Add to script.js with complete data (stats, moveset, features, proficiencies)
2. Add to sheet.html pokemonDatabase (moveset only)
3. Add any new move definitions to moveDatabase in sheet.html

### Updating Movesets
1. Fetch moveset from https://poke5e.app/pokemon/[pokemon-name]
2. Update script.js learnset array
3. Update sheet.html pokemonDatabase learnset array
4. Add any missing move definitions to moveDatabase

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