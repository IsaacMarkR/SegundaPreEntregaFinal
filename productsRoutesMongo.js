const express = require('express');
const Product = require('./Product');

module.exports = function(io) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const { page = 1, limit = 10, sort = 'createdAt', order = -1 } = req.query;
        try {
            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sort: { [sort]: order }
            };
            const result = await Product.paginate({}, options);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Error retrieving products' });
        }
    });

    router.post('/', async (req, res) => {
        const { title, description, price, code, stock, category, thumbnails = [] } = req.body;
        const product = new Product({ title, description, price, code, stock, category, thumbnails });
        
        try {
            const savedProduct = await product.save();
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
            io.emit('productDeleted', { id: req.params.id });
            res.json({ message: 'Product deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting product' });
        }
    });

    return router;
};