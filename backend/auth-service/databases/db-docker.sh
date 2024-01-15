#!/bin/bash

# Load environment variables from .env file
export $(egrep -v '^#' .env | xargs)

# Pull the latest PostgreSQL image
docker pull postgres:latest

# Run the PostgreSQL container with init.sql script
docker run --name $DB_NAME -e POSTGRES_PASSWORD=$DB_PASSWORD -e POSTGRES_USER=$DB_USER -e POSTGRES_DB=$DB_NAME -p $DB_PORT:5432 -d -v $PWD/init.sql:/docker-entrypoint-initdb.d/init.sql postgres:latest