const getStatBonus = (temperament, stat) => {
  const bonuses = {
    timid:     { speed: 2, defense: -2 },
    bold:      { defense: 2, attack: -2 },
    jolly:     { speed: 2, spatk: -2 },
    modest:    { spatk: 2, attack: -2 },
    naughty:   { attack: 2, spdef: -2 },
    calm:      { spdef: 2, attack: -2 },
  };
  return (bonuses[temperament] && bonuses[temperament][stat]) || 0;
};

on("change:level change:temperament", function() {
  getAttrs(["level", "temperament"], function(values) {
    const level = parseInt(values.level) || 1;
    const temperament = values.temperament || "modest";

    const hp = 30 + (level * 3);
    const attack = 10 + level + getStatBonus(temperament, "attack");
    const defense = 8 + level + getStatBonus(temperament, "defense");
    const spatk = 12 + level + getStatBonus(temperament, "spatk");
    const spdef = 10 + level + getStatBonus(temperament, "spdef");
    const speed = 18 + (level * 2) + getStatBonus(temperament, "speed");

    setAttrs({
      hp: hp,
      attack: attack,
      defense: defense,
      spatk: spatk,
      spdef: spdef,
      speed: speed
    });
  });
});