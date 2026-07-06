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
      
      // "JITU BANNA" draw karne wali exact calculated dates (2026 Graph Matrix)
      const jituBannaDates = [
        // ================= J I T U =================
        // J (Cols 3-6: Jan 11 - Jan 31)
        "2026-01-11", "2026-01-17", "2026-01-18", "2026-01-24", 
        "2026-01-25", "2026-01-29", "2026-01-30", "2026-01-31",
        // I (Cols 8-10: Feb 15 - Feb 28)
        "2026-02-15", "2026-02-21", "2026-02-22", "2026-02-23", 
        "2026-02-24", "2026-02-25", "2026-02-26", "2026-02-27", "2026-02-28",
        // T (Cols 12-14: Mar 15 - Mar 28)
        "2026-03-15", "2026-03-21", "2026-03-22", "2026-03-23", 
        "2026-03-24", "2026-03-25", "2026-03-26", "2026-03-27", "2026-03-28",
        // U (Cols 16-19: Apr 12 - May 02)
        "2026-04-12", "2026-04-13", "2026-04-14", "2026-04-15", "2026-04-16", "2026-04-17",
        "2026-04-24", "2026-05-01", "2026-04-19", "2026-04-20", "2026-04-21", "2026-04-22", "2026-04-23", "2026-05-02",

        // ================= B A N N A =================
        // B (Cols 22-25: May 24 - Jun 13) - Special cleanly styled loops
        "2026-05-24", "2026-05-25", "2026-05-26", "2026-05-27", "2026-05-28", "2026-05-29", "2026-05-30",
        "2026-05-31", "2026-06-03", "2026-06-06", "2026-06-07", "2026-06-10", "2026-06-13",
        "2026-06-08", "2026-06-09", "2026-06-11", "2026-06-12",
        // A (Cols 27-30: Jun 28 - Jul 18)
        "2026-06-29", "2026-06-30", "2026-07-01", "2026-07-02", "2026-07-03",
        "2026-06-28", "2026-07-01", "2026-07-05", "2026-07-08", "2026-07-12", "2026-07-15",
        "2026-07-06", "2026-07-07", "2026-07-08", "2026-07-09", "2026-07-10",
        // N 1 (Cols 32-35: Aug 02 - Aug 22) - Custom 4-block width to avoid stairs look
        "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07", "2026-08-08",
        "2026-08-10", "2026-08-11", "2026-08-18", "2026-08-19",
        "2026-08-16", "2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22",
        // N 2 (Cols 37-40: Sep 06 - Sep 26) - Custom 4-block width
        "2026-09-06", "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12",
        "2026-09-14", "2026-09-15", "2026-09-22", "2026-09-23",
        "2026-09-20", "2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25", "2026-09-26",
        // A (Cols 42-45: Oct 11 - Oct 31)
        "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16",
        "2026-10-11", "2026-10-14", "2026-10-18", "2026-10-21", "2026-10-25", "2026-10-28",
        "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23"
      ];

      // Purane jobs delete karo
      await CommitJob.deleteMany({});
      const jobsToInsert = [];

      // Har din ke liye 4 dark-green commits generate honge taaki graph me vibrant green color aaye
      jituBannaDates.forEach((dateString) => {
        for (let i = 1; i <= 4; i++) {
          jobsToInsert.push({
            date: `${dateString}T12:0${i}:00Z`,
            message: `chore: graph art JITU BANNA [${dateString} #${i}]`,
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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; margin-top: 50px; background: #0d1117; color: #c9d1d9; padding: 40px; border-radius: 12px; max-width: 600px; margin-left: auto; margin-right: auto; border: 1px solid #30363d;">
          <h1 style="color: #3fb950; font-size: 28px;">🎉 Magic Success!</h1>
          <p style="font-size: 16px;">Total <b>${jobsToInsert.length} commit jobs</b> for <span style="color: #58a6ff; font-weight: bold;">"JITU BANNA"</span> database me successfully load ho gaye hain!</p>
          <p style="font-size: 14px; color: #8b949e; margin-top: 20px;">Worker ab background me automatic low-level Git commits karna shuru kar chuka hai. Render ke logs check karo! 🚀</p>
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
  res.end('🤖 GitHub Commit Bot (JITU BANNA Edition) is 100% running in background... To seed data, go to /seed');
});

async function initApp() {
  console.log('🚀 Starting GitHub Commit Bot (JITU BANNA Edition)...');
  
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
