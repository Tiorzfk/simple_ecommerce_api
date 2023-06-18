const ProductRepo = require('../repositories/ProductsRepository')
const CategoryRepo = require('../repositories/CategoriesRepository')
const fs = require('fs')
const moment = require('moment')

const handleFileUpload = async (file) => {
    const filename = moment().format('Hms')+'_'+file.hapi.filename
    const data = file._data
    return new Promise((resolve, reject) => {
      fs.writeFile(`./upload/${filename}`, data, err => {
         if (err) {
          reject(err)
         }
         resolve({
            id: getRandomNumber(9999),
            date_created: moment().format(),
            date_modified: moment().format(),
            src: '/upload/'+filename,
            name: filename })
      })
    })
}

const getRandomNumber = (max) => {
    return Math.floor(Math.random() * max);
}

module.exports = {
    get: async (request, h) => {
        try {
            var products = await ProductRepo.fetch(request, {
                page: request.query.page ?? 1,
                limit: request.query.limit ?? 10,
                search: request.query.search ?? '',
                category_id: request.query.category_id ?? ''
            })
    
            return h.response({
                statusCode: 200,
                message: "success get product",
                result: products
            })
        } catch (error) {
            console.log(error);
            return h.response({
                statusCode: 500,
                message: "error",
                result: error
            })
        }
    },

    getDetail: async (request, h) => {
        try {
            var product = await ProductRepo.findBySku(request, request.params.sku)
    
            if(product)
            {
                return h.response({
                    statusCode: 200,
                    message: "success get detail product",
                    result: product
                })
            }else{
                return h.response({
                    statusCode: 404,
                    message: "product not found",
                    result: null
                })
            }
            
        } catch (error) {
            console.log(error);
            return h.response({
                statusCode: 500,
                message: "error",
                result: error
            })
        }
    },

    downloadProduct: async (request, h) => {
        try {
            var isEmpty = false
            var result = []
            var page = 1

            while(!isEmpty)
            {
                var product = await ProductRepo.download({
                    page: page
                })
                
                if(product.length == 0)
                {
                    isEmpty = true
                }else{
                    result = result.concat(product)
                    page++
                }
            }
            
            await request.pgsql.query('BEGIN');

            for (let i = 0; i < result.length; i++) {
                if(result[i].sku)
                {
                    await new Promise(async resolve => {
                        const isProductExist = await ProductRepo.findBySku(request, result[i].sku)
    
                        if(!isProductExist)
                        {
                            const inputProduct = [
                                result[i].sku,
                                result[i].name,
                                JSON.stringify(result[i].images),
                                result[i].price,
                                result[i].description,
                                result[i].stock_quantity,
                                result[i].date_created
                            ]
                            
                            await ProductRepo.save(request, inputProduct)
    
                            //save category
                            await ProductRepo.deleteCategory(request, result[i].sku)
                            for (let j = 0; j < result[i].categories.length; j++) {
                                const isCategoryExist = await CategoryRepo.findById(request, result[i].categories[j].id)
    
                                if(!isCategoryExist)
                                {
                                    await CategoryRepo.save(request, [
                                        result[i].categories[j].id,
                                        result[i].categories[j].name,
                                        result[i].categories[j].slug
                                    ])
                                }    
                                
                                await ProductRepo.saveCategory(request, [
                                    result[i].sku,
                                    result[i].categories[j].id
                                ])
                            }
    
                        }
    
                        return resolve(result[i])
                    })
                }

                console.log("ITERATE PRODUCT "+i);
            }

            await request.pgsql.query('COMMIT');
            return h.response({
                statusCode: 200,
                message: "success download product"
            })
        } catch (error) {
            console.log(error);
            await request.pgsql.query('ROLLBACK');
            return h.response({
                statusCode: 500,
                message: "error"
            })
        }
    },

    create: async (request, h) => {
        try {
            const payload = request.payload;
            var payloadImage = []

            if(Array.isArray(payload.image))
            {
                for (let i = 0; i < payload.image.length; i++) {
                    const u = await handleFileUpload(payload.image[i])
                    payloadImage.push(u)
                }
                
            }else if(typeof payload.image === 'object')
            {
                payloadImage.push(await handleFileUpload(payload.image))
            }
            
            await request.pgsql.query('BEGIN');

            const inputSave = [
                payload.sku,
                payload.name,
                JSON.stringify(payloadImage),
                payload.price,
                payload.description,
                payload.stock,
                moment().format()
            ]
            var product = await ProductRepo.save(request, inputSave)

            if(payload.category_id)
            {
                const categories = JSON.parse(payload.category_id)
                
                for (let c = 0; c < categories.length; c++) {
                    const isCategoryExist = await CategoryRepo.findById(request, categories[c])

                    if(isCategoryExist) {
                        await ProductRepo.saveCategory(request, [payload.sku, categories[c]])
                    }
                }
            }
    
            await request.pgsql.query('COMMIT');

            return h.response({
                statusCode: 200,
                message: "success save product",
                result: product
            })
        } catch (error) {
            await request.pgsql.query('ROLLBACK');

            console.log(error);
            return h.response({
                statusCode: 500,
                message: "error",
                result: error
            })
        }
    },

    delete: async (request, h) => {
        try {
            var product = await ProductRepo.findBySku(request, request.params.sku)
            
            if(!product)
            {
                return h.response({
                    statusCode: 404,
                    message: "product not found"
                })
            }

            await ProductRepo.remove(request, request.params.sku)

            return h.response({
                statusCode: 200,
                message: "success delete product",
                result: product
            })
        } catch (error) {
            console.log(error);
            return h.response({
                statusCode: 500,
                message: "error",
                result: error
            })
        }
    },

    update: async (request, h) => {
        try {
            var product = await ProductRepo.findBySku(request, request.params.sku)
            
            if(!product)
            {
                return h.response({
                    statusCode: 404,
                    message: "product not found"
                })
            }

            var imageExisting = product.image
            const payload = request.payload;
            var payloadImage = []

            if(Array.isArray(payload.image_add) && payload.image_add.length > 0)
            {
                for (let i = 0; i < payload.image.length; i++) {
                    const u = await handleFileUpload(payload.image_add[i])
                    payloadImage.push(u)
                }
                
            }else if(typeof payload.image_add === 'object')
            {
                payloadImage.push(await handleFileUpload(payload.image_add))
            }

            if(payload.image_remove) {
                var imageRemove = JSON.parse(payload.image_remove)
                for (let iR = 0; iR < imageRemove.length; iR++) {
                    const findIndex = imageExisting.findIndex(x => x.id == imageRemove[iR])
                    if(findIndex != -1) {
                        imageExisting.splice(findIndex, 1)
                    }
                }
            }

            payloadImage = payloadImage.concat(imageExisting)
            
            await request.pgsql.query('BEGIN');

            const inputUpd = [
                payload.sku,
                payload.name,
                JSON.stringify(payloadImage),
                payload.price,
                payload.description,
            ]
            
            var productUpdate = await ProductRepo.update(request, request.params.sku, inputUpd)

            if(payload.category_id)
            {
                const categories = JSON.parse(payload.category_id)
                await ProductRepo.deleteCategory(request, payload.sku)
                for (let c = 0; c < categories.length; c++) {
                    const isCategoryExist = await CategoryRepo.findById(request, categories[c])
                    if(isCategoryExist) {
                        await ProductRepo.saveCategory(request, [payload.sku, categories[c]])
                    }
                }
            }

            await request.pgsql.query('COMMIT');

            return h.response({
                statusCode: 200,
                message: "success update product",
                result: productUpdate
            })
        } catch (error) {
            await request.pgsql.query('ROLLBACK');

            console.log(error);
            return h.response({
                statusCode: 500,
                message: "error",
                result: error
            })
        }
    }
}