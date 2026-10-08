// Supabase Database Connection Client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// REPLACE THE PLACEHOLDERS BELOW WITH YOUR ACTUAL KEYS FROM SUPABASE
export const SUPABASE_URL = 'https://heebfhoctiayjkawznnz.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZWJmaG9jdGlheWprYXd6bm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNzM1MDcsImV4cCI6MjEwNjg0OTUwN30.mnp5S2MEj-zxpZs0hpgWj048IkeTM_QATUQbNntHhbs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
