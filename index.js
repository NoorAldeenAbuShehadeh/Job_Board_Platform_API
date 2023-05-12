import express from 'express';
import { PrismaClient } from "@prisma/client";
import searchJob from './API_integration/searchJob.js';
import Job from './API_integration/Job.js';
import saveJob from './API_integration/saveJob.js';
import employer from './API_integration/employer.js';
import application from './API_integration/application.js'
import manageApplicants from './API_integration/manageApplicants.js'
const prisma = new PrismaClient();
const app = express();
app.use(express.json())

app.use('/Job', Job);//add and manage job

app.use('/searchJob', searchJob);//search job by filtering

app.use('/application',application);//applicant job and update the request 
//the applicant can see the application submitted and can delete any one

app.use('/saveJob', saveJob);//save a certain job from applicant side

app.use('/employer', employer);//add/delete/update/read information of employer

app.use('/manageApplicants', manageApplicants);// can see all applicants to the selected job 
//and can update status for any applicant e.g. pending, accepted, rejected

app.listen(3000, () =>
  console.log(`🚀 Server ready at: http://localhost:3000`)
);


app.get('/employer', async (req, res) => {
  const employer = await prisma.employer.create({
    data: {
      name:'Noor Aldeen',
      email:'s11923513@stu.najah.edu',
      phone:'0597356188',
      Address:'Hawara',
      password:'123456'
    }
  });
    res.send({
      status: 'successfully created'
    });
});

app.get('/applicant', async (req, res) => {
  const applicant = await prisma.applicant.create({
    data: {
      firstName:'Haitham',
      lastName: 'Hinnawi',
      email:'s11924343@stu.najah.edu',
      phone:'0597505661',
      Address:'Nablus',
      password:'123456'
    }
  });
    res.send({
      status: 'successfully created'
    });
});

// app.get('/job', async (req, res) => {
//   const job = await prisma.job.create({
//     data: {
//       title:'frontend developer',
//       description:'need to know js, html, css at least',
//       location:'Nablus',
//       requirements:'have a good experience of writing the code',
//       salaryMin: 700,
//       salaryMax: 1200,
//       postedById: 1
//     }
//   });
//     res.send({
//       status: 'successfully created'
//     });
// });