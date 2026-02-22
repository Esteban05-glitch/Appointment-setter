-- Fix existing prospects with invalid "Just now" lastContact values
-- Run this in Supabase SQL Editor to update existing records

UPDATE prospects
SET last_contact = created_at
WHERE last_contact = 'Just now' OR last_contact !~ '^\d{4}-\d{2}-\d{2}';

-- This will set last_contact to the created_at timestamp for any prospects
-- that have "Just now" or any other invalid date format
