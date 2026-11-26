// POST /api/extract { text, district }
// State-Wide Tamil Nadu Emergency Dispatch Extractor
// Supports all 38 districts (Chennai, Cuddalore, Thoothukudi, Tirunelveli, Nagapattinam, Kanyakumari, Madurai, Coimbatore, etc.)

const TN_GAZETTEER = require('../data/gazetteer_all_tn.json');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const text = String((req.body && req.body.text) || '').trim();
  const selectedDistrict = req.body && req.body.district ? req.body.district : 'ALL';
  if (!text) return res.status(400).json({ error: 'Message text required' });

  const t = text.toLowerCase();
  const isTamil = /[\u0B80-\u0BFF]/.test(text);
  const isTanglish = /\b(la|irukku|irukkom|illa|pannunga|veedu|thanni)\b/i.test(text);

  // 1. STATE-WIDE MULTI-DISTRICT GAZETTEER MATCHING
  let matchedLoc = null;
  // Match location within specific district if chosen, else search all Tamil Nadu
  const candidates = selectedDistrict && selectedDistrict !== 'ALL'
    ? TN_GAZETTEER.filter(g => g.dist.toLowerCase() === selectedDistrict.toLowerCase())
    : TN_GAZETTEER;
  const findMatch = list => list.find(g => {
    const terms = [g.name, g.dist, ...(g.aliases || [])].filter(Boolean);
    return terms.some(term => t.includes(String(term).toLowerCase())) || (g.ta && text.includes(g.ta));
  });
  matchedLoc = findMatch(candidates) || findMatch(TN_GAZETTEER);
  if (!matchedLoc) matchedLoc = {dist: selectedDistrict && selectedDistrict !== 'ALL' ? selectedDistrict : 'Tamil Nadu', name: 'Location needs officer verification', ta: '', lat: null, lon: null};

  // 2. NEED CLASSIFICATION
  let need = 'rescue';
  if (/dialysis|ambulance|medic|insulin|மருத்துவ|நோயாளி/i.test(t)) need = 'medical';
  else if (/drinking water|clean water|thanni illa|குடிநீர்/i.test(t)) need = 'water';
  else if (/food|milk|bread|formula|ரொட்டி|பால்|உணவு/i.test(t)) need = 'food';
  else if (/shelter|stay|camp|முகாம்|தங்கு/i.test(t)) need = 'shelter';

  // 3. VULNERABILITY FLAGS
  const isPregnant = /pregnant|கர்ப்பிணி/i.test(t);
  const isInfant = /baby|infant|child|குழந்தை/i.test(t);
  const isElderly = /elderly|old|senior|முதிய/i.test(t);
  const isBedridden = /bedridden|dialysis|oxygen|படுக்கை/i.test(t);
  const hasVulnerable = isPregnant || isInfant || isElderly || isBedridden;

  // 4. WATER-DEPTH SEVERITY SCALING
  let waterDepthPoints = 0;
  let waterDepthLabel = 'Inundation Reported';
  if (/neck deep|rooftop|roof|மொட்டை மாடி|மாடி/i.test(t)) {
    waterDepthPoints = 25;
    waterDepthLabel = 'Critical Depth: Rooftop/Neck-Deep (+25)';
  } else if (/chest deep|waist deep|5 feet|4 feet|4 அடி|5 அடி/i.test(t)) {
    waterDepthPoints = 18;
    waterDepthLabel = 'Severe Depth: Waist/Chest-Deep (+18)';
  } else if (/knee deep|ankle deep|முழங்கால்/i.test(t)) {
    waterDepthPoints = 8;
    waterDepthLabel = 'Moderate Inundation: Knee-Deep (+8)';
  }

  // 5. NIGHT-TIME RESCUE HAZARD MULTIPLIER (19:00 - 05:00 IST)
  const now = new Date();
  const currentHourIST = (now.getUTCHours() + 5 + (now.getUTCMinutes() + 30 >= 60 ? 1 : 0)) % 24;
  const isNightTime = currentHourIST >= 19 || currentHourIST < 5;
  const nightRiskBonus = isNightTime ? 10 : 0;

  // 6. LAST-GASP BATTERY SIGNAL (4% - 5%)
  const isLowBattery = /battery|பேட்டரி|4%|5%|power cut|dead/i.test(t);
  const batteryBonus = isLowBattery ? 12 : 0;

  // 7. PEOPLE COUNT SCALING
  const countMatch = text.match(/\b(\d+)\s*(?:people|persons|members|பேர்)?\b/);
  const people = countMatch ? Math.min(50, Math.max(1, parseInt(countMatch[1]))) : (/5/.test(t) ? 5 : 2);
  const peoplePoints = Math.min(15, people * 2);

  const isLifeThreat = /தண்ணீர் வருகிறது|drown|trapped|rising fast|உயிருக்கு ஆபத்து|urgent|boat/i.test(t);
  let baseScore = 20;
  if (isLifeThreat) baseScore += 35;
  if (hasVulnerable) baseScore += 20;

  const totalScore = Math.min(99, Math.max(10, 
    baseScore + waterDepthPoints + nightRiskBonus + batteryBonus + peoplePoints
  ));

  res.json({
    engine: 'ResQLink Tamil Nadu State Engine · 38-district gazetteer',
    extracted: {
      district: matchedLoc.dist,
      loc: `${matchedLoc.name} (${matchedLoc.dist})`,
      lat: matchedLoc.lat,
      lon: matchedLoc.lon,
      need,
      n: people,
      vul: hasVulnerable,
      life: isLifeThreat,
      isNightTime,
      waterDepthLabel,
      hasLowBattery: isLowBattery,
      priority_score: totalScore
    }
  });
};
