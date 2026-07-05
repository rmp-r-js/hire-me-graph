const { Octokit } = require('@octokit/rest');

// Octokit instance initialize kar rahe hain PAT ke sath
const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
});

// User details ko memory me save (cache) rakhne ke liye taaki har commit pe API call na ho
let cachedUser = null;

/**
 * GitHub PAT ka use karke User ka Username, Asli Naam, aur Verified Primary Email automatically fetch karta hai
 */
async function getAuthenticatedUser() {
  // Agar pehle se fetch kiya hua data hai, toh wahi return kar do (API call bacha lo)
  if (cachedUser) return cachedUser;

  console.log('🔍 PAT se GitHub user details automatically fetch kar rahe hain...');
  
  try {
    // 1. GitHub Account ka Username (login) aur Name fetch karo
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    // 2. Account se linked saari Emails fetch karo
    const { data: emails } = await octokit.rest.users.listEmailsForAuthenticated();
    
    // Sabse pehle Primary + Verified email dhoondo, na mile toh koi bhi Verified, warna pehli email
    const primaryEmailObj = emails.find(e => e.primary && e.verified) || 
                            emails.find(e => e.verified) || 
                            emails[0];

    if (!primaryEmailObj) {
      throw new Error("❌ GitHub account me koi verified email nahi mila! Green dots ke liye verified email zaroori hai.");
    }

    // Details ko cache me store kar lo
    cachedUser = {
      owner: user.login,                         // Aapka GitHub Username (@handle)
      name: user.name || user.login,             // Aapka Profile Name
      email: primaryEmailObj.email,              // Aapka Primary Verified Email (Green dots ke liye most important!)
      repo: process.env.GITHUB_REPO              // .env se Repository ka naam
    };

    console.log(`👤 Verified User found: ${cachedUser.name} (@${cachedUser.owner})`);
    console.log(`📧 Verified Email found: ${cachedUser.email}`);
    console.log(`📁 Target Repository: ${cachedUser.repo}\n`);

    return cachedUser;
  } catch (error) {
    console.error('❌ User details fetch karne me error aaya. Kya PAT token sahi hai aur usme permissions hain?');
    throw error;
  }
}

/**
 * GitHub repository me ek unique file create karke backdated commit karta hai
 */
async function makeBackdatedCommit(date, message) {
  try {
    // PAT se automatically nikaali gayi details yahan fetch hongi
    const user = await getAuthenticatedUser();

    if (!user.repo) {
      throw new Error("❌ .env me GITHUB_REPO ka naam missing hai! Kripya repo ka naam daalein.");
    }

    // Har commit ke liye ek unique file name generate kar rahe hain taaki SHA collision na ho
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const filePath = `contributions/commit-${uniqueId}.md`;
    
    // File ke andar ka dummy content
    const fileContent = `# Automated Graph Art Commit\n- **Date:** ${date}\n- **ID:** ${uniqueId}\n- **Message:** ${message}`;

    // GitHub API call to create file with custom author/committer dates
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: user.owner,        // 👈 Auto-fetched Username
      repo: user.repo,          // 👈 .env se Repo Name
      path: filePath,
      message: message,
      content: Buffer.from(fileContent).toString('base64'), // GitHub API ko Base64 string chahiye hoti hai
      author: {
        name: user.name,        // 👈 Auto-fetched Real Name
        email: user.email,      // 👈 Auto-fetched Primary Email (Green dot guaranteed)
        date: date              // 👈 MAIN MAGIC: Author date ko past me set kiya
      },
      committer: {
        name: user.name,        // 👈 Auto-fetched Real Name
        email: user.email,      // 👈 Auto-fetched Primary Email (Green dot guaranteed)
        date: date              // 👈 MAIN MAGIC: Committer date ko past me set kiya
      }
    });

    return response.data;
  } catch (error) {
    // API error ko cleanly catch aur handle karna
    const errorMessage = error.response ? error.response.data.message : error.message;
    console.error(`❌ GitHub API Error [${date}]:`, errorMessage);
    throw new Error(errorMessage);
  }
}

module.exports = {
  makeBackdatedCommit,
  getAuthenticatedUser
};
