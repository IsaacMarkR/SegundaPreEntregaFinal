const express = require('express');
const Product = require('./Product');

module.exports = function(io) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const { page = 1, limit = 10, category, available, sortByPrice } = req.query;
    
        let query = {};
        if (category) {
            query.category = category;
        }
        if (available !== undefined) {
            query.available = available === 'true';
        }
    
        let sort = {};
        if (sortByPrice) {
            sort.price = sortByPrice === 'asc' ? 1 : -1;
        }
    
        try {
            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sort: sort
            };
    
            const result = await Product.paginate(query, options);
            res.json({
                status: 'success',
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.hasPrevPage ? result.prevPage : null,
                nextPage: result.hasNextPage ? result.nextPage : null,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}` : null,
                nextLink: result.hasNextPage ? `/products?page=${result.nextPage}` : null
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve products'
            });
        }
    });

    router.get('/:id', async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Product not found'
                });
            }
            io.emit('productFetched', product);
    
            res.json({
                status: 'success',
                payload: product
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve product'
            });
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