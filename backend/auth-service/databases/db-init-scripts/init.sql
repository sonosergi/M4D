CREATE TABLE auth (
  id UUID PRIMARY KEY,
  phone_number VARCHAR(15) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  verification_code INT
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth(id)
);