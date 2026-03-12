import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://ghjdlxxnlmihvsqrjwrd.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImZiOWMyNWFmLWVmM2YtNGEzZC05YzVmLTZiNDJmMDlhOTA3MSJ9.eyJwcm9qZWN0SWQiOiJnaGpkbHh4bmxtaWh2c3FyandyZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcyNzgxMzA1LCJleHAiOjIwODgxNDEzMDUsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.KAM3TEuKefWhOTy_AcRj4sW48h8PDKjP2yQ1BhakuJk';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };