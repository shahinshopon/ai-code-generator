// app/api/gitpod/create-workspace/route.js
export async function POST(request) {
  try {
    const { repoUrl } = await request.json();
    const gitpodToken = process.env.GITPOD_ACCESS_TOKEN;

    if (!gitpodToken) {
      return Response.json({ error: 'Gitpod token not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.gitpod.io/v1/workspaces', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gitpodToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contextUrl: repoUrl
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gitpod API Error:', response.status, errorText);
      return Response.json({ error: `Failed to create workspace: ${response.status}` }, { status: response.status });
    }

    const workspace = await response.json();
    return Response.json(workspace);
    
  } catch (error) {
    console.error('Create workspace error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}