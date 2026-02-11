// products.js

// Product Management Module
const products = [];

function addProduct(product) {
    products.push(product);
    console.log('Product added:', product);
}

function getProducts() {
    return products;
}

function getProduct(id) {
    return products.find(product => product.id === id);
}

function updateProduct(id, updatedProduct) {
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
        products[index] = {...products[index], ...updatedProduct};
        console.log('Product updated:', products[index]);
    }
}

function deleteProduct(id) {
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
        const deletedProduct = products.splice(index, 1);
        console.log('Product deleted:', deletedProduct);
    }
}

module.exports = {
    addProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
};