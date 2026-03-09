const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 3000;

// THE INJECTOR LOGIC
const responseInterceptor = (proxyRes, req, res) => {
    let body = Buffer.from([]);
    proxyRes.on('data', (data) => { body = Buffer.concat([body, data]); });
    
    proxyRes.on('end', () => {
        const contentType = proxyRes.headers['content-type'];
        
        // Only inject into HTML files
        if (contentType && contentType.includes('text/html')) {
            let html = body.toString();
            console.log("INTERCEPTED HTML - INJECTING CHEATS...");

            // The 'Smuggle' - We add our script right before the </body> tag
            const cheatScript = `
                <script>
                    console.log('SERVER-SIDE INJECTION SUCCESSFUL');
                    window.addEventListener('load', () => {
                        setInterval(() => {
                            if (window.unityInstance) {
                                window.unityInstance.SendMessage('Player', 'SetGravity', 0);
                                window.unityInstance.SendMessage('Player', 'SetCollision', false);
                            }
                        }, 5000);
                    });
                </script>
            `;
            html = html.replace('</body>', cheatScript + '</body>');
            res.end(html);
        } else {
            res.end(body);
        }
    });
};

// THE PROXY: This makes your Render URL act as 'Veck.io'
app.use('/', createProxyMiddleware({
    target: 'https://veck.io',
    changeOrigin: true,
    selfHandleResponse: true,
    onProxyRes: responseInterceptor,
    on: {
        proxyReq: (proxyReq) => {
            // Hide the fact that we are a proxy from Veck's servers
            proxyReq.setHeader('Referer', 'https://veck.io');
        }
    }
}));

app.listen(PORT, () => console.log(`Injector Server active on port ${PORT}`));
