import express from 'express';
import { PrismaClient } from "@prisma/client";
import {body, validationResult, query} from 'express-validator'
const prisma = new PrismaClient();
const applicationSubmission = express.Router();

const validateApplicationSubmission = [
    body('jobId').exists().withMessage('jobId must be defined here').bail().isInt({min:0}).withMessage('jobId must be int > 0'),
    body('email').exists().withMessage('email must be defined here').bail().isString().withMessage('email must be string'),
    body('resumeUrl').exists().withMessage('resumeUrl must be defined here').bail().isString().withMessage('resumeUrl must be string'),
    body('coverLetter').optional().isString().withMessage('coverLetter must be string'),
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


  applicationSubmission.post('/Submission',validateApplicationSubmission, async (req , res) => {
  const { jobId, email, resumeUrl, coverLetter } = req.body;
  const applicant = await prisma.applicant.findFirst({
    where: {
    email
    }
  });
  const applicantId = applicant.id;
  const exist = await prisma.jobApplication.findFirst({
    where: {
      jobId,
      applicantId
    }
  })
  if(!exist){
  const applicantJob = await prisma.jobApplication.create({
    data: {
        jobId,
        applicantId,
        resumeUrl,
        coverLetter,
        status:"pending",
    }
  });
  res.send({
    applicantJob,
  });
}
  else{
    res.send({
      Message: 'This job already applied'
    });
  }
});

/********************************************************************************************/
const validateApplicantInput = [
    body('email').optional().isString().withMessage('email must be string'),
    body('resumeUrl').optional().isString().withMessage('resumeUrl must be string'),
    body('coverLetter').optional().isString().withMessage('coverLetter must be string'),
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


applicationSubmission.put('/update/:id', validateApplicantInput, async(req, res) => {
  const { resumeUrl, coverLetter } = req.body;
    const findJobApp = await prisma.jobApplication.findUnique({
      where: {
        id: +req.params.id,
      }
    });
    if(findJobApp){
      const newData = {};
      if (resumeUrl) {
        newData.resumeUrl = resumeUrl;
      }
      if (coverLetter) {
        newData.coverLetter = coverLetter;
      }
      newData.updatedAt = new Date();
      const updateJob = await prisma.jobApplication.update({
        where: {
          id: +req.params.id,
        },
        data: newData,
      })
      const updated = await prisma.jobApplication.findUnique({
        where: {
          id: +(req.params.id),
        },
      })
      res.send(updated);
    }
    else{
      res.send({
        Message: 'There is no applicant with id: ' + req.params.id,
      });
    }
    
  });
/********************************************************************************************/
const validateIDInput = [
  query('applicantId').exists().withMessage('applicantId must be defined here').bail().isInt({min:0}).withMessage('applicantId must be int > 0'),
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


applicationSubmission.get('/seeAppSubmitted', validateIDInput, async(req, res) => {
const { applicantId } = req.query;
  const findAppSubmitted = await prisma.jobApplication.findMany({
    where: {
      applicantId: +applicantId,
    }
  });
  
    res.send(findAppSubmitted);
  
});

/********************************************************************************************/
const validateIDAppSubmitted = [
  query('id').exists().withMessage('id must be defined here').bail().isInt({min:0}).withMessage('id must be int > 0'),
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


applicationSubmission.delete('/deleteSubmittedApp', validateIDAppSubmitted, async(req, res) => {
const { id } = req.query;
  const findAppSubmitted = await prisma.jobApplication.findUnique({
    where: {
      id: +id,
    }
  });
  
    if(findAppSubmitted){
      const deleted = await prisma.jobApplication.delete({
        where: {
          id: +id,
        }
      });

      res.send({
        Message:"jobApplication with id = "+id+" Deleted successfully"
      });
    }
    else res.send({
      Message:"No such jobApplication that have id= "+id
    });
  
});

export default applicationSubmission;