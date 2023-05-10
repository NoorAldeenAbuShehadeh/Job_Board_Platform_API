import express from 'express';
import { PrismaClient } from "@prisma/client";
import {body, validationResult} from 'express-validator'
const prisma = new PrismaClient();
const addJob = express.Router();

const validateUserInput = [
    body('title').optional().isString().withMessage('title must be string'),
    body('description').optional().isString().withMessage('description must be string'),
    body('location').optional().isString().withMessage('location must be string'),
    body('requirements').optional().isString().withMessage('requirements must be string'),
    body('salaryMin').optional().isInt({ min: 200 }).withMessage('salaryMin must be int >= 200'),
    body('salaryMax').optional().isInt({ min: 200 }).withMessage('salaryMax must be int >= 200'),
    body('postedById').optional().isInt().withMessage('postedById must be integer'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }
      const extractedErrors = [];
      errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
      return res.status(422).json({ errors: extractedErrors });
    },
  ]


addJob.post('/',validateUserInput, async (req , res) => {
  const { title, description, location, requirements, salaryMin, salaryMax, postedById } = req.body;
  const newJob = await prisma.job.create({
    data: {
        title,
        description,
        location,
        requirements,
        salaryMin,
        salaryMax,
    }
  });
  res.send({
    newJob,
  });
});

export default addJob;