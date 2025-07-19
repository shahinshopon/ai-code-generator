// // Backend API Route (Next.js API route: /api/create-preview.js)
// import { Octokit } from '@octokit/rest';

// const REPLIT_API_BASE = 'https://replit.com/api/v1';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   const { githubUrl } = req.body;
  
//   if (!githubUrl) {
//     return res.status(400).json({ message: 'GitHub URL is required' });
//   }

//   try {
//     // Step 1: Parse GitHub URL and get repository info
//     const repoInfo = parseGithubUrl(githubUrl);
    
//     // Step 2: Fetch repository contents from GitHub
//     const repoContents = await fetchGithubRepository(repoInfo);
    
//     // Step 3: Create Replit project
//     const replitProject = await createReplitProject(repoContents, repoInfo);
    
//     // Step 4: Start the project and get preview URL
//     const previewUrl = await startReplitProject(replitProject.id);
    
//     res.status(200).json({
//       success: true,
//       previewUrl: previewUrl,
//       projectId: replitProject.id
//     });
    
//   } catch (error) {
//     console.error('Error creating preview:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to create preview',
//       error: error.message 
//     });
//   }
// }

// // Helper function to parse GitHub URL
// function parseGithubUrl(url) {
//   const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
//   if (!match) {
//     throw new Error('Invalid GitHub URL format');
//   }
  
//   return {
//     owner: match[1],
//     repo: match[2].replace('.git', '')
//   };
// }

// // Fetch repository contents from GitHub
// async function fetchGithubRepository(repoInfo) {
//   const octokit = new Octokit({
//     auth: process.env.GITHUB_TOKEN // Add your GitHub token
//   });

//   try {
//     // Get repository contents recursively
//     const contents = await getRepositoryContents(octokit, repoInfo.owner, repoInfo.repo);
    
//     // Get package.json to determine project type
//     const packageJson = contents.find(file => file.name === 'package.json');
//     let projectType = 'web'; // default
    
//     if (packageJson) {
//       const packageContent = JSON.parse(packageJson.content);
//       if (packageContent.dependencies?.['react-native'] || packageContent.dependencies?.['expo']) {
//         projectType = 'react-native';
//       } else if (packageContent.dependencies?.['flutter']) {
//         projectType = 'flutter';
//       }
//     }
    
//     return {
//       files: contents,
//       projectType: projectType,
//       repoInfo: repoInfo
//     };
    
//   } catch (error) {
//     throw new Error(`Failed to fetch repository: ${error.message}`);
//   }
// }

// // Recursive function to get all repository contents
// async function getRepositoryContents(octokit, owner, repo, path = '') {
//   const response = await octokit.rest.repos.getContent({
//     owner,
//     repo,
//     path
//   });

//   const contents = [];
  
//   for (const item of response.data) {
//     if (item.type === 'file') {
//       // Get file content
//       const fileResponse = await octokit.rest.repos.getContent({
//         owner,
//         repo,
//         path: item.path
//       });
      
//       contents.push({
//         name: item.name,
//         path: item.path,
//         content: Buffer.from(fileResponse.data.content, 'base64').toString('utf-8'),
//         type: 'file'
//       });
//     } else if (item.type === 'dir') {
//       // Skip node_modules and other unnecessary directories
//       if (!['node_modules', '.git', 'build', 'dist'].includes(item.name)) {
//         const subContents = await getRepositoryContents(octokit, owner, repo, item.path);
//         contents.push(...subContents);
//       }
//     }
//   }
  
//   return contents;
// }

// // Create Replit project
// async function createReplitProject(repoContents, repoInfo) {
//   const projectTemplate = getProjectTemplate(repoContents.projectType);
  
//   // Prepare files for Replit
//   const replitFiles = {};
  
//   // Add repository files
//   repoContents.files.forEach(file => {
//     replitFiles[file.path] = file.content;
//   });
  
//   // Add Replit configuration
//   replitFiles['.replit'] = projectTemplate.replitConfig;
//   replitFiles['replit.nix'] = projectTemplate.nixConfig;
  
//   const createResponse = await fetch(`${REPLIT_API_BASE}/repls`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${process.env.REPLIT_TOKEN}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       title: `${repoInfo.repoInfo.repo}-preview`,
//       language: projectTemplate.language,
//       files: replitFiles,
//       isPrivate: true
//     })
//   });
  
//   if (!createResponse.ok) {
//     throw new Error(`Failed to create Replit project: ${createResponse.statusText}`);
//   }
  
//   return await createResponse.json();
// }

// // Start Replit project and get preview URL
// async function startReplitProject(projectId) {
//   // Start the repl
//   const startResponse = await fetch(`${REPLIT_API_BASE}/repls/${projectId}/start`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${process.env.REPLIT_TOKEN}`,
//       'Content-Type': 'application/json'
//     }
//   });
  
//   if (!startResponse.ok) {
//     throw new Error(`Failed to start Replit project: ${startResponse.statusText}`);
//   }
  
//   // Wait for project to be ready and get preview URL
//   const previewUrl = await waitForProjectReady(projectId);
//   return previewUrl;
// }

// // Wait for project to be ready
// async function waitForProjectReady(projectId, maxAttempts = 30) {
//   for (let i = 0; i < maxAttempts; i++) {
//     try {
//       const statusResponse = await fetch(`${REPLIT_API_BASE}/repls/${projectId}`, {
//         headers: {
//           'Authorization': `Bearer ${process.env.REPLIT_TOKEN}`
//         }
//       });
      
//       if (statusResponse.ok) {
//         const project = await statusResponse.json();
//         if (project.url) {
//           return project.url;
//         }
//       }
      
//       // Wait 2 seconds before next attempt
//       await new Promise(resolve => setTimeout(resolve, 2000));
//     } catch (error) {
//       console.error('Error checking project status:', error);
//     }
//   }
  
//   throw new Error('Project failed to start within timeout period');
// }

// // Get project template configuration
// function getProjectTemplate(projectType) {
//   const templates = {
//     'web': {
//       language: 'nodejs',
//       replitConfig: `
// modules = ["nodejs-18"]
// run = "npm start"

// [deployment]
// run = ["sh", "-c", "npm run build && npx serve -s build -l 3000"]

// [env]
// NODE_ENV = "production"
// `,
//       nixConfig: `
// { pkgs }: {
//   deps = [
//     pkgs.nodejs-18_x
//     pkgs.yarn
//   ];
// }
// `
//     },
//     'react-native': {
//       language: 'nodejs',
//       replitConfig: `
// modules = ["nodejs-18"]
// run = "npm start"

// [deployment]
// run = ["sh", "-c", "npx expo start --web --port 3000"]

// [env]
// EXPO_USE_FAST_RESOLVER = "1"
// `,
//       nixConfig: `
// { pkgs }: {
//   deps = [
//     pkgs.nodejs-18_x
//     pkgs.yarn
//   ];
// }
// `
//     },
//     'flutter': {
//       language: 'dart',
//       replitConfig: `
// modules = ["flutter"]
// run = "flutter run -d web-server --web-hostname 0.0.0.0 --web-port 3000"

// [deployment]
// run = ["sh", "-c", "flutter build web --release && python -m http.server 3000 --directory build/web"]
// `,
//       nixConfig: `
// { pkgs }: {
//   deps = [
//     pkgs.flutter
//     pkgs.python3
//   ];
// }
// `
//     }
//   };
  
//   return templates[projectType] || templates['web'];
// }