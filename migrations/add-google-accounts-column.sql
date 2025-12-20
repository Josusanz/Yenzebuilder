-- =====================================================
-- Add google_accounts column to profiles table
-- Allows users to manage multiple Google accounts
-- =====================================================

-- Add google_accounts column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'google_accounts'
    ) THEN
        ALTER TABLE profiles
        ADD COLUMN google_accounts JSONB DEFAULT '[]'::jsonb;

        RAISE NOTICE 'Column google_accounts added to profiles table';
    ELSE
        RAISE NOTICE 'Column google_accounts already exists in profiles table';
    END IF;

    RAISE NOTICE 'Migration completed successfully';
END $$;

-- Example usage:
-- Update a user's Google accounts
/*
UPDATE profiles
SET google_accounts = '[
  {
    "email": "user@example.com",
    "name": "John Doe",
    "is_default": true,
    "added_at": "2025-01-15T10:00:00Z"
  },
  {
    "email": "client@example.com",
    "name": "Client Account",
    "is_default": false,
    "added_at": "2025-01-15T11:00:00Z"
  }
]'::jsonb
WHERE id = 'user-uuid-here';
*/

-- Verify the column was added
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'google_accounts';
