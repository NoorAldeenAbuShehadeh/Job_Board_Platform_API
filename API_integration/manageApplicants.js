import express from 'express';
import { PrismaClient } from "@prisma/client";
import {query, body , validationResult} from 'express-validator'
const prisma = new PrismaClient();
const manageApplicants = express.Router();

const validateApplicationInfo = [
    query('jobId').exists().withMessage('jobId must be defined here').bail().isInt({min:0}).withMessage('jobId must be int > 0'),
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


  manageApplicants.get('/seeAll',validateApplicationInfo, async (req , res) => {
  const { jobId } = req.query;
  const job_id = Number(jobId);
  const applicants = await prisma.jobApplication.findMany({
    where: {
        jobId:job_id
    }
  });
    res.send(applicants);
});

/********************************************************************************************/
const validateEmployerInput = [
    body('jobApplicationId').exists().withMessage('jobApplicationId must be defined here').bail().isInt({min:0}).withMessage('jobId must be int > 0'),
    body('status').exists().withMessage('status must be defined here').bail().isString().withMessage('status must be string'),
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


  manageApplicants.put('/update', validateEmployerInput, async(req, res) => {
  const { jobApplicationId, status } = req.body;
    const findJobApp = await prisma.jobApplication.findUnique({
      where: {
        id: jobApplicationId,
      }
    });
    if(findJobApp){
      const newData = {};
      if (status) {
        newData.status = status;
      }
      newData.updatedAt = new Date();
      const updateJob = await prisma.jobApplication.update({
        where: {
          id: jobApplicationId,
        },
        data: newData,
      })
      const updated = await prisma.jobApplication.findUnique({
        where: {
          id: jobApplicationId,
        },
      })
      res.send(updated);
    }
    else{
      res.send({
        Message: 'There is no job applicant with id: ' + jobApplicationId,
      });
    }
    
  });

export default manageApplicants;