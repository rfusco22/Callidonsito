#!/usr/bin/env node

import { initializeDatabase } from '../lib/database';

initializeDatabase()
  .then((message) => {
    console.log('[v0]', message);
    process.exit(0);
  })
  .catch((error) => {
    console.error('[v0] Error initializing database:', error);
    process.exit(1);
  });
