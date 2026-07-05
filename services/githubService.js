const { Octokit } = require('@octokit/rest');

// Octokit instance initialize kar rahe hain PAT ke sath
const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
});

// User details aur branch ko memory me save (cache) rakhne ke liye
let cachedUser = null;

/**
 * GitHub PAT ka use karke User ka Username, Asli Naam, Verified Primary Email aur Default Branch automatically fetch karta hai
 */
async function getAuthenticatedUser() {
  // Agar pehle se fetch kiya hua data hai, toh wahi return kar do (API call bacha lo)
  if (cachedUser) return cachedUser;

  console.log('🔍 GitHub se user aur repository details automatically fetch kar rahe hain...');
  
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

    // 3. Repository ki Default Branch (`main` ya `master`) automatically detect karo
    const repoName = process.env.GITHUB_REPO;
    if (!repoName) {
      throw new Error("❌ .env me GITHUB_REPO ka naam missing hai! Kripya repo ka naam daalein.");
    }

    const { data: repoData } = await octokit.repos.get({
      owner: user.login,
      repo: repoName
    });

    // Details ko cache me store kar lo
    cachedUser = {
      owner: user.login,                         // Aapka GitHub Username (@handle)
      name: user.name || user.login,             // Aapka Profile Name
      email: primaryEmailObj.email,              // Aapka Primary Verified Email
      repo: repoName,                            // .env se Repository ka naam
      branch: repoData.default_branch || 'main'  // Repo ki default branch
    };

    console.log(`👤 Verified User found: ${cachedUser.name} (@${cachedUser.owner})`);
    console.log(`📧 Verified Email found: ${cachedUser.email}`);
    console.log(`📁 Target Repository: ${cachedUser.owner}/${cachedUser.repo} [Branch: ${cachedUser.branch}]\n`);

    return cachedUser;
  } catch (error) {
    console.error('❌ User details fetch karne me error aaya:', error.message);
    throw error;
  }
}

/**
 * Low-Level Git Database API ka use karke 100% Real Backdated Commit karta hai
 * (Ye API GitHub ko force karta hai ki hamari Past Date ko hi Author Date aur Commit Date maane!)
 */
async function makeBackdatedCommit(date, message) {
  try {
    // PAT se automatically nikaali gayi details yahan fetch hongi
    const user = await getAuthenticatedUser();
    const { owner, repo, branch, name, email } = user;

    // Har commit ke liye ek unique file name generate kar rahe hain taaki SHA collision na ho
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const filePath = `contributions/commit-${uniqueId}.md`;
    
    // File ke andar ka dummy content
    const fileContent = `# Automated Graph Art Commit\n- **Date:** ${date}\n- **ID:** ${uniqueId}\n- **Message:** ${message}`;

    // STEP 1: Current branch ka latest Commit SHA (head) nikaalo
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    const latestCommitSha = refData.object.sha;

    // STEP 2: Ek naya Git Tree (structure) banao jisme hamari file add hogi
    const { data: treeData } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: latestCommitSha,
      tree: [
        {
          path: filePath,
          mode: '100644', // 100644 ka matlab normal text file hota hai
          type: 'blob',
          content: fileContent,
        },
      ],
    });

    // STEP 3: Naya Commit banao aur usme hamari PAST DATE force insert karo
    const { data: commitData } = await octokit.git.createCommit({
      owner,
      repo,
      message: message,
      tree: treeData.sha,
      parents: [latestCommitSha],
      author: {
        name: name,
        email: email,
        date: date, // 👈 LOW-LEVEL API GUARANTEES PAST AUTHOR DATE!
      },
      committer: {
        name: name,
        email: email,
        date: date, // 👈 LOW-LEVEL API GUARANTEES PAST COMMITTER DATE!
      },
    });

    // STEP 4: Branch reference (`main` ya `master`) ko naye commit par point kar do
    const { data: updateRefData } = await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: commitData.sha,
    });

    return updateRefData;
  } catch (error) {
    // API error ko cleanly catch aur handle karna
    const errorMessage = error.response ? error.response.data.message : error.message;
    console.error(`❌ GitHub Git API Error [${date}]:`, errorMessage);
    throw new Error(errorMessage);
  }
}

module.exports = {
  makeBackdatedCommit,
  getAuthenticatedUser
};
