const WooCommerce = require('../config/woocommerce')

module.exports = {
    download: async (query) => {
        return new Promise((resolve, reject) => {
            WooCommerce.get("products", query, (err, data) => {
                if(err) return reject(err)

                resolve(data)
            })
        })
    },

    fetch: async (request, data) => {
        return new Promise((resolve, reject) => {
            var query = `SELECT *,
                        coalesce((stock - coalesce((SELECT sum(qty) FROM transactions WHERE sku = products.sku), 0)), 0) as stock,
                        (SELECT json_agg(categories.name) as categories FROM product_categories 
                        JOIN categories on categories.id = product_categories.category_id 
                        WHERE sku = products.sku) FROM products`

            if(data.search || data.category_id)
            {
                query += ` WHERE`
            }

            if(data.search) {
                query += ` (products.name ILIKE '%${data.search}%' OR products.description ILIKE '%${data.search}%' OR products.sku ILIKE '%${data.search}%')`
                
                if(data.category_id) {
                    query += ` AND products.sku IN (SELECT sku FROM product_categories WHERE category_id = '${data.category_id}')`
                }
            }else if(data.category_id) {
                query += ` products.sku IN (SELECT sku FROM product_categories WHERE category_id = '${data.category_id}')`
            }

            query += ' ORDER BY id DESC'

            if(data.page) {
                query += ` OFFSET ${(data.page-1) * data.limit}`
            }
            
            if(data.limit) {
                query += ` LIMIT ${data.limit}`
            }

            console.log(query)

            request.pgsql.query(query, (err, data) => {
                    if(err) return reject(err)
                    
                    return resolve(data.rows)
            })
        })
    },

    save: async (request, data) => {
        return new Promise((resolve, reject) => {
            request.pgsql.query(`
                INSERT INTO products(sku, name, image, price, description, stock, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id;`, 
                data, (err, data) => {
                    if(err) return reject(err)
                    
                    return resolve(data.rows[0])
            })
        })
    },

    saveCategory: async (request, data) => {
        console.log(data);
        return new Promise((resolve, reject) => {
            request.pgsql.query(`
                INSERT INTO product_categories(sku, category_id)
                VALUES ($1, $2)
                RETURNING id;`, 
                data, (err, data) => {
                    if(err) return reject(err)
                    
                    return resolve(data)
            })
        })
    },

    deleteCategory: async (request, sku) => {
        return new Promise(async (resolve, reject) => {
            request.pgsql.query(`
                DELETE FROM product_categories
                WHERE sku=$1;`, 
                [sku], (err, data) => {
                    if(err) return reject(err)
                    
                    return resolve(data)
            })
        })
    },

    findBySku: async (request, sku) => {
        return new Promise((resolve, reject) => {
            request.pgsql.query(
                `SELECT *, coalesce((stock - coalesce((SELECT sum(qty) FROM transactions WHERE sku = products.sku), 0)), 0) as stock
                 FROM products WHERE sku = $1 LIMIT 1`, 
                [sku]
            , (err, data) => {
                if(err) return reject(err)

                return resolve(data.rows[0])
            })
        })
    },

    remove: async (request, sku) => {
        return new Promise((resolve, reject) => {
            request.pgsql.query(`
                DELETE FROM products
                WHERE sku=$1
                RETURNING id;`, 
                [sku], (err, data) => {
                    if(err) return reject(err)
                    
                    return resolve(data.rows[0])
            })
        })
    },

    update: async (request, sku, data) => {
        return new Promise(async (resolve, reject) => {
            request.pgsql.query(`
                UPDATE products SET sku=$1, name=$2, image=$3, price=$4, description=$5
                WHERE sku='${sku}'
                RETURNING *;`, 
                data, (err, data) => {
                    if(err) return reject(err)
                    
                    return resolve(data.rows[0])
            })
        })
    }
}