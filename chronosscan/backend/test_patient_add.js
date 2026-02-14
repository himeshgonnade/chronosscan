const http = require('http');

function testAddPatient() {
    const data = JSON.stringify({
        name: "Test Patient Node",
        age: 28,
        gender: "Female"
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/patient',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log('Response Body:', body);
            if (res.statusCode === 201) {
                console.log("SUCCESS: Patient added.");
            } else {
                console.log("FAILURE: Check server logs.");
            }
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.write(data);
    req.end();
}

testAddPatient();
