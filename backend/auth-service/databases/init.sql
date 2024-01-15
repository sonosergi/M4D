-- init.sql
CREATE DATABASE 28k;

\c 28k;

CREATE TABLE users (
  id UUID,
  phone_number VARCHAR(15) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  verification_code INT,
  PRIMARY KEY (id)
);