import { createClient } from '@/lib/supabase/client';
import { Entity, DbEntity } from '@/types/Entity';

interface DailyTarget {
  id: number;
  grid_id: number;
  entity_id: number;
  number: number;
  ds: string;
}

function mapDbEntityToEntity(dbEntity: DbEntity): Entity {
  return {
    entity_id: dbEntity.entity_id,
    name: dbEntity.name,
    imgPath: dbEntity.img_path,
    attributes: dbEntity.attributes
  };
}

export async function getAllEntities(gridId: number): Promise<Entity[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('grid_entities')
      .select('*')
      .eq('grid_id', gridId);

    if (error) {
      throw new Error(`Error fetching entities: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }
    return data.map(mapDbEntityToEntity);
  } catch (error) {
    console.error('Failed to fetch eligible entities:', error);
    throw error;
  }
}

export async function getDailyTarget(ds: string, gridId: number): Promise<DailyTarget | null> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('daily_targets')
      .select('id, grid_id, entity_id, number, ds')
      .eq('ds', ds)
      .eq('grid_id', gridId)
      .single();

    if (error) {
      console.error('Error fetching daily target:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch today\'s entity:', error);
    return null;
  }
}

export async function searchEntities(query: string, gridEntities: Entity[]): Promise<Entity[]> {
  try {
    return gridEntities.filter(entity =>
      entity.name.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Failed to search entities:', error);
    throw error;
  }
}

export async function getTarget(gridEntities: Entity[], gridId: number, ds?: string) {
  if (!ds) {
    const randomIndex = Math.floor(Math.random() * gridEntities.length);
    const entity = gridEntities[randomIndex];
    return {
      entity,
      number: null,
      id: entity.entity_id,
    };
  } else {
    const dailyTarget = await getDailyTarget(ds, gridId);
    if (!dailyTarget) return null;
    return {
      entity: gridEntities.find(e => e.entity_id === dailyTarget.entity_id),
      number: dailyTarget.number,
      id: dailyTarget.id,
    };
  }
}
