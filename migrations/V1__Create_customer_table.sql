CREATE TABLE customer (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    website VARCHAR(255),
    lifecyclestage VARCHAR(50),
    createdAt TIMESTAMPTZ DEFAULT now(),
    updatedAt TIMESTAMPTZ DEFAULT now()
);