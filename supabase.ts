import { createClient } from '@supabase/supabase-js';

// Credenciais reais fornecidas para o projeto WFS Manaus
const supabaseUrl = 'https://pvygwtestzxfbqlhljmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2eWd3dGVzdHp4ZmJxbGhsam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTkzMDAsImV4cCI6MjA4NTE5NTMwMH0.MnhXtE5snKwuA01ltKCx0lWBginB1htZF36ethqiw4I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);