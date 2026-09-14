const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('catalogoServiciosSP.pdf');
pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('catalogo.txt', data.text);
    console.log("Extracted " + data.numpages + " pages.");
}).catch(err => {
    console.error("Error reading PDF:", err);
});
