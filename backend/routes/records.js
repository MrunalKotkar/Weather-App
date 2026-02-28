const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { create, readAll, readOne, update, remove } = require('../controllers/recordController');

const createValidation = [
  body('location').notEmpty().withMessage('location is required.').trim(),
  body('date_from').isDate({ format: 'YYYY-MM-DD' }).withMessage('date_from must be a valid date (YYYY-MM-DD).'),
  body('date_to').isDate({ format: 'YYYY-MM-DD' }).withMessage('date_to must be a valid date (YYYY-MM-DD).'),
  body('notes').optional().isString(),
];

const updateValidation = [
  body('location').optional().notEmpty().withMessage('location cannot be empty.').trim(),
  body('date_from').optional().isDate({ format: 'YYYY-MM-DD' }).withMessage('date_from must be a valid date.'),
  body('date_to').optional().isDate({ format: 'YYYY-MM-DD' }).withMessage('date_to must be a valid date.'),
  body('notes').optional().isString(),
];

router.post('/', createValidation, create);
router.get('/', readAll);
router.get('/:id', readOne);
router.put('/:id', updateValidation, update);
router.delete('/:id', remove);

module.exports = router;
