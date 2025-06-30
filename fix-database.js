import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const connectionString = "postgresql://demo_user:demouser123@localhost:5432/boat_rental";
const sql = postgres(connectionString);

async function fixDatabase() {
  try {
    console.log("🔧 Dropping existing tables...");

    await sql`DROP TABLE IF EXISTS bookings CASCADE`;
    await sql`DROP TABLE IF EXISTS boats CASCADE`;
    await sql`DROP TABLE IF EXISTS owner_requests CASCADE`;
    await sql`DROP TABLE IF EXISTS owners CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    await sql`DROP TABLE IF EXISTS contacts CASCADE`;

    console.log("✅ Tables dropped. Creating tables...");

    await sql`CREATE SEQUENCE IF NOT EXISTS user_id_seq START 1000`;

    await sql `CREATE SEQUENCE boats_id_seq START 1`;
    await sql `CREATE SEQUENCE bookings_id_seq START 1`;
    await sql `CREATE SEQUENCE contacts_id_seq START 1`;


    // Create users table
    await sql`

      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL DEFAULT nextval('user_id_seq') UNIQUE,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        role VARCHAR NOT NULL DEFAULT 'user',
        stripe_customer_id VARCHAR,
        stripe_subscription_id VARCHAR,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        phone TEXT,
        password TEXT NOT NULL
      )
    `;

    // Create owner_requests table
    await sql`
      CREATE TABLE owner_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        address TEXT NOT NULL,
        government_id TEXT NOT NULL,
        government_id_num TEXT,
        date_of_birth DATE NOT NULL,
        business_name TEXT NOT NULL,
        boat_name TEXT NOT NULL,
        boat_type TEXT NOT NULL,
        boat_length INTEGER NOT NULL,
        boat_capacity INTEGER NOT NULL,
        registration_number TEXT NOT NULL,
        hull_identification_number TEXT NOT NULL,
        state_of_registration TEXT NOT NULL,
        insurance_details TEXT NOT NULL,
        daily_rate NUMERIC(10,2) NOT NULL,
        purpose TEXT NOT NULL,
        business_license TEXT,
        insurance_certificate TEXT,
        marina_location TEXT,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT now() NOT NULL,
        updated_at TIMESTAMP DEFAULT now() NOT NULL,
        owner_id NUMERIC(7,0) NOT NULL,
        password VARCHAR NOT NULL
      )
    `;

    // Create owner_requests table
    await sql`
      CREATE TABLE owners (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        address TEXT NOT NULL,
        government_id TEXT NOT NULL,
        government_id_num TEXT,
        date_of_birth DATE NOT NULL,
        business_name TEXT NOT NULL,
        boat_name TEXT NOT NULL,
        boat_type TEXT NOT NULL,
        boat_length INTEGER NOT NULL,
        boat_capacity INTEGER NOT NULL,
        registration_number TEXT NOT NULL,
        hull_identification_number TEXT NOT NULL,
        state_of_registration TEXT NOT NULL,
        insurance_details TEXT NOT NULL,
        daily_rate NUMERIC(10,2) NOT NULL,
        purpose TEXT NOT NULL,
        business_license TEXT,
        insurance_certificate TEXT,
        marina_location TEXT,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT now() NOT NULL,
        updated_at TIMESTAMP DEFAULT now() NOT NULL,
        owner_id NUMERIC(7,0) NOT NULL,
        password VARCHAR NOT NULL
      )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS boats (
      id INTEGER NOT NULL DEFAULT nextval('boats_id_seq'::regclass),
      owner_id INTEGER NOT NULL,
      name VARCHAR NOT NULL,
      type VARCHAR NOT NULL,
      description TEXT NOT NULL,
      length INTEGER NOT NULL,
      capacity INTEGER NOT NULL,
      daily_rate NUMERIC NOT NULL,
      location VARCHAR NOT NULL,
      images TEXT[],
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      image_url TEXT,
      rating NUMERIC DEFAULT 0,
      purpose TEXT NOT NULL DEFAULT 'N/A',
      CONSTRAINT boats_pkey PRIMARY KEY (id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER NOT NULL DEFAULT nextval('bookings_id_seq'::regclass),
      user_id VARCHAR NOT NULL,
      boat_id INTEGER NOT NULL,
      total_amount NUMERIC NOT NULL,
      secret_key VARCHAR(7),
      payment_status VARCHAR,
      stripe_payment_intent_id VARCHAR,
      created_at TIME WITH TIME ZONE DEFAULT now(),
      updated_at TIME WITH TIME ZONE DEFAULT now(),
      checkin_date DATE NOT NULL,
      checkout_date DATE NOT NULL,
      guests NUMERIC NOT NULL,
      special_requests TEXT,
      owner_status TEXT,
      status TEXT,
      CONSTRAINT bookings_pkey PRIMARY KEY (id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER NOT NULL DEFAULT nextval('contacts_id_seq'::regclass),
      first_name VARCHAR NOT NULL,
      last_name VARCHAR NOT NULL,
      email VARCHAR NOT NULL,
      subject VARCHAR NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR DEFAULT '1',
      created_at TIME WITH TIME ZONE DEFAULT now(),
      CONSTRAINT contacts_pkey PRIMARY KEY (id)
    )
  `;

    console.log("✅ Tables created successfully!");

    // Create default admin and user
    const adminPassword = bcrypt.hashSync("newadmin", 10);
    await sql`
      INSERT INTO users (email, first_name, last_name, phone, password, role)
      VALUES ('admin@boatrental.com', 'Admin', 'User', '+1555000000', ${adminPassword}, 'admin')
    `;

    const userPassword = bcrypt.hashSync("johnuser123", 10);
    await sql`
      INSERT INTO users (email, first_name, last_name, phone, password, role)
      VALUES ('john@example.com', 'John', 'Doe', '+1555123456', ${userPassword}, 'user')
    `;

    console.log("🎉 Database fixed and ready!");
    console.log("Admin login: admin@boatrental.com / newadmin");
    console.log("User login: john@example.com / johnuser123");

  } catch (err) {
    console.error("❌ Error during setup:", err);
  } finally {
    await sql.end();
  }
}

fixDatabase();
