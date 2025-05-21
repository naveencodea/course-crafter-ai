#!/bin/bash

# Function to handle script termination
cleanup() {
  echo "Shutting down..."
  # Kill all child processes
  pkill -P $$
  exit 0
}

# Set up trap to catch termination signals
trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend..."
cd backend && NODE_OPTIONS='--experimental-specifier-resolution=node --no-warnings' npm run dev &

# Start frontend
echo "Starting frontend..."
cd frontend && npm run dev &

# Keep the script running
wait
