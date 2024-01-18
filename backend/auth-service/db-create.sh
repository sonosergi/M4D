#!/bin/bash

# Load environment variables from .env file
export $(egrep -v '^#' .env | xargs)

# Function to create a database container
create_db_container() {
    local db_ip_var=$1
    local db_host_var=$2
    local db_port_var=$3
    local db_name_var=$4
    local db_user_var=$5
    local db_password_var=$6
    local db_url_var=$7

    local db_ip=${!db_ip_var}
    local db_host=${!db_host_var}
    local db_port=${!db_port_var}
    local db_name=${!db_name_var}
    local db_user=${!db_user_var}
    local db_password=${!db_password_var}
    local db_url=${!db_url_var}

    # Pull the latest PostgreSQL image
    docker pull postgres:latest

    # Run the PostgreSQL container
    docker run --name $db_name -e POSTGRES_PASSWORD=$db_password -e POSTGRES_USER=$db_user -e POSTGRES_DB=$db_name -p $db_port:5432 -d postgres:latest

    # Get the IP address of the container
    db_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $db_name)

    # Update the .env file with the IP address of the container
    if [ -n "${!db_ip_var}" ]; then
        sed -i "s|${!db_ip_var}|$db_ip|" .env
    else
        sed -i "/^$db_ip_var=/c\\$db_ip_var=$db_ip" .env
    fi

    # Update the .env file with the database URL
    local new_db_url="postgresql://$db_user:$db_password@$db_ip:5432/$db_name"
    sed -i "s|$db_url|$new_db_url|" .env
}

# Create the database containers
create_db_container "CHAT_IP" "CHAT_DB_HOST" "CHAT_DB_PORT" "CHAT_DB_NAME" "CHAT_DB_USER" "CHAT_DB_PASSWORD" "CHAT_DB_URL"
create_db_container "AUTH_IP" "AUTH_DB_HOST" "AUTH_DB_PORT" "AUTH_DB_NAME" "AUTH_DB_USER" "AUTH_DB_PASSWORD" "AUTH_DB_URL"
create_db_container "POST_IP" "POST_DB_HOST" "POST_DB_PORT" "POST_DB_NAME" "POST_DB_USER" "POST_DB_PASSWORD" "POST_DB_URL"