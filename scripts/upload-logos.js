#!/usr/bin/env node
/**
 * Upload team logos and conference logos to Supabase storage.
 * Updates entity img_path and conference attribute img_path in the DB.
 *
 * Usage:
 *   node scripts/upload-logos.js
 *
 * Requires .env with VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse .env manually (no dotenv dependency)
const envFile = readFileSync(join(__dirname, '..', '.env'), 'utf-8');
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const [, key, value] = match;
    process.env[key.trim()] = value.trim();
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const data = JSON.parse(readFileSync(join(__dirname, '..', 'march-maddle-data.json'), 'utf-8'));

// ESPN conference logo slugs — used in URL: https://a.espncdn.com/i/teamlogos/ncaa_conf/500/{slug}.png
const conferenceEspnSlugs = {
  'ACC': 'acc',
  'American': 'american',
  'America East': 'america_east',
  'Atlantic 10': 'atlantic_10',
  'ASUN': 'atlantic_sun',
  'Big 12': 'big_12',
  'Big East': 'big_east',
  'Big Sky': 'big_sky',
  'Big South': 'big_south',
  'Big Ten': 'big_ten',
  'Big West': 'big_west',
  'CAA': 'caa',
  'C-USA': 'conference_usa',
  'Horizon': 'horizon',
  'Ivy': 'ivy',
  'MAC': 'mac',
  'MAAC': 'maac',
  'MEAC': 'meac',
  'Missouri Valley': 'missouri_valley',
  'Mountain West': 'mountain_west',
  'NEC': 'nec',
  'Ohio Valley': 'ohio_valley',
  'Patriot': 'patriot',
  'SEC': 'sec',
  'Southern': 'southern',
  'Southland': 'southland',
  'Summit': 'summit',
  'Sun Belt': 'sun_belt',
  'SWAC': 'swac',
  'WAC': 'wac',
  'WCC': 'west_coast',
};

function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function uploadToStorage(bucket, path, data, contentType = 'image/png') {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, data, {
      contentType,
      upsert: true,
    });
  if (error) throw error;
}

async function uploadTeamLogos() {
  console.log('=== Uploading team logos ===\n');

  for (const team of data.teams) {
    const filename = sanitizeFilename(team.name) + '.png';
    const storagePath = `teams/${filename}`;

    try {
      console.log(`  Downloading ${team.name} logo...`);
      const imageData = await downloadImage(team.logo_url);

      console.log(`  Uploading to entities/${storagePath}...`);
      await uploadToStorage('entities', storagePath, imageData);

      // Update the entity's img_path in the DB
      const { error } = await supabase
        .from('entities')
        .update({ img_path: storagePath })
        .eq('name', team.name);

      if (error) {
        console.error(`  ❌ DB update failed for ${team.name}:`, error.message);
      } else {
        console.log(`  ✅ ${team.name}`);
      }
    } catch (err) {
      console.error(`  ❌ Failed for ${team.name}:`, err.message);
    }
  }
}

async function uploadConferenceLogos() {
  console.log('\n=== Uploading conference logos ===\n');

  const conferences = [...new Set(data.teams.map(t => t.conference))];

  for (const conf of conferences) {
    const slug = conferenceEspnSlugs[conf];
    if (!slug) {
      console.error(`  ❌ No ESPN slug mapping for conference: ${conf}`);
      continue;
    }

    const logoUrl = `https://a.espncdn.com/i/teamlogos/ncaa_conf/500/${slug}.png`;
    const filename = sanitizeFilename(conf) + '.png';
    const storagePath = `conferences/${filename}`;

    try {
      console.log(`  Downloading ${conf} logo (${slug})...`);
      const imageData = await downloadImage(logoUrl);

      console.log(`  Uploading to attributes/${storagePath}...`);
      await uploadToStorage('attributes', storagePath, imageData);

      // Update all entities with this conference to have the img_path on their conference attribute
      // Supabase doesn't support updating inside JSONB arrays easily, so we fetch + update
      const { data: entities, error: fetchErr } = await supabase
        .from('entities')
        .select('entity_id, attributes')
        .filter('attributes', 'cs', JSON.stringify([{ key: 'conference', value: conf }]));

      if (fetchErr) {
        console.error(`  ❌ Failed to fetch entities for ${conf}:`, fetchErr.message);
        continue;
      }

      for (const entity of entities || []) {
        const updatedAttributes = entity.attributes.map(attr =>
          attr.key === 'conference'
            ? { ...attr, img_path: storagePath }
            : attr
        );

        const { error: updateErr } = await supabase
          .from('entities')
          .update({ attributes: updatedAttributes })
          .eq('entity_id', entity.entity_id);

        if (updateErr) {
          console.error(`  ❌ DB update failed for entity ${entity.entity_id}:`, updateErr.message);
        }
      }

      console.log(`  ✅ ${conf} (${(entities || []).length} teams updated)`);
    } catch (err) {
      console.error(`  ❌ Failed for ${conf}:`, err.message);
    }
  }
}

async function updateConferenceDisplayType() {
  console.log('\n=== Updating conference displayType to photo ===\n');

  // Fetch the grid
  const { data: grid, error: fetchErr } = await supabase
    .from('grids')
    .select('id, attributes')
    .eq('permalink', 'march-maddle')
    .single();

  if (fetchErr || !grid) {
    console.error('  ❌ Failed to fetch grid:', fetchErr?.message);
    return;
  }

  const updatedAttributes = grid.attributes.map(attr =>
    attr.key === 'conference'
      ? { ...attr, displayType: 'photo' }
      : attr
  );

  const { error: updateErr } = await supabase
    .from('grids')
    .update({ attributes: updatedAttributes })
    .eq('id', grid.id);

  if (updateErr) {
    console.error('  ❌ Failed to update grid:', updateErr.message);
  } else {
    console.log('  ✅ Conference displayType updated to photo');
  }
}

async function ensureBuckets() {
  console.log('=== Ensuring storage buckets exist ===\n');

  for (const bucket of ['entities', 'attributes']) {
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
    });
    if (error && error.message !== 'The resource already exists') {
      console.error(`  ❌ Failed to create bucket "${bucket}":`, error.message);
    } else {
      console.log(`  ✅ Bucket "${bucket}" ready`);
    }
  }
}

async function main() {
  console.log('🏀 March Maddle Logo Uploader\n');

  await ensureBuckets();
  await uploadTeamLogos();
  await uploadConferenceLogos();
  await updateConferenceDisplayType();

  console.log('\n🎉 Done!');
}

main().catch(console.error);
