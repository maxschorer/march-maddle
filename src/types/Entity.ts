export interface Entity {
  entity_id: number;
  name: string;
  imgPath: string;
  attributes: EntityAttribute[];
}

export interface EntityAttribute {
  key: string;
  value: string;
  img_path: string | null;
}

// Database version of Entity (how it's stored in Supabase)
export interface DbEntity {
  entity_id: number;
  name: string;
  img_path: string;
  attributes: EntityAttribute[];
}
