import express from 'express';
import { PrismaClient } from "@prisma/client";
import searchJob from './API_integration/searchJob.js';
import addJob from './API_integration/addJob.js';
const prisma = new PrismaClient();
const app = express();
app.use(express.json())

app.use('/addJob', addJob);//search job by filtering

app.use('/searchJob', searchJob);//search job by filtering

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