import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

async function testConnection() {
  console.log('🔍 Testing Neon database connection...\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ ERROR: DATABASE_URL not found in environment variables');
    console.log('📝 Please add DATABASE_URL to your .env file:');
    console.log('   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL found in environment');
  console.log('🔗 Attempting connection to Neon database...\n');
  
  try {
    const sql = neon(databaseUrl);
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    
    console.log('🎉 CONNECTION SUCCESSFUL!');
    console.log('📊 Database Info:');
    console.log(`   • Current Time: ${result[0].current_time}`);
    console.log(`   • PostgreSQL Version: ${result[0].postgres_version}`);
    
    // Test table existence
    console.log('\n🔍 Checking existing tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    if (tables.length > 0) {
      console.log(`✅ Found ${tables.length} existing tables:`);
      tables.forEach(table => {
        console.log(`   • ${table.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found in public schema');
      console.log('💡 Run "npm run setup" to create initial tables');
    }
    
    console.log('\n✅ Database connection test completed successfully!');
    
  } catch (error: any) {
    console.log('❌ CONNECTION FAILED!');
    console.log('🔥 Error Details:');
    console.log(`   • Message: ${error.message}`);
    console.log(`   • Code: ${error.code || 'N/A'}`);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Check your DATABASE_URL credentials');
      console.log('   2. Verify your Neon database is active');
      console.log('   3. Ensure you have the correct password');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify the Neon host URL is correct');
      console.log('   3. Check firewall settings');
    }
    
    process.exit(1);
  }
}

// Run the test
testConnection().catch(console.error);