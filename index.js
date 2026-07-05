require('dotenv').config();
const connectDB = require('./config/db');
const { startWorker } = require('./workers/autoCommitter');

async function initApp() {
  console.log('🚀 Starting GitHub Commit Bot...');
  
  try {
    // 1. Database Connect Karein
    await connectDB();
    
    // 2. Automation Worker Start Karein
    console.log('⚙️ Starting Auto-Committer Worker...\n');
    await startWorker();
    
  } catch (error) {
    console.error('❌ Application start hone me error aaya:', error.message);
    process.exit(1);
  }
}

// App ko kickstart karo
initApp();
