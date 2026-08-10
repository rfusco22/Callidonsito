#!/bin/sh
set -e

# Initialize database
node scripts/init-db.ts

# Start the application
exec node server.js
