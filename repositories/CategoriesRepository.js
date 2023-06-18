module.exports = {
    save: async (request, data) => {
        return new Promise((resolve, reject) => {
            request.pgsql.query(`
                INSERT INTO categories(id, name, slug)
                VALUES ($1, $2, $3)
                RETURNING id;`, 
                data, (err, data) => {
                    if(err) return reject(err)
                    
                    return resolve(data)
            })
        })
    },

    findById: async (request, id) => {
        return new Promise((resolve, reject) => {
            request.pgsql.query(
                `SELECT * FROM categories WHERE id = $1 LIMIT 1`, 
                [id]
            , (err, data) => {
                if(err) return reject(err)

                return resolve(data.rows[0])
            })
        })
    },
}