/*
  # Add Date of Birth to Students

  ## Query Description:
  Adds a date_of_birth column to the students table to be used as a login credential (password).
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Table: students
  - Column: date_of_birth (DATE)
*/

ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
