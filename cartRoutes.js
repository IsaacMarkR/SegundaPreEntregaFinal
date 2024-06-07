const express = require('express');
const fs = require('fs').promises;
const path = './carts.json';

module.exports = function(io) { 
    const router = express.Router();

    async function loadCarts() {
        try {
            const data = await fs.readFile(path, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error('Error reading the carts file');
        }
    }

    async function saveCarts(carts) {
        await fs.writeFile(path, JSON.stringify(carts, null, 2), 'utf8');
    }

    router.get('/:cid', async (req, res) => {
        try {
            const carts = await loadCarts();
            const cart = carts.find(cart => cart.id === req.params.cid);
            if (cart) {
                res.json(cart.products);
            } else {
                res.status(404).send('Cart not found');
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve cart' });
        }
    });

    router.post('/:cid/product/:pid', async (req, res) => {
        try {
            const carts = await loadCarts();
            const cartIndex = carts.findIndex(cart => cart.id === req.params.cid);
            if (cartIndex === -1) {
                return res.status(404).send('Cart not found');
            }
            const product = carts[cartIndex].products.find(p => p.product === req.params.pid);
            if (product) {
                product.quantity += 1; 
            } else {
                carts[cartIndex].products.push({ product: req.params.pid, quantity: 1 });
            }
            await saveCarts(carts);
            io.emit('cartUpdated', carts[cartIndex]); 
            res.status(201).json(carts[cartIndex].products);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add product to cart' });
        }
    });

    return router;
};