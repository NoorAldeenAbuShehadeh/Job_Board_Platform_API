import express from 'express';
import { PrismaClient } from "@prisma/client";
import {query, validationResult} from 'express-validator'
import authenticateToken from './authorization.js';
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


searchJob.get('/',validateUserInput, authenticateToken, async (req , res) => {
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
  if(jobs.length>0){
    res.status(200).send({
      jobs,
    });
  }
  else{
    res.status(204).send({ //No Content
      Message: "No available jobs"
    });
  }
});

export default searchJob;