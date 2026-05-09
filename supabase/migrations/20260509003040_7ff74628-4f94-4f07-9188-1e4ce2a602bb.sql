-- Add ANNUEL to the activation_code_type enum
ALTER TYPE public.activation_code_type ADD VALUE IF NOT EXISTS 'ANNUEL';
