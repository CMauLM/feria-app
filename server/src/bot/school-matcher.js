const School = require('../models/School');

// ============================================================================
// Busca escuelas cuyo nombre o alias contenga las palabras del input.
// Devuelve un array de matches ordenados por qué tan bien coinciden.
// ============================================================================
async function searchSchools(inputText) {
  const normalized = School.normalize(inputText);
  const words = normalized.split(' ').filter(w => w.length >= 3);

  if (words.length === 0) return [];

  const regexes = words.map(w => new RegExp(w, 'i'));

  const candidates = await School.find({
    $or: [
      { nameNormalized: { $in: regexes } },
      { aliases: { $in: regexes } }
    ]
  }).limit(20);

  const scored = candidates.map(school => {
    const searchText = school.nameNormalized + ' ' + school.aliases.map(a => School.normalize(a)).join(' ');
    let score = 0;
    for (const word of words) {
      if (searchText.includes(word)) score++;
    }
    return { school, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored;
}

// ============================================================================
// Interpreta el resultado del match:
// - EXACT_MATCH: 1 solo resultado top
// - MULTIPLE_MATCHES: varios candidatos empatados
// - NO_MATCH: no encontró nada
// ============================================================================
async function matchSchool(inputText) {
  const results = await searchSchools(inputText);

  if (results.length === 0) {
    return { type: 'NO_MATCH', matches: [] };
  }

  const topScore = results[0].score;
  const topMatches = results.filter(r => r.score === topScore);

  if (topMatches.length === 1 && topScore >= 1) {
    return { type: 'EXACT_MATCH', matches: [topMatches[0].school] };
  }

  return {
    type: 'MULTIPLE_MATCHES',
    matches: results.slice(0, 3).map(r => r.school)
  };
}

module.exports = { searchSchools, matchSchool };