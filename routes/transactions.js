const controller = require('../controllers/TransactionsController')
const Joi = require('joi');

const prefix = '/api/transactions'

module.exports = [
    {
        method: 'GET',
        path: `${prefix}`,
        handler: controller.get
    },
    {
        method: 'GET',
        path: `${prefix}/{id}`,
        handler: controller.getDetail
    },
    {
        method: 'POST',
        path: `${prefix}`,
        handler: controller.create,
        options: {
            validate: {
                payload: Joi.object({
                    sku: Joi.string().required(),
                    qty: Joi.number().required().min(0),
                }),
                failAction: async (request, h, err) => {
                    throw err;
                }
            }
        }
    },
    {
        method: 'PUT',
        path: `${prefix}/{id}`,
        handler: controller.update,
        options: {
            validate: {
                payload: Joi.object({
                    sku: Joi.string().required(),
                    qty: Joi.number().required().min(1),
                }),
                failAction: async (request, h, err) => {
                    throw err;
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: `${prefix}/{id}`,
        handler: controller.delete
    }
]