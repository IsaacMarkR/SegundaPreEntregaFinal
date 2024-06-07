require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const Product = require('./Product');
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = 8017;
const mongoURI = process.env.MONGO_URI;

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const productRoutes = require('./productsRoutesMongo')(io);
const cartRoutes = require('./cartRoutesMongo')(io);

app.use(express.json());
app.use('/products', productRoutes);
app.use('/api/carts', cartRoutes);

app.get('/', async (req, res) => {
    res.render('realTimeProducts', { layout: 'main' });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { layout: false });
});

io.on('connection', (socket) => {
    console.log('A user connected');

    function emitProduct(page = 1) {
        const limit = 1;
        const options = {
            page: page,
            limit: limit,
            sort: { createdAt: -1 }
        };

        Product.paginate({}, options).then(result => {
            socket.emit('updateProducts', {
                product: result.docs[0],
                totalPages: result.totalPages,
                currentPage: result.page
            });
        }).catch(error => {
            console.error('Failed to load product:', error);
        });
    }

    emitProduct(); // Emitir el primer producto al conectar

    socket.on('requestPage', (page) => {
        emitProduct(page); // Emitir el producto cuando se solicita otra página
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log(err));

httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});