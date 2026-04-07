require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  console.log("Connecting to Supabase...");
  console.log("URL:", process.env.SUPABASE_URL);
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
  
  if (error) {
    console.error("Supabase Error:", error.message);
  } else {
    console.log("Supabase Connection Successful! Found users count.");
  }
}

testSupabase();
