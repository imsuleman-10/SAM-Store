const http = require('http');
http.get('http://localhost:3000/admin/dashboard', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // try to grab the exact error from nextjs
    const titleMatch = data.match(/<title>(.*?)<\/title>/);
    console.log("Title: ", titleMatch ? titleMatch[1] : 'No title found');

    const errMatch = data.match(/data-nextjs-dialog-header="[^"]+">([^<]+)<\/h1>/);
    if(errMatch) console.log("Header: ", errMatch[1]);
    
    // just print a chunk of data if we can't find it
    if (!titleMatch && !errMatch) {
      console.log(data.slice(0, 1000));
    }
  });
});
