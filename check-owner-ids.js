import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { owners } from "./shared/schema.js";

process.env.DATABASE_URL="postgresql://demo_user:demouser123@localhost:5432/boat_rental";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function checkOwnerIds() {
  try {
    console.log("🔍 Checking owner IDs in the database...\n");
    
    const allOwners = await db.select().from(owners);
    
    if (allOwners.length === 0) {
      console.log("❌ No owners found in the database");
      return;
    }
    
    console.log(`✅ Found ${allOwners.length} owner(s) in the database:\n`);
    
    allOwners.forEach((owner, index) => {
      console.log(`${index + 1}. Owner ID: ${owner.ownerId}`);
      console.log(`   Name: ${owner.firstName} ${owner.lastName}`);
      console.log(`   Business: ${owner.businessName}`);
      console.log(`   Email: ${owner.email}`);
      console.log(`   Status: ${owner.status}`);
      console.log(`   Password: password123`);
      console.log("");
    });
    
    console.log("💡 You can use any of these Owner IDs with password 'password123' to test owner login");
    
  } catch (error) {
    console.error("❌ Error checking owner IDs:", error);
  } finally {
    await client.end();
  }
}

checkOwnerIds(); 