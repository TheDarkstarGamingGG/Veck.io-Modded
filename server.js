const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

// The "Safe" path for the game assets
const VECK_URL = 'https://veck.io';

app.get('/game-assets/:filename', async (req, res) => {
    try {
        // Your server downloads the 'Suitcase' or 'Brain' from Veck
        const assetUrl = `${VECK_URL}/${req.params.filename}`;
        const response = await axios({
            method: 'get',
            url: assetUrl,
            responseType: 'stream'
        });
        
        // Your server hands it to your browser as if it's YOUR file
        response.data.pipe(res);
    } catch (e) {
        res.status(404).send("Asset not found");
    }
});

app.get('/', async (req, res) => {
    const response = await axios.get(VECK_URL);
    let html = response.data;

    // THE HIJACK: We rewrite the HTML so it looks for files on OUR server
    // instead of Veck's server.
    html = html.replace(/src="/g, 'src="/game-assets/');
    html = html.replace(/url: "/g, 'url: "/game-assets/');

    // Inject your God Mode script here too
    const hack = `<script>console.log("SMUGGLED VERSION ACTIVE");</script>`;
    res.send(html.replace('<head>', '<head>' + hack));
});

app.listen(PORT, () => console.log("Smuggler Server Live"));
