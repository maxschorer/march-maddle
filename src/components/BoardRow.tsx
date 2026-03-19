import SearchRow from './SearchRow';
import { useGrid } from '../contexts/GridContext';
import { Guess, AttributeComparison } from '../types/Guess';
import { GridAttribute } from '../types/Grid';
import { EntityAttribute } from '../types/Entity';
import { 
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { getSupabaseImageUrl } from '../utils/storage';
import { formatNumber, formatMoney } from '../utils/gameUtils';
import { closeHints, CloseFunctionName } from '../utils/closeFunctions';
import { abbreviateState } from '../utils/stateAbbreviations';

import '../styles/animations.css';

interface GuessRowProps {
  guess: Guess | null;
  isCurrentGuess: boolean;
}

const EMPTY_CLASS = "aspect-square bg-gray-200"


const renderValue = (entityAttr: EntityAttribute, attr: GridAttribute, comparison: AttributeComparison, ) => {
  if (!comparison) return '?';
  
  switch (attr.displayType) {
    case 'photo': {
      if (!entityAttr.img_path) return '?';
      const imgUrl = getSupabaseImageUrl("attributes", entityAttr.img_path);
      return (
        <div className="flex items-center justify-between w-full h-full">
          <div className="w-1/4" />
          <div className="w-1/2 flex items-center justify-center">
            <img
              src={imgUrl}
              alt={entityAttr.value}
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="w-1/4" />
        </div>
      );
    }
    case 'number': {
      const formattedValue = formatNumber(Number(comparison.guessedValue));
      const isLong = formattedValue.length > 3;
      return (
        <div className="flex items-center justify-between w-full h-full">
          <div className="w-1/4" />
          <div className="w-1/2 flex items-center justify-center">
            <span className={isLong ? 'text-xs md:text-sm' : ''}>{formattedValue}</span>
          </div>
          <div className="w-1/4 flex items-center justify-start]-">
            {comparison.direction && (
              <span>
                {comparison.direction === 'higher' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </span>
            )}
          </div>
        </div>
      );
    }

    case 'money': {
      const formattedValue = formatMoney(comparison.guessedValue);
      const isLong = formattedValue.length > 3;
      return (
        <div className="flex items-center justify-between w-full h-full">
          <div className="w-1/4" />
          <div className="w-1/2 flex items-center justify-center">
            <span className={isLong ? 'text-xs md:text-sm' : ''}>{formattedValue}</span>
          </div>
          <div className="w-1/4 flex items-center justify-start]-">
            {comparison.direction && (
              <span>
                {comparison.direction === 'higher' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </span>
            )}
          </div>
        </div>
      );
    }

    default: {
      const displayValue = attr.key === 'state'
        ? abbreviateState(comparison.guessedValue)
        : comparison.guessedValue;
      return (
        <div className="flex items-center justify-between w-full h-full">
          <div className="w-1/4" />
          <div className="w-1/2 flex items-center justify-center">
            <span>{displayValue}</span>
          </div>
          <div className="w-1/4 flex items-center justify-start]-">
          </div>
        </div>
      );
    }
  }
};

const EmptyRow = () => {
return (
    <div className="grid grid-cols-6 gap-1">
    {[...Array(6)].map((_, i) => (
        <div 
        key={i} 
        className={EMPTY_CLASS}
        />
    ))}
    </div>
);
};

const GuessRow = ({ guess } : { guess: Guess }) => {
  const { grid } = useGrid();
  return (
    <div className="grid grid-cols-6 gap-1">
      {/* Player image */}
      <div className="aspect-square">
        <img 
          src={getSupabaseImageUrl("entities", guess.entity.imgPath)}
          alt={guess.entity.name}
          className="w-full h-full object-cover object-[center_top]"
        />
      </div>

      {grid.attributes.map((attr, ind) => {
        const comparison = guess.comparison.find(c => c.attribute === attr.key);
        const entityAttr = guess.entity.attributes.find(a => a.key === attr.key);
        if (!comparison || !entityAttr) return;
        
        const tooltip = comparison.match === 'close' && attr.closeFnName
          ? closeHints[attr.closeFnName as CloseFunctionName]
          : undefined;

        return (
          <div
            key={attr.key}
            className="flip-container"
          >
            <div className={`flip-card delay-${ind+1}`}>
              <div className={`${EMPTY_CLASS} flip-back`} />
              <div
                className={`
                  aspect-square
                  flex
                  items-center
                  justify-center
                  text-white
                  font-bold
                  text-base
                  md:text-2xl
                  flip-front
                  ${comparison.match}
                `}
                title={tooltip}
              >
                {renderValue(entityAttr, attr, comparison)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const BoardRow = ({ guess, isCurrentGuess }: GuessRowProps) => {
  if (guess){
    return <GuessRow guess={guess} />
  }

  // Render empty row
  if (!isCurrentGuess) {
    return <EmptyRow />
  }

  return <SearchRow />
};

export default BoardRow;