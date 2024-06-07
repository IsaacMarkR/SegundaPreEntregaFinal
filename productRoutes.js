// Deprecated

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
            let query = Product.find({});
            const limit = parseInt(req.query.limit, 10);
            if (limit) {
                query = query.limit(limit);
            }
            const products = await query.exec();
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: 'Error retrieving products' });
        }
    });
    
    router.post('/', async (req, res) => {
        const { title, description, code, price, stock, category, thumbnails = [] } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).send('Missing required fields');
        }
        
        try {
            const existingProduct = await Product.findOne({ code: code });
            if (existingProduct) {
                return res.status(409).send('Product with this code already exists');
            }
    
            const newProduct = new Product({ title, description, code, price, stock, category, thumbnails });
            const savedProduct = await newProduct.save();
            io.emit('productAdded', savedProduct);
            res.status(201).json(savedProduct);
        } catch (error) {
            res.status(500).json({ error: 'Error adding product' });
        }
    });
    
    router.put('/:id', async (req, res) => {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
            io.emit('productUpdated', updatedProduct);
            res.json(updatedProduct);
        } catch (error) {
            res.status(500).json({ error: 'Error updating product' });
        }
    });
    
    router.delete('/:id', async (req, res) => {
        try {
            const deletedProduct = await Product.findByIdAndDelete(req.params.id);
            if (!deletedProduct) {
                return res.status(404).send('Product not found');
            }
            io.emit('productDeleted', { id: req.params.id });
            res.json({ message: 'Product deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting product' });
        }
    });

    return router;
}