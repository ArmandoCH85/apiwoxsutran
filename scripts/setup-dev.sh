#!/bin/bash
echo "GPSWOX-SUTRAN Retransmission Service - Development Setup"
echo "======================================================="
echo ""
echo "Checking Node.js version..."
node --version
echo ""
echo "Installing dependencies..."
npm install
echo ""
echo "Building TypeScript..."
npm run build
echo ""
echo "Running tests..."
npm test
echo ""
echo "Setup complete! Copy config.yaml.example to config.yaml and configure your API keys."
