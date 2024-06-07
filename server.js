const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const { loadProducts } = require('./productsUtils');
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = 8017;

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const productRoutes = require('./productRoutes')(io);
const cartRoutes = require('./cartRoutes')(io);

app.use(express.json());
app.use('/products', productRoutes);
app.use('/api/carts', cartRoutes);

app.get('/', async (req, res) => {
    const products = await require('./productRoutes').loadProducts(io);
    res.render('home', { products, layout: 'main' });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { layout: false });
});

io.on('connection', (socket) => {
    console.log('A user connected');

    async function emitCurrentProducts() {
        try {
            const products = await loadProducts();
            socket.emit('updateProducts', products);
        } catch (error) {
            console.error('Failed to load products for a new connection:', error);
        }
    }

    emitCurrentProducts();
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});