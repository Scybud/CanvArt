import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://tgnrkdnovyhwwooehnxa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Z7jqrjR-MYzv2j732lAjqw_qNyMk3RC";

//EXPORT CLIENT INFO
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    // detectSessionInUrl: true,
  },
});
