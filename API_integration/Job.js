import express from 'express';
import { PrismaClient } from "@prisma/client";
import {body, validationResult} from 'express-validator'
const prisma = new PrismaClient();
const Job = express.Router();

const validateUserInputPost = [
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

  const validateUserInputPut = [
    body('title').optional().isString().withMessage('title must be string'),
    body('description').optional().isString().withMessage('description must be string'),
    body('location').optional().isString().withMessage('location must be string'),
    body('requirements').optional().isString().withMessage('requirements must be string'),
    body('salaryMin').optional().isInt({ min: 200 }).withMessage('salaryMin must be int >= 200'),
    body('salaryMax').optional().isInt({ min: 200 }).withMessage('salaryMax must be int >= 200'),
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


Job.post('/add',validateUserInputPost, async (req , res) => {
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

Job.delete('/delete/:id', async(req, res) => {
  const findJob = await prisma.job.findUnique({
    where: {
      id: +req.params.id,
    }
  });
  if(findJob){
    const deleteJob = await prisma.job.delete({
      where: {
        id: +req.params.id,
      },
    })
    res.send({
      Message: 'The job with id: ' + req.params.id + ' deleted successfully',
    });
  }
  else{
    res.send({
      Message: 'There is no job with id: ' + req.params.id,
    });
  }
});

Job.put('/update/:id', validateUserInputPut, async(req, res) => {
  const { title, description, location, requirements, salaryMin, salaryMax } = req.body;
  const findJob = await prisma.job.findUnique({
    where: {
      id: +req.params.id,
    }
  });
  if(findJob){
    const newData = {};
    if (title) {
      newData.title = title;
    }
    if (location) {
      newData.location = location;
    }
    if (salaryMax) {
      newData.salaryMax = salaryMax;
    }
    if (salaryMin) {
      newData.salaryMin = salaryMin;
    }
    if (requirements) {
      newData.requirements = requirements;
    }
    newData.updatedAt = new Date();
    const updateJob = await prisma.job.update({
      where: {
        id: +req.params.id,
      },
      data: newData,
    })
    const jobId = await prisma.job.findUnique({
      where: {
        id: +(req.params.id),
      },
    })
    res.send(jobId);
  }
  else{
    res.send({
      Message: 'There is no job with id: ' + req.params.id,
    });
  }
  
});

export default Job;