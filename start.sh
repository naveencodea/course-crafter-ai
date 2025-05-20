#!/bin/bash

# Start backend
cd backend && npm run dev &

# Start frontend
cd ../frontend && npm start

# Keep the script running
wait
