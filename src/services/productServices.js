const { where } = require("sequelize");
const db = require("../models/index");
const { parse } = require("path");

const getProducts = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const limit = 24;
            const page = parseInt(data.page, 10) || 1;
            const offset = limit * (page - 1);
        if(data.type === 'all') {
            const products = await db.Product.findAll({
                order : db.sequelize.random(),
                limit: limit,
                offset: offset
            });
            const totalProducts = await db.Product.count();
            const totalPages = Math.ceil(totalProducts / limit);
            if(page > totalPages) {
                resolve([]);
            }
            resolve({
                totalPages: totalPages,
                currentPage: page,
                products: products
            });
        }
        if (!data.type) {
            resolve([]);
        } 
        console.log(data);    
        const products = await db.Product.findAll( { where: data.type ? { type: data.type } : {} },
            {
                limit: limit,
                offset: offset
            }
        );
        const totalProducts = await db.Product.count( { where: data.type ? { type: data.type } : {} });
        const totalPages = Math.ceil(totalProducts / limit);
        if(page > totalPages) {
            resolve([]);
        }
        resolve({
            totalPages: totalPages,
            currentPage: page,
            products: products
        });
        }
        catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    getProducts
};