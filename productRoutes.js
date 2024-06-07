const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { loadProducts } = require('./productsUtils');
const path = './products.json';

async function saveProducts(products) {
    await fs.writeFile(path, JSON.stringify(products, null, 2), 'utf8');
}

module.exports = function(io) {

    router.get('/', async (req, res) => {
        try {
            const data = await fs.readFile(path, 'utf8');
            let products = JSON.parse(data);
            const limit = parseInt(req.query.limit, 10);
    
            if (limit) {
                products = products.slice(0, limit);
            }
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: 'Error reading the products file' });
        }
    });
    
    router.post('/', async (req, res) => {
        try {
            const { title, description, code, price, stock, category, thumbnails = [] } = req.body;
            if (!title || !description || !code || !price || !stock || !category) {
                return res.status(400).send('Missing required fields');
            }
            const products = await loadProducts();
            if (products.some(product => product.code === code)) {
                return res.status(409).send('Product with this code already exists');
            }
    
            const newProduct = {
                id: uuidv4(),
                title,
                description,
                code,
                price,
                status: true, 
                stock,
                category,
                thumbnails
            };
            products.push(newProduct);
            await saveProducts(products);
            io.emit('updateProducts', products);
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add product' });
        }
    });
    
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const products = await loadProducts();
        const productIndex = products.findIndex(p => p.id === id);
        if (productIndex === -1) {
            return res.status(404).send('Product not found');
        }
    
        const updatedProduct = { ...products[productIndex], ...req.body };
        products[productIndex] = updatedProduct;
        await saveProducts(products);
        io.emit('updateProducts', products);
        res.json(updatedProduct);
    });
    
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        const products = await loadProducts();
        const newProducts = products.filter(p => p.id !== id);
        if (products.length === newProducts.length) {
            return res.status(404).send('Product not found');
        }
        await saveProducts(newProducts);
        io.emit('updateProducts', products);
        res.send('Product deleted');
    });

    return router;
}