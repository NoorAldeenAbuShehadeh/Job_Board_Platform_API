import express from 'express';
import { PrismaClient } from "@prisma/client";
import {body, validationResult} from 'express-validator'
const prisma = new PrismaClient();
const addJob = express.Router();

const validateUserInput = [
    body('title').exists().withMessage('title must be defined here').bail().isString().withMessage('title must be string'),
    body('description').exists().withMessage('description must be defined here').bail().isString().withMessage('description must be string'),
    body('location').exists().withMessage('location must be defined here').bail().isString().withMessage('location must be string'),
    body('requirements').exists().withMessage('requirements must be defined here').bail().isString().withMessage('requirements must be string'),
    body('salaryMin').exists().withMessage('salaryMin must be defined here').bail().isInt({ min: 200 }).withMessage('salaryMin must be int >= 200'),
    body('salaryMax').exists().withMessage('salaryMax must be defined here').bail().isInt({ min: 200 }).withMessage('salaryMax must be int >= 200'),
    body('email').exists().withMessage('email must be defined here').bail().isString().withMessage('email must be string'),
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
  const { title, description, location, requirements, salaryMin, salaryMax, email } = req.body;
  const empJob = await prisma.employer.findUnique({
    where: {
      email,
    }
  });
  const empId = empJob.id;
  const newJob = await prisma.job.create({
    data: {
        title,
        description,
        location,
        requirements,
        salaryMin,
        salaryMax,
        postedById:empId,
    }
  });
  res.send({
    newJob,
  });
});

export default addJob;