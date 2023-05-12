import express from 'express';
import { PrismaClient } from "@prisma/client";
import {body, validationResult} from 'express-validator'
const prisma = new PrismaClient();
const saveJob = express.Router();

const saveJobValidation = [body('jobId').exists().withMessage('jobId must be defined here').bail().isInt().withMessage('jobId must be integer'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }
      const extractedErrors = [];
      errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
      return res.status(422).json({ errors: extractedErrors });
    }
];

saveJob.post('/:id',saveJobValidation, async (req , res) => {
    const { jobId } = req.body;
    const newJob = await prisma.saveJob.create({
      data: {
        applicantId: +req.params.id,
        jobId: jobId,
      }
    });
    res.send({
      newJob,
    });
  });

  export default saveJob;



