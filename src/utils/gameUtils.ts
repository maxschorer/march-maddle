import { Entity } from '../types/Entity';
import { AttributeComparison, Match, Direction } from '../types/Guess';
import { GridAttribute } from '../types/Grid';

function getEntityAttributeValue(entity: Entity, key: string): string | number {
  const attribute = entity.attributes.find(attr => attr.key === key);
  if (!attribute) {
    throw new Error(`Attribute ${key} not found in entity ${entity.name}`);
  }
  return attribute.value;
}

export function compareAttributes(guessedEntity: Entity, targetEntity: Entity, gridAttributes: GridAttribute[]): AttributeComparison[] {
  return gridAttributes.map(attribute => {
    const guessedValue = getEntityAttributeValue(guessedEntity, attribute.key);
    const targetValue = getEntityAttributeValue(targetEntity, attribute.key);
    
    // Determine match type
    let match: Match;
    if (guessedValue === targetValue) {
      match = 'exact';
    } else if (attribute.closeFn) {
      match = attribute.closeFn(targetValue, guessedValue) ? 'close' : 'incorrect';
    } else {
      match = 'incorrect';
    }

    // Determine direction
    let direction: Direction = null;
    if (match !== 'exact' && attribute.hasDirection && (attribute.displayType === 'number' || attribute.displayType === 'money')) {
      direction = Number(targetValue) > Number(guessedValue) ? 'higher' : 'lower';
    }

    return {
      attribute: attribute.key,
      guessedValue,
      targetValue,
      match,
      direction
    };
  });
}

export function formatNumber(num: number): string {
  if (num < 1000){
    return num.toString();
  }
  const thousands = (num / 1000).toFixed(1);
  
  // Remove trailing .0 if present
  const formatted = thousands.endsWith('.0') 
    ? thousands.slice(0, -2) 
    : thousands;
    
  return `${formatted}K`;
}

// Format money values in a concise way
export function formatMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '';
  
  const absNum = Math.abs(num);
  
  // Format based on size
  if (absNum >= 1_000_000_000) {
    const billions = num / 1_000_000_000;
    const decimals = Math.abs(billions) < 10 ? 1 : 0;
    return `$${billions.toFixed(decimals)}B`;
  } else if (absNum >= 1_000_000) {
    const millions = num / 1_000_000;
    const decimals = Math.abs(millions) < 10 ? 1 : 0;
    return `$${millions.toFixed(decimals)}M`;
  } else if (absNum >= 1_000) {
    return `$${(num / 1_000).toFixed(0)}K`;
  } else {
    return `$${num.toFixed(0)}`;
  }
}