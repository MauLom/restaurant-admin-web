// Unit conversion to base units: grams (weight) and milliliters (volume)

const WEIGHT_UNITS = ['g', 'kg', 'oz', 'lb'];
const VOLUME_UNITS = ['ml', 'l', 'taza', 'cucharada', 'cucharadita', 'fl_oz'];

const toGrams = (qty, unit) => {
  const map = { g: 1, kg: 1000, oz: 28.35, lb: 453.6 };
  return map[unit] != null ? qty * map[unit] : null;
};

const toMl = (qty, unit) => {
  const map = { ml: 1, l: 1000, taza: 240, cucharada: 15, cucharadita: 5, fl_oz: 29.57 };
  return map[unit] != null ? qty * map[unit] : null;
};

const invUnitType = (invItem) => {
  if (WEIGHT_UNITS.includes(invItem.unit)) return 'weight';
  if (VOLUME_UNITS.includes(invItem.unit)) return 'volume';
  if (invItem.unit === 'bottle') return 'volume';
  if (invItem.unit === 'unit') return invItem.equivalentGr > 0 ? 'weight' : 'count';
  return 'count';
};

// Convert 1 inventory unit → base (ml or grams)
const invBasePerUnit = (invItem) => {
  const type = invUnitType(invItem);
  if (type === 'volume') {
    if (invItem.unit === 'bottle') return invItem.equivalentMl || null;
    return toMl(1, invItem.unit);
  }
  if (type === 'weight') {
    if (invItem.unit === 'unit') return invItem.equivalentGr || null;
    return toGrams(1, invItem.unit);
  }
  return null;
};

// Convert recipe quantity → same base as inventory
const recipeToBase = (qty, unit, type) => {
  if (type === 'volume') return toMl(qty, unit);
  if (type === 'weight') return toGrams(qty, unit);
  return null;
};

/**
 * Calculate cost of using `recipeQty` `recipeUnit` of `invItem`.
 * invItem.cost = cost per 1 inventory unit (e.g. $3 per 1 kg)
 * Returns cost number or null if units are incompatible.
 */
export const calcIngredientCost = (invItem, recipeQty, recipeUnit) => {
  if (!invItem || !recipeQty || recipeQty <= 0 || !invItem.cost) return null;

  const type = invUnitType(invItem);

  if (type === 'count') {
    // Both must be 'unidad' or same unit
    if (invItem.unit === recipeUnit || recipeUnit === 'unidad') {
      const qty = parseFloat(recipeQty) || 0;
      return invItem.cost * qty;
    }
    return null;
  }

  const invBase = invBasePerUnit(invItem);
  const recBase = recipeToBase(parseFloat(recipeQty) || 0, recipeUnit, type);

  if (!invBase || recBase == null) return null;

  const ratio = recBase / invBase;
  return invItem.cost * ratio;
};

export const formatCost = (cost) =>
  cost != null ? `$${cost.toFixed(2)}` : null;

/** Returns { profit, marginPct } or null if either value is missing */
export const calcMargin = (price, cost) => {
  if (!price || price <= 0 || cost == null) return null;
  const profit = price - cost;
  const marginPct = (profit / price) * 100;
  return { profit, marginPct };
};

export const calcTotalCost = (ingredients, inventoryMap) => {
  let total = 0;
  let hasAny = false;
  for (const ing of ingredients) {
    if (!ing.inventoryItemId) continue;
    const invItem = inventoryMap[ing.inventoryItemId];
    if (!invItem) continue;
    const c = calcIngredientCost(invItem, ing.quantity, ing.unit);
    if (c != null) { total += c; hasAny = true; }
  }
  return hasAny ? total : null;
};
