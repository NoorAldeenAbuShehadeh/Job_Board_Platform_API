import express from 'express';
import { PrismaClient } from "@prisma/client";
import {query, validationResult} from 'express-validator'
const prisma = new PrismaClient();
const searchJob = express.Router();

const validateUserInput = [
    query('title').optional().isString().withMessage('title must be string'),
    query('location').optional().isString().withMessage('location must be string'),
    query('salaryMin').optional().isInt({ min: 200 }).withMessage('salaryMin must be int >= 200'),
    query('salaryMax').optional().isInt({ min: 200 }).withMessage('salaryMax must be int >= 200'),
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


searchJob.get('/',validateUserInput, async (req , res) => {
  const { title, location, salaryMin, salaryMax } = req.query;
  const where = {};
  if (title) {
    where.title = title;
  }
  if (location) {
    where.location = location;
  }
  if (salaryMax) {
    where.salaryMax = {'lte': parseInt(salaryMax)};
  }
  if (salaryMin) {
    where.salaryMin = {'gte': parseInt(salaryMin)};
  }
  const jobs = await prisma.job.findMany({ where });
  res.send({
    jobs,
  });
});

export default searchJob;