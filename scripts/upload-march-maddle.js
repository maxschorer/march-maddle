#!/usr/bin/env node
/**
 * Upload March Maddle data to Supabase
 * 
 * Usage:
 *   SUPABASE_URL=xxx SUPABASE_KEY=xxx node scripts/upload-march-maddle.js
 * 
 * This script:
 * 1. Creates the "March Maddle" grid with NCAA tournament attributes
 * 2. Uploads all 68 team entities with ESPN logo URLs
 * 3. Creates daily target schedule (Mar 17 - Apr 6)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const data = JSON.parse(readFileSync(join(__dirname, '..', 'march-maddle-data.json'), 'utf-8'));

async function main() {
  console.log('🏀 Uploading March Maddle data...\n');

  // Step 1: Create the grid
  console.log('1. Creating grid...');
  const { data: grid, error: gridError } = await supabase
    .from('grids')
    .insert({
      title: data.grid.title,
      tagline: data.grid.tagline,
      permalink: data.grid.permalink,
      category: data.grid.category,
      max_guesses: data.grid.maxGuesses,
      attributes: data.grid.attributes,
      active: true,
      state: 'live'
    })
    .select()
    .single();

  if (gridError) {
    console.error('Error creating grid:', gridError);
    process.exit(1);
  }
  console.log(`   ✅ Grid created with ID: ${grid.id}\n`);

  // Step 2: Upload entities
  console.log(`2. Uploading ${data.teams.length} teams...`);
  
  const entities = data.teams.map(team => ({
    name: team.name,
    img_path: team.logo_url || '',
    grid_id: grid.id,
    attributes: [
      { key: 'seed', value: String(team.seed), img_path: null },
      { key: 'region', value: team.region, img_path: null },
      { key: 'conference', value: team.conference, img_path: null },
      { key: 'state', value: team.state, img_path: null },
      { key: 'kenpom', value: String(team.kenpom), img_path: null }
    ]
  }));

  const { data: insertedEntities, error: entityError } = await supabase
    .from('entities')
    .insert(entities)
    .select();

  if (entityError) {
    console.error('Error inserting entities:', entityError);
    process.exit(1);
  }
  console.log(`   ✅ ${insertedEntities.length} teams uploaded\n`);

  // Step 3: Create daily target schedule
  console.log('3. Creating daily target schedule...');
  
  const scheduleEntries = [];
  for (const day of data.schedule) {
    const entity = insertedEntities.find(e => e.name === day.team);
    if (!entity) {
      console.warn(`   ⚠️  Could not find entity for ${day.team}`);
      continue;
    }
    scheduleEntries.push({
      grid_id: grid.id,
      entity_id: entity.entity_id,
      ds: day.date,
      number: day.day_number,
    });
  }

  const { data: insertedTargets, error: targetError } = await supabase
    .from('daily_grid_entities')
    .insert(scheduleEntries)
    .select();

  if (targetError) {
    console.error('Error creating schedule:', targetError);
    process.exit(1);
  }
  console.log(`   ✅ ${insertedTargets.length} daily targets scheduled\n`);

  // Summary
  console.log('🎉 March Maddle is ready!');
  console.log(`   Grid ID: ${grid.id}`);
  console.log(`   Permalink: march-maddle`);
  console.log(`   Teams: ${insertedEntities.length}`);
  console.log(`   Schedule: ${insertedTargets.length} days (${data.schedule[0].date} → ${data.schedule[data.schedule.length - 1].date})`);
  console.log('\nDeploy to Vercel and you\'re live! 🚀');
}

main().catch(console.error);
