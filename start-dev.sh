#!/bin/bash

# Remove any existing temporary files
rm -f nanoid-mock.js

# Create our own custom launch script for development
echo "Starting development server with enhanced CSS processing..."
echo "Fixing PostCSS nanoid reference..."

# Apply the patch using patch-package
npx patch-package postcss

# Start the development server
echo "Starting Vite development server..."
npm run dev
