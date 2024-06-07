const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
        try {
            const fileContent = fs.readFileSync(this.path, 'utf8');
            this.products = JSON.parse(fileContent);
        } catch (error) {
            this.products = [];
        }
    }

    saveProducts() {
        fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2), 'utf8');
    }

    addProduct(title, description, price, thumbnail, code, stock) {
        const product = { title, description, price, thumbnail, code, stock };
        this.products.push(product);
        this.saveProducts();
    }

    removeProduct(code) {
        this.products = this.products.filter(product => product.code !== code);
        this.saveProducts();
    }

    getProductByCode(code) {
        return this.products.find(product => product.code === code);
    }

    updateProduct(code, newData) {
        const index = this.products.findIndex(product => product.code === code);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...newData };
            this.saveProducts();
        }
    }

    getAllProducts() {
        return this.products;
    }
}

const productManager = new ProductManager('./products.json');

productManager.addProduct("Camiseta", "Camiseta de algodón", 199.000, "thumbnail1.jpg", "CA003", 50);
productManager.addProduct("Pantalón", "Pantalón cargo", 299.000, "thumbnail2.jpg", "PA0054", 30);

console.log(productManager.getAllProducts());

productManager.removeProduct("CA003");

console.log(productManager.getAllProducts());

productManager.updateProduct("PA0054", { price: 350.000 });

console.log(productManager.getAllProducts());

const product = productManager.getProductByCode("PA0054");
console.log(product);