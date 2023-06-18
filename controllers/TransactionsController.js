const TransactionRepo = require('../repositories/TransactionsRepository')
const ProductRepo = require('../repositories/ProductsRepository')
const moment = require('moment')

module.exports = {
    get: async (request, h) => {
        try {
            var transaction = await TransactionRepo.fetch(request, {
                page: request.query.page ?? 1,
                limit: request.query.limit ?? 10,
                search: request.query.search ?? ''
            })
    
            return h.response({
                statusCode: 200,
                message: "success get transaction",
                result: transaction
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
            var transaction = await TransactionRepo.findById(request, request.params.id)
            
            if(transaction)
            {
                return h.response({
                    statusCode: 200,
                    message: "success get detail transaction",
                    result: transaction
                })
            }else{
                return h.response({
                    statusCode: 404,
                    message: "transaction not found",
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

    create: async (request, h) => {
        try {
            const payload = request.payload;

            var product = await ProductRepo.findBySku(request, payload.sku)
            
            if(!product)
            {
                return h.response({
                    statusCode: 404,
                    message: "product not found"
                })
            }

            if(product.stock < payload.qty)
            {
                return h.response({
                    statusCode: 400,
                    message: "not enough stock"
                })
            }

            const inputSave = [
                payload.sku,
                payload.qty,
                moment().format()
            ]
            var transaction = await TransactionRepo.save(request, inputSave)

            return h.response({
                statusCode: 200,
                message: "success save transaction",
                result: transaction
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
            var transaction = await TransactionRepo.findById(request, request.params.id)
            
            if(!transaction)
            {
                return h.response({
                    statusCode: 404,
                    message: "transaction not found"
                })
            }

            const payload = request.payload;

            var product = await ProductRepo.findBySku(request, payload.sku)

            var currentStock = (parseInt(product.stock)+parseInt(transaction.qty))

            if(payload.sku != transaction.sku)
            {
                currentStock = parseInt(product.stock)
            }

            if(currentStock < payload.qty)
            {
                return h.response({
                    statusCode: 400,
                    message: "not enough stock"
                })
            }

            const inputSave = [
                payload.sku,
                payload.qty
            ]
            var transaction = await TransactionRepo.update(request, request.params.id, inputSave)

            return h.response({
                statusCode: 200,
                message: "success update transaction",
                result: "transaction"
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

    delete: async (request, h) => {
        try {
            var transaction = await TransactionRepo.findById(request, request.params.id)
            
            if(!transaction)
            {
                return h.response({
                    statusCode: 404,
                    message: "transaction not found",
                    result: null
                }) 
            }

            await TransactionRepo.remove(request, request.params.id)

            return h.response({
                statusCode: 200,
                message: "success delete transaction",
                result: transaction
            })
        } catch (error) {
            console.log(error);
            return h.response({
                statusCode: 500,
                message: "error",
                result: error
            })
        }
    }
}