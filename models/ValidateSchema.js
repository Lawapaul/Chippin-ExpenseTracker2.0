const Joi=require('joi');
const ValidationSchema = Joi.object({
    amount: Joi.number().required(),
    description: Joi.string().required(),
    currency: Joi.string().required(),
    date: Joi.string().required(),
});
module.exports = ValidationSchema;

module.exports.settlementSchema = Joi.object({
      payer: Joi.string().required(),
      participant: Joi.string().required(),
      amount: Joi.number().required(),
      description: Joi.string().required(),
      date: Joi.date().required(),
      currency: Joi.string().required(),
});