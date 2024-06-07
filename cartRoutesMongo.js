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

    router.put('/api/carts/:cid', async (req, res) => {
        try {
            const cart = await Cart.findByIdAndUpdate(req.params.cid, {
                $set: { products: req.body.products }
            }, { new: true }).populate('products.product');
            res.json({ success: true, message: 'Cart updated', cart });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating cart', error: error.message });
        }
    });

    router.put('/api/carts/:cid/products/:pid', async (req, res) => {
        try {
            const cart = await Cart.findOneAndUpdate({ "_id": req.params.cid, "products.product": req.params.pid }, {
                "$set": { "products.$.quantity": req.body.quantity }
            }, { new: true }).populate('products.product');
            res.json({ success: true, message: 'Product quantity updated', cart });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating product quantity', error: error.message });
        }
    });

    router.delete('/api/carts/:cid/products/:pid', async (req, res) => {
        try {
            const cart = await Cart.findByIdAndUpdate(req.params.cid, {
                $pull: { products: { product: req.params.pid } }
            }, { new: true }).populate('products.product');
            res.json({ success: true, message: 'Product removed from cart', cart });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error removing product from cart', error: error.message });
        }
    });

    router.delete('/api/carts/:cid', async (req, res) => {
        try {
            const cart = await Cart.findByIdAndUpdate(req.params.cid, {
                $set: { products: [] }
            }, { new: true });
            res.json({ success: true, message: 'All products removed from cart', cart });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error removing all products from cart', error: error.message });
        }
    });

    return router;
};