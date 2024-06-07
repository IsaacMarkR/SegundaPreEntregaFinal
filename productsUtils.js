const fs = require('fs').promises;
const path = './products.json';

async function loadProducts() {
    try {
        const data = await fs.readFile(path, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('Error reading the products file');
    }
}

module.exports = { loadProducts };