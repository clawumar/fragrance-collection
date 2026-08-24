// === LAYERING ENGINE v2 ===
// Based on Michael Edwards Fragrance Wheel + note compatibility science
// https://en.wikipedia.org/wiki/Fragrance_wheel

// ---- 1. PROPER NOTE CLASSIFICATION (Fragrance Wheel aligned) ----

// Primary families from the Edwards wheel, in adjacent-ring order
// The wheel: Floral ←(adjacent)→ Amber ←(adjacent)→ Woody ←(adjacent)→ Fresh ←(adjacent)→ Floral
// Adjacent families harmonise naturally. Opposite families clash (e.g. Fresh + Amber needs a bridge).
var WHEEL_ORDER = ['Floral', 'Amber/Oriental', 'Woody', 'Fresh'];

// Each scentProfile keyword → proper wheel family
// This fixes the "everything falls into Fresh" bug
var PROFILE_TO_FAMILY = {
  'Fresh': 'Fresh', 'Citrus': 'Fresh', 'Citrus-forward': 'Fresh',
  'Aromatic': 'Fresh', 'Green': 'Fresh', 'Aquatic': 'Fresh',
  'Marine': 'Fresh', 'Water': 'Fresh', 'Salty': 'Fresh',
  'Icy': 'Fresh', 'Minty': 'Fresh', 'Soapy': 'Fresh', 'Clean': 'Fresh',
  'Tea': 'Fresh', 'Bright': 'Fresh', 'Airy': 'Fresh', 'Zesty': 'Fresh',

  'Woody': 'Woody', 'Oud': 'Woody', 'Leather': 'Woody', 'Leathery': 'Woody',
  'Earthy': 'Woody', 'Smoky': 'Woody', 'Resinous': 'Woody',
  'Musk': 'Woody', 'Musky': 'Woody', 'Metallic': 'Woody', 'Dark': 'Woody',

  'Amber': 'Amber/Oriental', 'Oriental': 'Amber/Oriental',
  'Warm': 'Amber/Oriental', 'Warm Spicy': 'Amber/Oriental',
  'Boozy': 'Amber/Oriental', 'Incense': 'Amber/Oriental',
  'Incense-like': 'Amber/Oriental', 'Resinous': 'Amber/Oriental',
  'Animalic': 'Amber/Oriental', 'Tobacco': 'Amber/Oriental',
  'Honey': 'Amber/Oriental', 'Nutty': 'Amber/Oriental',
  'Cinnamon': 'Amber/Oriental', 'Chypre': 'Amber/Oriental',
  'Spicy': 'Amber/Oriental',

  'Floral': 'Floral', 'White Floral': 'Floral',
  'Floral Fruity': 'Floral', 'Rose': 'Floral', 'Iris': 'Floral',
  'Feminine': 'Floral', 'Powdery': 'Floral',

  'Sweet': 'Gourmand', 'Vanilla': 'Gourmand', 'Vanillic': 'Gourmand',
  'Gourmand': 'Gourmand', 'Creamy': 'Gourmand', 'Cherry': 'Gourmand',
  'Bold': 'Gourmand', 'Tropical': 'Gourmand',
  'Fruity': 'Gourmand', 'Smooth': 'Gourmand'
};

// Gourmand sits between Amber/Oriental and Fresh on the wheel
// So it's adjacent to both

function classifyFamily(f) {
  var sp = (f.scentProfile || []).map(function(p){ return p.trim(); });
  // Score each family based on how many keywords match
  var scores = {'Fresh':0, 'Woody':0, 'Amber/Oriental':0, 'Floral':0, 'Gourmand':0};
  for (var i = 0; i < sp.length; i++) {
    var mapped = PROFILE_TO_FAMILY[sp[i]];
    if (mapped) scores[mapped] += 2;
  }
  // Heuristic overrides for clear signatures
  // Check base notes for deeper classification
  var baseSet = (f.baseNotes || []).map(function(n){ return n.toLowerCase(); });
  var heartSet = (f.heartNotes || []).map(function(n){ return n.toLowerCase(); });

  // Oud/Lather in base → woody boost
  for (var k = 0; k < baseSet.length; k++) {
    var b = baseSet[k];
    if (b.indexOf('oud') >= 0 || b.indexOf('agarwood') >= 0 || b.indexOf('leather') >= 0) scores['Woody'] += 1;
    if (b.indexOf('vanilla') >= 0 || b.indexOf('tonka') >= 0 || b.indexOf('caramel') >= 0 || b.indexOf('praline') >= 0) scores['Gourmand'] += 1;
    if (b.indexOf('incense') >= 0 || b.indexOf('amber') >= 0 || b.indexOf('labdanum') >= 0 || b.indexOf('benzoin') >= 0) scores['Amber/Oriental'] += 1;
  }
  // Citrus in top → fresh boost
  var topSet = (f.topNotes || []).map(function(n){ return n.toLowerCase(); });
  for (var t = 0; t < topSet.length; t++) {
    var tp = topSet[t];
    if (tp.indexOf('bergamot') >= 0 || tp.indexOf('lemon') >= 0 || tp.indexOf('grapefruit') >= 0 || tp.indexOf('citrus') >= 0 || tp.indexOf('orange') >= 0 || tp.indexOf('lime') >= 0 || tp.indexOf('mandarin') >= 0) scores['Fresh'] += 1;
    if (tp.indexOf('mint') >= 0 || tp.indexOf('spearmint') >= 0) scores['Fresh'] += 1;
    if (tp.indexOf('cinnamon') >= 0 || tp.indexOf('cardamom') >= 0 || tp.indexOf('saffron') >= 0) scores['Amber/Oriental'] += 1;
  }
  // Rose/jasmine in heart → floral boost
  for (var h = 0; h < heartSet.length; h++) {
    var ht = heartSet[h];
    if (ht.indexOf('rose') >= 0 || ht.indexOf('jasmine') >= 0 || ht.indexOf('lavender') >= 0 || ht.indexOf('violet') >= 0 || ht.indexOf('peony') >= 0 || ht.indexOf('magnolia') >= 0 || ht.indexOf('geranium') >= 0 || ht.indexOf('iris') >= 0) scores['Floral'] += 1;
  }

  // Find highest scoring family
  var best = 'Fresh', bestScore = 0;
  var fams = ['Fresh','Woody','Amber/Oriental','Floral','Gourmand'];
  for (var f = 0; f < fams.length; f++) {
    if (scores[fams[f]] > bestScore) {
      bestScore = scores[fams[f]];
      best = fams[f];
    }
  }

  return best;
}

// ---- 2. NOTE COMPATIBILITY DATABASE ----
// Real perfume-chemistry-based note pairing rules

// Notes that naturally harmonise together (complementary pairs)
var COMPLEMENTARY_NOTES = {
  'bergamot': ['lavender', 'rose', 'vetiver', 'oakmoss', 'cedar', 'neroli', 'jasmine', 'vanilla', 'amber'],
  'lemon': ['ginger', 'jasmine', 'rose', 'vetiver', 'mint'],
  'grapefruit': ['rosemary', 'juniper', 'cedar', 'mint', 'coriander'],
  'mandarin': ['neroli', 'jasmine', 'sandalwood', 'cinnamon'],
  'orange': ['cinnamon', 'clove', 'vanilla', 'sandalwood', 'jasmine'],
  'lime': ['coconut', 'mint', 'ginger', 'jasmine', 'vetiver'],
  'lavender': ['bergamot', 'cedar', 'vanilla', 'oakmoss', 'sage', 'tonka bean'],
  'rose': ['bergamot', 'vanilla', 'sandalwood', 'patchouli', 'cacao', 'pepper', 'raspberry'],
  'jasmine': ['sandalwood', 'vanilla', 'rose', 'bergamot', 'ylang-ylang', 'cedar'],
  'violet': ['iris', 'raspberry', 'sandalwood', 'musk'],
  'iris': ['violet', 'leather', 'sandalwood', 'vanilla', 'ambrette'],
  'geranium': ['rose', 'bergamot', 'lavender', 'vetiver', 'patchouli'],
  'neroli': ['bergamot', 'jasmine', 'sandalwood', 'musk', 'orange'],
  'ylang-ylang': ['jasmine', 'vanilla', 'sandalwood', 'bergamot'],
  'magnolia': ['bergamot', 'rose', 'sandalwood', 'vanilla'],
  'sandalwood': ['rose', 'jasmine', 'vanilla', 'iris', 'bergamot', 'lavender', 'amber'],
  'cedar': ['bergamot', 'lavender', 'sandalwood', 'vetiver', 'rose', 'amber'],
  'vetiver': ['bergamot', 'lavender', 'cedar', 'lemon', 'neroli'],
  'patchouli': ['rose', 'bergamot', 'sandalwood', 'vanilla', 'incense', 'amber'],
  'oakmoss': ['bergamot', 'lavender', 'sandalwood', 'patchouli'],
  'amber': ['vanilla', 'sandalwood', 'patchouli', 'bergamot', 'rose', 'incense'],
  'vanilla': ['amber', 'sandalwood', 'rose', 'bergamot', 'cinnamon', 'tonka bean', 'coffee', 'caramel', 'benzoin'],
  'tonka bean': ['vanilla', 'amber', 'lavender', 'sandalwood', 'cinnamon'],
  'musk': ['rose', 'jasmine', 'vanilla', 'sandalwood', 'iris', 'amber'],
  'cinnamon': ['vanilla', 'orange', 'clove', 'amber', 'tonka bean', 'apple'],
  'ginger': ['lemon', 'bergamot', 'coriander', 'rose', 'jasmine', 'cardamom'],
  'cardamom': ['ginger', 'cinnamon', 'rose', 'vanilla', 'cedar', 'fig'],
  'clove': ['orange', 'cinnamon', 'vanilla', 'rose', 'nutmeg'],
  'nutmeg': ['clove', 'cinnamon', 'orange', 'sandalwood'],
  'pepper': ['rose', 'vanilla', 'sandalwood', 'iris', 'leather'],
  'incense': ['sandalwood', 'rose', 'amber', 'patchouli', 'oud', 'myrrh'],
  'oud': ['rose', 'sandalwood', 'amber', 'incense', 'saffron', 'leather', 'vanilla'],
  'leather': ['iris', 'sandalwood', 'amber', 'tobacco', 'pepper', 'raspberry'],
  'tobacco': ['vanilla', 'leather', 'amber', 'honey', 'tonka bean', 'dried fruits'],
  'honey': ['tobacco', 'vanilla', 'amber', 'orange', 'rose', 'lavender'],
  'coffee': ['vanilla', 'caramel', 'tonka bean', 'amber', 'patchouli', 'cardamom'],
  'cacao': ['vanilla', 'rose', 'sandalwood', 'bergamot', 'orange'],
  'apple': ['cinnamon', 'vanilla', 'cardamom', 'rose', 'ginger'],
  'pear': ['vanilla', 'musk', 'jasmine', 'sandalwood', 'ginger'],
  'raspberry': ['rose', 'violet', 'vanilla', 'sandalwood', 'leather', 'bergamot'],
  'mango': ['coconut', 'jasmine', 'ginger', 'tonka bean', 'lemon'],
  'pineapple': ['coconut', 'jasmine', 'vanilla', 'bergamot', 'ginger'],
  'coconut': ['lime', 'mango', 'vanilla', 'pineapple', 'jasmine'],
  'fig': ['cardamom', 'coriander', 'sandalwood', 'cedar', 'bergamot'],
  'mint': ['lemon', 'lime', 'ginger', 'lavender', 'bergamot', 'jasmine'],
  'tea': ['bergamot', 'jasmine', 'ginger', 'mint', 'lemon', 'sandalwood'],
  'benzoin': ['vanilla', 'amber', 'sandalwood', 'cinnamon', 'incense'],
  'labdanum': ['amber', 'vanilla', 'incense', 'patchouli', 'sandalwood'],
  'caramel': ['vanilla', 'coffee', 'tonka bean', 'coconut', 'sandalwood'],
  'praline': ['vanilla', 'caramel', 'hazelnut', 'sandalwood', 'tonka bean'],
  'coriander': ['ginger', 'lemon', 'bergamot', 'cardamom', 'rose'],
  'juniper': ['grapefruit', 'rosemary', 'cedar', 'sage', 'bergamot']
};

// Bridge note pairs: notes that can smooth a transition between fragrance families
// e.g. Vanilla bridges 'Fresh' and 'Amber/Oriental' combos, etc.
var BRIDGE_NOTE_FAMILIES = {
  'vanilla': ['Gourmand','Amber/Oriental','Fresh'],
  'bergamot': ['Fresh','Floral','Woody'],
  'sandalwood': ['Woody','Floral','Amber/Oriental'],
  'amber': ['Amber/Oriental','Woody','Gourmand'],
  'tonka bean': ['Gourmand','Amber/Oriental','Fresh'],
  'cedar': ['Woody','Fresh'],
  'rose': ['Floral','Amber/Oriental','Woody'],
  'lavender': ['Fresh','Floral','Woody'],
  'patchouli': ['Woody','Amber/Oriental','Floral'],
  'musk': ['Woody','Floral','Fresh'],
  'iris': ['Floral','Woody'],
  'incense': ['Amber/Oriental','Woody'],
  'cinnamon': ['Amber/Oriental','Gourmand','Fresh']
};

// ---- 3. WHEEL COMPATIBILITY ----
// Based on Michael Edwards Fragrance Wheel adjacency

function wheelDistance(famA, famB) {
  if (famA === famB) return 0;             // Same family — great harmony
  var order = ['Fresh', 'Gourmand', 'Amber/Oriental', 'Woody', 'Floral'];
  var idxA = order.indexOf(famA);
  var idxB = order.indexOf(famB);
  if (idxA === -1 || idxB === -1) return 9; // Unknown

  // Gourmand is special — sits between Fresh and Amber/Oriental
  // So Gourmand+Fresh = 1, Gourmand+Amber/Oriental = 1
  // Gourmand+Woody = 2 (needs bridge), Gourmand+Floral = 2 (needs bridge)
  if (famA === 'Gourmand') {
    if (famB === 'Fresh' || famB === 'Amber/Oriental') return 1;
    return 2;
  }
  if (famB === 'Gourmand') {
    if (famA === 'Fresh' || famA === 'Amber/Oriental') return 1;
    return 2;
  }

  var diff = Math.abs(idxA - idxB);
  if (diff === 1) return 1;   // Adjacent on wheel — natural harmony
  if (diff === 2) return 2;   // Skip one — needs a bridge note
  if (diff === 3) return 3;   // Two steps — challenging
  return 4;                   // Opposite — clash risk
}

// ---- 4. NOTE OVERLAP SCORING ----
// How many shared or complementary notes do two fragrances share?

function getAllNotes(f) {
  var notes = {};
  (f.topNotes || []).forEach(function(n){ notes[n.toLowerCase().trim()] = 'top'; });
  (f.heartNotes || []).forEach(function(n){ notes[n.toLowerCase().trim()] = 'heart'; });
  (f.baseNotes || []).forEach(function(n){ notes[n.toLowerCase().trim()] = 'base'; });
  return Object.keys(notes);
}

function getNoteSet(f) {
  var set = {};
  (f.topNotes || []).forEach(function(n){ set[n.toLowerCase().trim()] = true; });
  (f.heartNotes || []).forEach(function(n){ set[n.toLowerCase().trim()] = true; });
  (f.baseNotes || []).forEach(function(n){ set[n.toLowerCase().trim()] = true; });
  return Object.keys(set);
}

function scoreNoteOverlap(a, b) {
  var aNotes = getNoteSet(a);
  var bNotes = getNoteSet(b);

  // Shared notes
  var shared = 0;
  for (var i = 0; i < aNotes.length; i++) {
    for (var j = 0; j < bNotes.length; j++) {
      if (aNotes[i] === bNotes[j]) shared++;
    }
  }

  // Complementary notes
  var complementary = 0;
  for (var i = 0; i < aNotes.length; i++) {
    var comps = COMPLEMENTARY_NOTES[aNotes[i]];
    if (comps) {
      for (var j = 0; j < bNotes.length; j++) {
        if (comps.indexOf(bNotes[j]) >= 0 && aNotes[i] !== bNotes[j]) complementary++;
      }
    }
  }

  // Bridge notes across families
  var aFam = classifyFamily(a);
  var bFam = classifyFamily(b);
  var bridgeScore = 0;
  if (aFam !== bFam) {
    for (var i = 0; i < aNotes.length; i++) {
      var bridgeFams = BRIDGE_NOTE_FAMILIES[aNotes[i]];
      if (bridgeFams && bridgeFams.indexOf(bFam) >= 0) bridgeScore += 2;
    }
    for (var j = 0; j < bNotes.length; j++) {
      var bridgeFams2 = BRIDGE_NOTE_FAMILIES[bNotes[j]];
      if (bridgeFams2 && bridgeFams2.indexOf(aFam) >= 0) bridgeScore += 2;
    }
  }

  return {
    shared: shared,
    complementary: complementary,
    bridge: bridgeScore,
    total: shared * 3 + complementary * 2 + bridgeScore
  };
}

// ---- 5. COMPATIBILITY RATING ----
// Produces a human-readable explanation

function getLayerReason(a, b, famA, famB, overlap) {
  // Strong shared notes
  if (overlap.shared >= 2) {
    return 'They share ' + overlap.shared + ' notes in common — that\'s the perfumer\'s handshake. The overlap creates a seamless blend rather than a clash.';
  }
  if (overlap.shared >= 1 && overlap.complementary >= 2) {
    return overlap.a + ' shares ' + overlap.shared + ' note(s) with ' + overlap.b + ', plus ' + overlap.complementary + ' complementary supporting notes. Like a chord, the shared note anchors while the complements add colour.';
  }

  // Same family + good complementary
  if (famA === famB && overlap.complementary >= 2) {
    return 'Both are ' + famA + ' fragrances with ' + overlap.complementary + ' complementary note pairs. Staying within the same fragrance family means they speak the same olfactory language.';
  }
  if (famA === famB && overlap.complementary >= 1) {
    return 'Two ' + famA + ' fragrances that harmonise — same family means their note languages are naturally compatible. The complementary notes help them weave together.';
  }

  // Adjacent families
  var dist = wheelDistance(famA, famB);
  if (dist === 0) {
    return 'Both fragrances belong to the ' + famA + ' family. Layering within the same family is the safest bet — they naturally share olfactory DNA.';
  }
  if (dist === 1) {
    var bridgeExplainer = overlap.bridge > 0 ? ' Bridge notes help them transition smoothly.' : '';
    return famA + ' and ' + famB + ' are adjacent on the fragrance wheel — they naturally complement each other.' + bridgeExplainer;
  }
  if (dist === 2) {
    if (overlap.bridge > 0) {
      return famA + ' and ' + famB + ' are a step apart on the fragrance wheel, but they have bridge notes (like ' + getBridgeNoteExamples(a, b, famA, famB) + ') that help connect them gracefully.';
    }
    return famA + ' and ' + famB + ' are a step apart on the fragrance wheel, requiring intentional pairing. The heavier one anchors, the lighter one accents.';
  }

  // Default fallback for more distant matches
  if (overlap.bridge > 0) {
    return 'Despite their distance on the fragrance wheel, shared bridge notes (' + getBridgeNoteExamples(a, b, famA, famB) + ') create an unexpected but interesting connection.';
  }
  return 'An unexpected pairing that needs careful handling. Spray the heavier one as a base, then use the lighter one sparingly on top.';
}

function getBridgeNoteExamples(a, b, famA, famB) {
  var aNotes = getNoteSet(a);
  var bNotes = getNoteSet(b);
  var examples = [];
  for (var i = 0; i < aNotes.length; i++) {
    var bf = BRIDGE_NOTE_FAMILIES[aNotes[i]];
    if (bf && bf.indexOf(famB) >= 0) {
      if (examples.indexOf(aNotes[i]) < 0) examples.push(aNotes[i]);
    }
  }
  for (var j = 0; j < bNotes.length; j++) {
    var bf2 = BRIDGE_NOTE_FAMILIES[bNotes[j]];
    if (bf2 && bf2.indexOf(famA) >= 0) {
      if (examples.indexOf(bNotes[j]) < 0) examples.push(bNotes[j]);
    }
  }
  return examples.slice(0, 3).join(', ') || 'vanilla or citrus';
}

function getLayeringDirection(a, b) {
  // Determine which should be base (heavier/longer projecting) and which top (lighter/brighter)
  var weightOrder = ['Beast','Excellent','Good','Moderate','Weak'];
  var aW = weightOrder.indexOf(a.longevity) >= 0 ? weightOrder.indexOf(a.longevity) : 9;
  var bW = weightOrder.indexOf(b.longevity) >= 0 ? weightOrder.indexOf(b.longevity) : 9;

  // Also check sillage
  var silOrder = ['Beast','Heavy','Strong','Good','Moderate','Intimate'];
  var aS = silOrder.indexOf(a.sillage) >= 0 ? silOrder.indexOf(a.sillage) : 9;
  var bS = silOrder.indexOf(b.sillage) >= 0 ? silOrder.indexOf(b.sillage) : 9;

  var aScore = aW + aS;
  var bScore = bW + bS;

  if (aScore < bScore) return { base: a, top: b, baseId: null, topId: null };
  return { base: b, top: a, baseId: null, topId: null };
}

// ---- 6. MAIN LAYERING ALGORITHM ----
// Score-based: finds best-matching pair using all criteria above

function rateLayerPair(aId, bId) {
  var a = DB.fragrances[aId], b = DB.fragrances[bId];
  if (!a || !b) return null;

  var famA = classifyFamily(a);
  var famB = classifyFamily(b);
  var dist = wheelDistance(famA, famB);
  var overlap = scoreNoteOverlap(a, b);
  var direction = getLayeringDirection(a, b);

  // Total score: lower = better
  // dist(0-4), note overlap(total), same family bonus, bridge bonus
  var score = dist * 3;                    // Wheel adjacency
  score -= Math.min(overlap.total, 10);    // Negative = good overlap
  if (famA === famB) score -= 2;           // Same family bonus
  score += (overlap.bridge > 0 ? -1 : 2);   // Bridge notes help

  return {
    base: direction.base,
    top: direction.top,
    baseId: aId === direction.base ? aId : bId,
    topId: bId === direction.top ? bId : aId,
    reason: getLayerReason(a, b, famA, famB, overlap),
    score: score,
    famA: famA,
    famB: famB,
    notes: overlap
  };
}

function generateLayerCombo() {
  var ids = Object.keys(DB.fragrances);
  var best = null;

  // Try many random pairs, keep the best-scoring
  for (var attempt = 0; attempt < 200; attempt++) {
    var aId = ids[Math.floor(Math.random() * ids.length)];
    var bId = ids[Math.floor(Math.random() * ids.length)];
    if (aId === bId) continue;
    var result = rateLayerPair(aId, bId);
    if (!result) continue;
    if (!best || result.score < best.score) best = result;
  }

  if (best) return best;

  // Fallback
  var aId = ids[Math.floor(Math.random() * ids.length)];
  var bId = ids[Math.floor(Math.random() * ids.length)];
  if (aId === bId) bId = ids[(ids.indexOf(aId)+1) % ids.length];
  var a = DB.fragrances[aId], b = DB.fragrances[bId];
  return { base: a, top: b, baseId: aId, topId: bId,
    reason: 'An unexpected pairing. The heavier one should anchor, the lighter one accents. Start with 2:1 ratio.',
    score: 99 };
}

function generateLayerComboFor(fixedId) {
  var fixed = DB.fragrances[fixedId];
  if (!fixed) return generateLayerCombo();

  var ids = Object.keys(DB.fragrances);
  var best = null;

  for (var attempt = 0; attempt < 200; attempt++) {
    var partnerId = ids[Math.floor(Math.random() * ids.length)];
    if (partnerId === fixedId) continue;
    var result = rateLayerPair(fixedId, partnerId);
    if (!result) continue;
    if (!best || result.score < best.score) {
      best = result;
      best.locked = fixedId;
    }
  }

  if (best) return best;

  // Fallback
  var partnerId = ids[0];
  if (partnerId === fixedId) partnerId = ids[1];
  var partner = DB.fragrances[partnerId];
  return { base: fixed, top: partner, baseId: fixedId, topId: partnerId,
    reason: 'An unexpected pairing that just works. Spray the heavier one first, then layer lightly.',
    score: 99, locked: fixedId };
}

// ---- 7. RENDER FUNCTIONS ----

function renderLayer(){
  document.getElementById('mobilePicks').innerHTML = '';
  var combo = generateLayerCombo();
  renderLayerCombo(combo);
}

function renderLayerCombo(combo){
  var div = document.getElementById('layerCombo');
  div.style.display = 'block';

  // Score quality badge
  var badge = '';
  if (combo.score <= -5) badge = '<span style="background:#065f46;color:#6ee7b7;padding:2px 8px;border-radius:10px;font-size:.65rem;font-weight:600">🔥 Excellent Match</span>';
  else if (combo.score <= 0) badge = '<span style="background:#1e3a5f;color:#93c5fd;padding:2px 8px;border-radius:10px;font-size:.65rem;font-weight:600">✅ Good Match</span>';
  else if (combo.score <= 5) badge = '<span style="background:#422006;color:#fde68a;padding:2px 8px;border-radius:10px;font-size:.65rem;font-weight:600">⚠️ Experimental</span>';
  else badge = '<span style="background:#3b0f0f;color:#fca5a5;padding:2px 8px;border-radius:10px;font-size:.65rem;font-weight:600">🫗 Bold Pairing</span>';

  div.innerHTML = '<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:12px;margin-bottom:10px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
      '<div style="font-size:.85rem;font-weight:700;color:#6366f1">🎲 Layering Combo</div>' +
      badge +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:8px">' +
      '<div style="flex:1;background:#111;border:1px solid #333;border-radius:8px;padding:8px;text-align:center">' +
        '<span style="color:#888;font-size:.6rem;text-transform:uppercase;letter-spacing:.5px">BASE</span>' +
        '<div style="color:#fff;font-weight:600;font-size:.85rem">' + combo.base.name + '</div>' +
        '<div style="color:#818cf8;font-size:.75rem">' + combo.base.brand + '</div>' +
        '<div style="color:#555;font-size:.65rem;margin-top:2px">⚡' + (combo.base.longevity||'') + ' · ' + (combo.base.sillage||'') + '</div>' +
      '</div>' +
      '<div style="flex:1;background:#111;border:1px solid #333;border-radius:8px;padding:8px;text-align:center">' +
        '<span style="color:#888;font-size:.6rem;text-transform:uppercase;letter-spacing:.5px">TOP</span>' +
        '<div style="color:#fff;font-weight:600;font-size:.85rem">' + combo.top.name + '</div>' +
        '<div style="color:#818cf8;font-size:.75rem">' + combo.top.brand + '</div>' +
        '<div style="color:#555;font-size:.65rem;margin-top:2px">⚡' + (combo.top.longevity||'') + ' · ' + (combo.top.sillage||'') + '</div>' +
      '</div>' +
    '</div>' +
    '<div style="background:#1e1b4b;color:#c7d2fe;padding:10px;border-radius:8px;font-size:.78rem;margin-bottom:6px;line-height:1.5">💡 ' + combo.reason + '</div>' +
    '<div style="display:flex;gap:2px;font-size:.65rem;color:#555;margin-bottom:6px;justify-content:center">' +
      '<span>🏷️ ' + (combo.famA||'?') + '</span><span style="color:#333"> + </span><span>🏷️ ' + (combo.famB||'?') + '</span>' +
      (combo.notes ? '<span style="color:#333"> · </span><span>🔗 ' + combo.notes.shared + ' shared · ' + combo.notes.complementary + ' complementary</span>' : '') +
    '</div>' +
    '<button onclick="renderLayer()" style="width:100%;padding:10px;background:#6366f1;border:none;color:#fff;border-radius:8px;font-size:.85rem;font-weight:600;cursor:pointer">🔀 Shuffle Another Combo</button>' +
  '</div>';
}

function showLayerFit(fragId){
  mobileMode = 'layer';
  document.querySelectorAll('.mode-btn').forEach(function(b){
    b.classList.toggle('active', b.dataset.mode === 'layer');
  });
  document.getElementById('layerCombo').style.display = 'block';
  var combo = generateLayerComboFor(fragId);
  renderLayerCombo(combo);
}