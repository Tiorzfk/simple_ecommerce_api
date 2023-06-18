const controller = require('../controllers/ProductsController')
const Joi = require('joi');

const prefix = '/api/products'

module.exports = [
    {
        method: 'GET',
        path: `${prefix}`,
        handler: controller.get
    },
    {
        method: 'GET',
        path: `${prefix}/{sku}`,
        handler: controller.getDetail
    },
    {
        method: 'POST',
        path: `${prefix}`,
        handler: controller.create,
        options: {
            payload: {
                maxBytes: 209715200,
                output: 'stream',
                parse: true,
                multipart: true
            },
            validate: {
                payload: Joi.object({
                    sku: Joi.string().required(),
                    name: Joi.string().required().max(200),
                    price: Joi.number().required(),
                    stock: Joi.number().min(0),
                    image: Joi.required(),
                    category_id: Joi.string(),
                    description: Joi.string()
                }),
                failAction: async (request, h, err) => {
                    throw err;
                }
            }
        }
    },
    {
        method: 'PUT',
        path: `${prefix}/{sku}`,
        handler: controller.update,
        options: {
            payload: {
                maxBytes: 209715200,
                output: 'stream',
                parse: true,
                multipart: true
            },
            validate: {
                payload: Joi.object({
                    sku: Joi.string().required(),
                    name: Joi.string().required().max(200),
                    price: Joi.number().required(),
                    image_add: Joi.any(),
                    image_remove: Joi.string(),
                    category_id: Joi.string(),
                    description: Joi.string()
                }),
                failAction: async (request, h, err) => {
                    throw err;
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: `${prefix}/{sku}`,
        handler: controller.delete
    },
    {
        method: 'GET',
        path: `${prefix}/download`,
        handler: controller.downloadProduct
    }
]