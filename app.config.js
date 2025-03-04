import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      supabaseUrl: process.env.SUPABASE_URL || "https://your-project.supabase.co",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "your-anon-key",
    },
  };
}; 