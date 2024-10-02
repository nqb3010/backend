const { where } = require("sequelize");
const db = require("../models/index");
const { parse } = require("path");
const { url } = require("inspector");
const { raw } = require("body-parser");
const product = require("../models/product");
const { time } = require("console");
require('dotenv').config();

const processedProducts = (products, getAll = false) => {
    return products.map(product => {
        // Kiểm tra và tách url_img
        const images = Array.isArray(product.url_img) ? product.url_img : (product.url_img ? product.url_img.split(';') : []);
        if(product.sizes){ 
            const sizes = product.sizes && typeof product.sizes.size === 'string' ? product.sizes.size.split(';') : []; 
            return {
                ...product,
                url_img: getAll ? images : (images[0] || ''),
                sizes: getAll ? sizes : (sizes[0] || '')
            };

        }else {
            return {
                ...product,
                url_img: getAll ? images : (images[0] || '')
            };
        }
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
                attributes: ['id', 'name', 'price', 'discount', 'url_img',[db.sequelize.literal(`
                    CASE 
                        WHEN discount > 0 
                        THEN CAST(price - (price * discount / 100) AS Int) 
                        ELSE NULL 
                    END
                `),
                'discounted_price']],
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
                attributes: ['id', 'name', 'price', 'discount', 'url_img',[db.sequelize.literal(`
                    CASE 
                        WHEN discount > 0 
                        THEN CAST(price - (price * discount / 100) AS Int) 
                        ELSE NULL 
                    END
                `),
                'discounted_price']],
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: offset,

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
        console.log("get data product type "+data.type);    
        const products = await db.Product.findAll({
            where: data.type ? { type: data.type } : {},
            attributes: ['id', 'name', 'price', 'discount', 'url_img',[db.sequelize.literal(`
                CASE 
                    WHEN discount > 0 
                    THEN CAST(price - (price * discount / 100) AS Int) 
                    ELSE NULL 
                END
            `),
            'discounted_price']],
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
                        model: db.Size,
                        as: 'sizes',
                        attributes: ['size'],
                    },
                ],
                attributes: {
                    include: [
                        [db.sequelize.literal(`
                            CASE 
                                WHEN discount > 0 
                                THEN CAST(price - (price * discount / 100) AS Int) 
                                ELSE NULL 
                            END
                        `),
                        'discounted_price'],
                    ],
                },
                raw: true,
                nest: true,
            });
            // add time in console.log
            console.log("get data product id "+id);
        const url_imgProducts = processedProducts([product], true);
            resolve(url_imgProducts);
        } catch (error) {
            reject(error);
        }
    });
}

const searchProduct = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const limit = parseInt(process.env.LIMIT_PRODUCTS) || 10;
            const page = parseInt(data.page, 10) || 1;
            const offset = limit * (page - 1);
            const products = await db.Product.findAll({
                where: {
                    name: {
                        [db.Sequelize.Op.like]: `%${data.keyword}%`
                    }
                },
                attributes: ['id', 'name', 'price', 'discount', 'url_img'],
                limit: limit,
                offset: offset
            });
            const totalProducts = await db.Product.count({
                where: {
                    name: {
                        [db.Sequelize.Op.like]: `%${data.keyword}%`
                    }
                }
            });
            const totalPages = Math.ceil(totalProducts / limit);
            const url_imgProducts = processedProducts(products, false);
            if(page > totalPages) {
                resolve([]);
            }
            console.log("get data search product "+data.keyword);
            resolve({
                totalPages: totalPages,
                currentPage: page,
                products: url_imgProducts
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    getProducts,
    getProductById,
    searchProduct
}