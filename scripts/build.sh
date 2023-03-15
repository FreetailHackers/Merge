#!/bin/bash

echo ""
echo "Building frontend code"
cd client/
npm run build
cd ..
cp -r default-service api
