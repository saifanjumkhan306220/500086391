const http = require('http');
const url = require('url');
const https = require('https');

const PORT = 8008;

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/numbers')) {
    const query = url.parse(req.url, true).query;
    if (query.url && Array.isArray(query.url)) {
      const urls = query.url;
      const uniqueNumbers = new Set();

      const fetchUrlData = async (url) => {
        try {
          const response = await fetch(url, { timeout: 500 });
          if (response.status === 200) {
            const jsonData = await response.json();
            if (jsonData.numbers && Array.isArray(jsonData.numbers)) {
              jsonData.numbers.forEach((number) => {
                uniqueNumbers.add(number);
              });
            }
          }
        } catch (error) {
          // Handle fetch errors here
          console.error(`Error fetching data from ${url}: ${error.message}`);
        }
      };

      const fetchPromises = urls.map((url) => fetchUrlData(url));

      try {
        await Promise.all(fetchPromises);
        const sortedNumbers = Array.from(uniqueNumbers).sort((a, b) => a - b);
        const responseData = JSON.stringify({ numbers: sortedNumbers });

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Length': responseData.length,
        });
        res.end(responseData);
      } catch (error) {
        // Handle errors that occurred during fetching or response building
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    } else {
      res.writeHead(400, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({ error: 'Invalid URL parameter' }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
