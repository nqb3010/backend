const { where } = require("sequelize");
const db = require("../models/index");
const { parse } = require("path");
const { url } = require("inspector");
const { raw } = require("body-parser");
const product = require("../models/product");
require('dotenv').config();

const processedProducts = (products, getAll = false) => {
    return products.map(product => {
        const images = product.url_img ? product.url_img.split(';') : [];
        return {
            ...product,
            url_img: getAll ? images : (images[0] || '')
        };
    });
};


const getProducts = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const limit = parseInt(process.env.LIMIT_PRODUCTS) || 10;
            const page = parseInt(data.page, 10) || 1;
            const offset = limit * (page - 1);
        if(data.type === 'all') {
            const products = await db.Product.findAll({
                attributes: ['id', 'name', 'price', 'discount', 'url_img'],
                order : db.sequelize.random(),
                limit: limit,
                offset: offset
            });
            const totalProducts = await db.Product.count();
            const totalPages = Math.ceil(totalProducts / limit);
            const url_imgProducts = processedProducts(products, false);
            if(page > totalPages) {
                resolve([]);
            }
            resolve({
                totalPages: totalPages,
                currentPage: page,
                products: url_imgProducts
            });
        }
        if(data.type === 'new') {
            const products = await db.Product.findAll({
                attributes: ['id', 'name', 'price', 'discount', 'url_img'],
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: offset
            });
            const totalProducts = await db.Product.count();
            const totalPages = Math.ceil(totalProducts / limit);
            const url_imgProducts = processedProducts(products, false);
            if(page > totalPages) {
                resolve([]);
            }
            resolve({
                totalPages: totalPages,
                currentPage: page,
                products: url_imgProducts
            });
        }
        if (!data.type) {
            resolve([]);
        } 
        console.log(data);    
        const products = await db.Product.findAll({
            where: data.type ? { type: data.type } : {},
            attributes: ['id', 'name', 'price', 'discount', 'url_img'],
            limit: limit,
            offset: offset
        });        
        const totalProducts = await db.Product.count( { where: data.type ? { type: data.type } : {} });
        const totalPages = Math.ceil(totalProducts / limit);
        const url_imgProducts = processedProducts(products, false);
        if(page > totalPages) {
            resolve([]);
        }
        resolve({
            totalPages: totalPages,
            currentPage: page,
            products: url_imgProducts
        });
        }
        catch (error) {
            reject(error);
        }
    });
}
const getProductById = async (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await db.Product.findByPk(id, {
                include: [
                    {
                        model: db.ProductSize,
                        as: 'sizes',
                        attributes: ['size', 'quantity'],
                        quantity: { [db.Sequelize.Op.gt]: 0 }
                    },
                ],
                raw: false,
            });
        const result = product.toJSON();
        const url_imgProducts = processedProducts([result], true);
            resolve(url_imgProducts);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    getProducts,
    getProductById,
}