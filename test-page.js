const http = require('http');

// Function to make an HTTP request
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      
      // A chunk of data has been received
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // The whole response has been received
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
      
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Test the about page
async function testPage() {
  try {
    const response = await fetchPage('http://localhost:3003/about');
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Content Type: ${response.headers['content-type']}`);
    console.log(`Content Length: ${response.data.length} bytes`);
    console.log(`First 500 characters: ${response.data.substring(0, 500)}...`);
  } catch (error) {
    console.error('Error fetching page:', error);
  }
}

// Run the test
testPage();
