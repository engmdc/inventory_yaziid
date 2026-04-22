const http = require('http');

const req = http.request('http://localhost:5001/api/store_profiles', { method: 'GET' }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('GET Response:', data));
});
req.on('error', console.error);
req.end();
