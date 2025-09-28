-- ComplykOrt Database Initialization
-- This file sets up the initial database configuration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create application user with proper permissions
-- (Optional - we're using complykort user from Docker)

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE complykort TO complykort;

-- Create schema if needed (Prisma will handle this)
-- We'll let Prisma manage the schema creation

-- Log successful initialization
SELECT 'ComplykOrt database initialized successfully' AS status;
