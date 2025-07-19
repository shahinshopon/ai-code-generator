// app/api/gitpod/get-preview/route.js
export async function POST(request) {
    try {
      const { workspaceId } = await request.json();
      const gitpodToken = process.env.GITPOD_ACCESS_TOKEN;
  
      if (!gitpodToken) {
        return Response.json({ error: 'Gitpod token not configured' }, { status: 500 });
      }
  
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes timeout
  
      while (attempts < maxAttempts) {
        const statusResponse = await fetch(`https://api.gitpod.io/v1/workspaces/${workspaceId}`, {
          headers: {
            'Authorization': `Bearer ${gitpodToken}`
          }
        });
  
        if (!statusResponse.ok) {
          throw new Error('Failed to get workspace status');
        }
  
        const workspace = await statusResponse.json();
        
        if (workspace.status?.phase === 'running') {
          // Try to get specific port
          const portsResponse = await fetch(`https://api.gitpod.io/v1/workspaces/${workspaceId}/ports`, {
            headers: {
              'Authorization': `Bearer ${gitpodToken}`
            }
          });
  
          if (portsResponse.ok) {
            const ports = await portsResponse.json();
            const previewPort = ports.find(port => 
              port.port === 3000 || port.port === 8080 || port.port === 5000 || port.port === 4000
            );
            
            if (previewPort && previewPort.url) {
              return Response.json({ url: previewPort.url });
            }
          }
          
          // Fallback to default workspace URL
          const previewUrl = `https://${workspaceId}.ws-us-east1.gitpod.io/`;
          return Response.json({ url: previewUrl });
        }
        
        // Wait 10 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;
      }
      
      throw new Error('Workspace failed to start within timeout');
      
    } catch (error) {
      console.error('Get preview error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  }