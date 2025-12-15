-- Migration: Remove vehicleStory column from listings table
-- Run this manually in your database

ALTER TABLE listings DROP COLUMN IF EXISTS "vehicleStory";

