import express from 'express';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();

app.use(express.json())

app.get('/', async (req, res) => {
    res.send({
      status: 'successfully created'
    });
});

app.listen(3000, () =>
  console.log(`🚀 Server ready at: http://localhost:3000`)
);
