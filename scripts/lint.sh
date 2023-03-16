#!/bin/bash

FRONTEND_DIR="client/"
BACKEND_DIR="api/"
FOLDER=""

if [ "$1" == "frontend" ]; then
    FOLDER=$FRONTEND_DIR
elif [ "$1" == "backend" ]; then
    FOLDER=$BACKEND_DIR
fi

echo ""
echo "Linting $1 code"
cd $FOLDER
npm run lint
