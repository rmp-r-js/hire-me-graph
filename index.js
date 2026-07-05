require('dotenv').config();
const http = require('http'); // Node ka built-in HTTP module (Render Free Tier safe)
const connectDB = require('./config/db');
const { startWorker } = require('./workers/autoCommitter');
const CommitJob = require('./models/CommitJob');

// 1. Dummy HTTP Server (Render ko zinda aur khush rakhne ke liye port bind zaroori hai)
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  
  // Magic Endpoint: Browser me apne app URL ke aage "/seed" kholne par database bhar jayega
  if (req.url === '/seed') {
    try {
      console.log('🌱 Browser se Seed request aayi hai! Database clean karke load kar rahe hain...');
      
      // "HIRE ME" draw karne wali exact dates (Monday-Friday blocks)
      const hireMeDates = [
        // H
        "2025-12-29", "2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02", "2026-01-07",
        "2026-01-12", "2026-01-13", "2026-01-14", "2026-01-15", "2026-01-16",
        // I
        "2026-01-26", "2026-01-30", "2026-02-02", "2026-02-03", "2026-02-04", "2026-02-05", "2026-02-06",
        "2026-02-09", "2026-02-13",
        // R
        "2026-02-23", "2026-02-24", "2026-02-25", "2026-02-26", "2026-02-27", "2026-03-02", "2026-03-04",
        "2026-03-09", "2026-03-11", "2026-03-12", "2026-03-17", "2026-03-20",
        // E
        "2026-03-30", "2026-03-31", "2026-04-01", "2026-04-02", "2026-04-03", "2026-04-06", "2026-04-08",
        "2026-04-10", "2026-04-13", "2026-04-15", "2026-04-17",
        // M
        "2026-05-04", "2026-05-05", "2026-05-06", "2026-05-07", "2026-05-08", "2026-05-12", "2026-05-20",
        "2026-05-26", "2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05",
        // E
        "2026-06-15", "2026-06-16", "2026-06-17", "2026-06-18", "2026-06-19", "2026-06-22", "2026-06-24",
        "2026-06-26", "2026-06-29", "2026-07-01", "2026-07-03"
      ];

      // Purane jobs delete karo
      await CommitJob.deleteMany({});
      const jobsToInsert = [];

      // Har din ke liye 4 dark-green commits generate honge
      hireMeDates.forEach((dateString) => {
        for (let i = 1; i <= 4; i++) {
          jobsToInsert.push({
            date: `${dateString}T12:0${i}:00Z`,
            message: `chore: graph art [${dateString} #${i}]`,
            status: 'PENDING',
            retryCount: 0
          });
        }
      });

      // DB me load karo
      await CommitJob.insertMany(jobsToInsert);
      console.log(`✅ Success! Total ${jobsToInsert.length} jobs load ho gaye.`);

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`
        <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
          <h1 style="color: #2ea043;">🎉 Magic Success!</h1>
          <p>Total <b>${jobsToInsert.length} commit jobs</b> database me successfully load ho gaye hain!</p>
          <p>Worker ab background me automatic commits karna shuru kar chuka hai. Render ke logs check karo! 🚀</p>
        </div>
      `);
    } catch (error) {
      console.error('❌ Seeding Error:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end(`Error seeding data: ${error.message}`);
    }
  }

  // Normal ping endpoint (Root URL)
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('🤖 GitHub Commit Bot is 100% running in background... To seed data, go to /seed');
});

async function initApp() {
  console.log('🚀 Starting GitHub Commit Bot...');
  
  try {
    // 1. Database Connect Karein
    await connectDB();
    
    // 2. Dummy HTTP Server Start Karein (Port Scan Timeout ko rokne ke liye)
    server.listen(PORT, () => {
      console.log(`🌐 Dummy Web Server listening on port ${PORT} (Render Free Tier Safe!)`);
    });

    // 3. Automation Worker Start Karein
    console.log('⚙️ Starting Auto-Committer Worker...\n');
    startWorker();
    
  } catch (error) {
    console.error('❌ Application start hone me error aaya:', error.message);
    process.exit(1);
  }
}

// App ko kickstart karo
initApp();
