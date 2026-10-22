// Content-based matching: compares the user's skin profile with each
// product's attributes and returns a score plus human-readable reasons.
import { PRODUCTS, CATEGORIES } from '../data/products';

const DRYING = ['benzoyl peroxide', 'salicylic acid', 'adapalene'];

export const WEIGHTS = {
  skinType: 3, // product made for this skin type
  concern: 4, // product targets the predicted acne level (scaled by probability)
  actives: 1.5, // active ingredients when acne is likely
  gentleBonus: 1, // sensitive users get a boost for gentle products
  harshPenalty: 2.5, // sensitive users get a penalty for non-gentle products
  overkillPenalty: 2, // strong actives when skin is mostly clear
  dryingPenalty: 1.5, // drying actives on dry skin
};

/**
 * @param product  an item from PRODUCTS
 * @param profile  { skinType: 'oily'|'dry'|'normal'|'combination',
 *                   concernProbs: { clear, mild, moderate },
 *                   sensitive: boolean }
 */
export function scoreProduct(product, profile) {
  const reasons = [];
  let score = 0;
  const type = profile.skinType;
  const probs = profile.concernProbs || { clear: 1, mild: 0, moderate: 0 };

  // 1) Skin type match (combination skin also fits oily/normal products)
  const typeFits =
    product.skinTypes.includes(type) ||
    (type === 'combination' && product.skinTypes.includes('oily'));
  if (typeFits) {
    score += WEIGHTS.skinType;
    reasons.push(`Suits ${type} skin`);
  }

  // 2) Concern match, weighted by the model's confidence in each level.
  //    Divided by sqrt(#levels) so targeted products beat "fits everything" ones.
  const concernFit =
    product.concerns.reduce((sum, level) => sum + (probs[level] || 0), 0) /
    Math.sqrt(product.concerns.length || 1);
  score += WEIGHTS.concern * concernFit;
  const top = Object.keys(probs).reduce((a, b) => (probs[a] >= probs[b] ? a : b));
  if (product.concerns.includes(top)) {
    reasons.push(top === 'clear' ? 'Keeps clear skin balanced' : `Targets ${top} acne`);
  }

  // 2b) Acne-fighting actives when breakouts are likely
  const acneProb = (probs.mild || 0) + (probs.moderate || 0);
  if (product.strength >= 1 && acneProb > 0.5) {
    score += WEIGHTS.actives * acneProb;
    reasons.push('Has acne-fighting ingredients');
  }

  // 3) Sensitivity
  if (profile.sensitive) {
    if (product.gentle) {
      score += WEIGHTS.gentleBonus;
      reasons.push('Gentle for sensitive skin');
    } else {
      score -= WEIGHTS.harshPenalty;
    }
  }

  // 4) Don't over-treat mostly clear skin
  if (product.strength >= 2 && (probs.clear || 0) > 0.6) score -= WEIGHTS.overkillPenalty;

  // 5) Drying actives on dry skin
  const drying = product.actives.some((a) => DRYING.some((d) => a.toLowerCase().includes(d)));
  if (type === 'dry' && drying) score -= WEIGHTS.dryingPenalty;

  return { score: Math.round(score * 100) / 100, reasons };
}

export function recommend(profile, { category = 'All', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  return PRODUCTS.filter((p) => category === 'All' || p.category === category)
    .filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.actives.some((a) => a.toLowerCase().includes(q))
    )
    .map((p) => ({ product: p, ...scoreProduct(p, profile) }))
    .sort((a, b) => b.score - a.score);
}

// Best pick in each category — a quick starter routine.
export function topPicks(profile) {
  return CATEGORIES.map((c) => recommend(profile, { category: c })[0]).filter(
    (r) => r && r.score >= 4
  );
}
