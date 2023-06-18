const WooCommerce = require('../config/woocommerce')

module.exports = {
    fetch: async (request, data) => {
        return new Promise((resolve, reject) => {
            var query = `SELECT transactions.id, transactions.sku, products.name, transactions.qty, products.price,
                        TO_CHAR(transactions.created_at, 'dd/mm/yyyy HH24:MI') as created_at,
                        (CAST(transactions.qty AS DOUBLE PRECISION) * CAST(products.price AS DOUBLE PRECISION)) as amount
                        FROM transactions
                        JOIN products ON products.sku = transactions.sku`

            if(data.search) {
                query += ` WHERE (products.name ILIKE '%${data.search}%' OR products.description ILIKE '%${data.search}%' OR products.sku ILIKE '%${data.search}%')`
            }

            query += ' ORDER BY id DESC'

            if(data.page) {
                query += ` OFFSET ${(data.page-1) * data.limit}`
            }
            
            if(data.limit) {
                query += ` LIMIT ${data.limit}`
            }

            request.pgsql.query(query, (err, data) => {
                    if(err) return reject(err)
                    
                    return resolve(data.rows)
            })
        })
    },

    save: async (request, data) => {
        return new Promise((resolve, reject) => {
            request.pgsql.query(`
                INSERT INTO transactions(sku, qty, created_at)
                VALUES ($1, $2, $3)
                RETURNING id;`, 
                data, (err, data) => {
                    if(err) return reject(err)
                    
                    return resolve(data.rows[0])
            })
        })
    },

    findById: async (request, id) => {
        return new Promise((resolve, reject) => {
            request.pgsql.query(
                `SELECT transactions.id, transactions.sku, products.name, transactions.qty, products.price,
                TO_CHAR(transactions.created_at, 'dd/mm/yyyy HH:MI') as created_at,
                (CAST(transactions.qty AS DOUBLE PRECISION) * CAST(products.price AS DOUBLE PRECISION)) as amount
                FROM transactions
                JOIN products ON products.sku = transactions.sku
                 WHERE transactions.id = $1 LIMIT 1`, 
                [id]
            , (err, data) => {
                if(err) return reject(err)

                return resolve(data.rows[0])
            })
        })
    },

    remove: async (request, id) => {
        return new Promise((resolve, reject) => {
            request.pgsql.query(`
                DELETE FROM transactions
                WHERE id=$1
                RETURNING id;`, 
                [id], (err, data) => {
                    if(err) return reject(err)
                    
                    return resolve(data.rows[0])
            })
        })
    },

    update: async (request, id, data) => {
        return new Promise(async (resolve, reject) => {
            request.pgsql.query(`
                UPDATE transactions SET sku=$1, qty=$2
                WHERE id='${id}'
                RETURNING *;`, 
                data, (err, data) => {
                    if(err) return reject(err)
                    
                    return resolve(data.rows[0])
            })
        })
    }
}