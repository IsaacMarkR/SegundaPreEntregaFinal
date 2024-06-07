const express = require('express');
const Cart = require('./Cart');

module.exports = function(io) { 
    const router = express.Router();

    router.get('/:cid', async (req, res) => {
        try {
            const cart = await Cart.findById(req.params.cid).populate('products.product');
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
            const cart = await Cart.findById(req.params.cid);
            if (!cart) {
                return res.status(404).send('Cart not found');
            }
            const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);
            if (productIndex > -1) {
                cart.products[productIndex].quantity += 1;
            } else {
                cart.products.push({ product: req.params.pid, quantity: 1 });
            }
            await cart.save();
            io.emit('cartUpdated', cart);
            res.status(201).json(cart.products);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add product to cart' });
        }
    });

    return router;
};