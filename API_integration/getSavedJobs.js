import express from 'express';
import { PrismaClient } from "@prisma/client";
import { body } from 'express-validator';
const prisma = new PrismaClient();
const getSavedJobs = express.Router();


getSavedJobs.get('/get/:id', async (req , res) => {
    const applicantId = +req.params.id
    const savedJobs = await prisma.saveJob.findMany({
      where: {
        applicantId
      }
    });

    const jobs =[]
    for(let i=0;i< savedJobs.length;i++){
        let item = await prisma.job.findUnique({
            where: {
              id:savedJobs[i].jobId
            }});
        jobs.push(item)
    }

    if(jobs.length>0){
      res.status(200).send({
        jobs,
    });
    }
    else{
      res.status(204).send({
        Message:'there is no saved jobs'
    });
    }

  });

  getSavedJobs.delete('/delete/:id', async (req , res) => {
    const jobId = +req.params.id
    const {applicantId} = req.body
    const savedJob = await prisma.saveJob.findFirst({
      where: {
        jobId,
        applicantId
      }
    });

    if(savedJob){
        await prisma.saveJob.deleteMany({
            where: {
              jobId,
              applicantId
            }
          });

          res.status(200).send({
            Message:"the job deleted from saved jobs"
        });
    }else{
        res.status(404).send({
            Message:"this job not saved in your saved jobs"
        });
    }
  });

  export default getSavedJobs;



