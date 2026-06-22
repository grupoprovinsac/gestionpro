import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function init() {
  // Check if org exists
  const { data: orgs, error: orgError } = await supabase.from('organizations').select('*');
  console.log("Existing Orgs:", orgs);

  if (orgs && orgs.length === 0) {
    console.log("Inserting org...");
    const { data, error } = await supabase.from('organizations').insert([{ name: 'Grupo Provin SAC' }]).select();
    console.log("Insert result:", data, error);
  } else {
    console.log("Org already exists.");
  }
}

init();
