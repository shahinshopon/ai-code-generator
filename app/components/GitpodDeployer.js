'use client';

import { useState } from 'react';

const GitpodDeployer = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  const deployToGitpod = async () => {
    if (!repoUrl) {
      setError('Please enter a repository URL');
      return;
    }

    setIsDeploying(true);
    setError('');
    setPreviewUrl('');

    try {
      // Step 1: Create workspace
      console.log('Creating workspace for:', repoUrl);
      const workspaceResponse = await fetch('/api/gitpod/create-workspace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl })
      });

      if (!workspaceResponse.ok) {
        const errorData = await workspaceResponse.json();
        throw new Error(errorData.error || 'Failed to create workspace');
      }

      const workspace = await workspaceResponse.json();
      console.log('Workspace created:', workspace.id);

      // Step 2: Wait for workspace to be ready
      const previewResponse = await fetch('/api/gitpod/get-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspaceId: workspace.id })
      });

      if (!previewResponse.ok) {
        const errorData = await previewResponse.json();
        throw new Error(errorData.error || 'Failed to get preview URL');
      }

      const preview = await previewResponse.json();
      console.log('Preview URL:', preview.url);
      setPreviewUrl(preview.url);

    } catch (err) {
      console.error('Deployment error:', err);
      setError(err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  const deployDirect = () => {
    if (!repoUrl) {
      setError('Please enter a repository URL');
      return;
    }

    const directUrl = `https://gitpod.io/#${encodeURIComponent(repoUrl)}`;
    setPreviewUrl(directUrl);
    setError('');
  };

  const resetDeployer = () => {
    setPreviewUrl('');
    setError('');
    setRepoUrl('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          GitHub Repository Deployer
        </h2>

        {!previewUrl ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={deployToGitpod}
                disabled={isDeploying || !repoUrl}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeploying ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deploying...
                  </span>
                ) : (
                  'Deploy with API'
                )}
              </button>

              <button
                onClick={deployDirect}
                disabled={!repoUrl}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Quick Deploy
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}

            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Instructions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Deploy with API:</strong> Uses Gitpod API for full control (requires token)</li>
                <li><strong>Quick Deploy:</strong> Direct Gitpod URL method (works immediately)</li>
                <li>Make sure your repository is public or you have access</li>
                <li>Add a <code>.gitpod.yml</code> file to your repo for custom setup</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Live Preview</h3>
              <button
                onClick={resetDeployer}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Deploy Another
              </button>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Workspace: {repoUrl}</span>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Open in New Tab ↗
                </a>
              </div>
              <iframe
                src={previewUrl}
                width="100%"
                height="700px"
                frameBorder="0"
                title="Project Preview"
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitpodDeployer;