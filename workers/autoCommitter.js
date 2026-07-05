const CommitJob = require('../models/CommitJob');
const { makeBackdatedCommit } = require('../services/githubService');
const { sleep, getRandomDelay } = require('../utils/delayHelper');

async function startWorker() {
  console.log('👷 Auto-Committer Worker shuru ho gaya hai!');
  console.log('⏳ Database se PENDING jobs dhoondh raha hu...\n');

  while (true) {
    let job = null;

    try {
      // 1. Database se sabse pehla (chronological order me) PENDING job nikaalo
      job = await CommitJob.findOne({ status: 'PENDING' }).sort({ date: 1 });

      // Agar koi job nahi bachi, toh 30 seconds wait karo aur fir se check karo
      if (!job) {
        console.log('💤 Saare commits ho chuke hain ya koi PENDING job nahi hai. 30 sec wait kar raha hu...');
        await sleep(30000); // 30 seconds wait
        continue;
      }

      console.log(`📦 Processing Job -> Date: [${job.date}] | Msg: "${job.message}"`);

      // 2. GitHub API ko call karke backdated commit bhejho
      await makeBackdatedCommit(job.date, job.message);

      // 3. Agar API call success ho gayi, toh database me status update karo
      job.status = 'COMPLETED';
      await job.save();
      console.log(`✅ Success! GitHub par commit register ho gaya: ${job.date}`);

      // 4. Rate-Limiting (Anti-Abuse): GitHub ko spam na lage isliye random delay
      const delay = getRandomDelay();
      console.log(`⏸️ Rate limit safety ke liye ${Math.round(delay / 1000)} seconds ka rest...\n`);
      await sleep(delay);

    } catch (error) {
      console.error('⚠️ Worker loop me error aaya:', error.message);

      // Agar kisi specific job ko process karte waqt fail hua hai
      if (job) {
        job.retryCount += 1;
        
        // Agar 3 baar se zyada fail ho chuka hai, toh FAILED mark karke aage badho
        if (job.retryCount >= 3) {
          job.status = 'FAILED';
          console.log(`❌ Job [${job.date}] 3 baar fail ho chuka hai. Isko FAILED mark kar diya hai.\n`);
        } else {
          console.log(`🔄 Job [${job.date}] fail hua. Retry # ${job.retryCount} agli loop me hoga.\n`);
        }
        await job.save();
      }

      // Error aane par bhi thoda wait karo taaki API bar-bar hit na ho
      await sleep(10000); // 10 sec cooldown
    }
  }
}

module.exports = {
  startWorker
};
