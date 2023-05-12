import express from 'express';
import { PrismaClient } from "@prisma/client";
import {body, validationResult} from 'express-validator'
const prisma = new PrismaClient();
const employer = express.Router();

const validateUserInputPost = [
    body('name').exists().withMessage('name must be defined here').bail().isString().withMessage('name must be string'),
    body('email').exists().withMessage('email must be defined here').bail().isString().withMessage('email must be string'),
    body('phone').exists().withMessage('phone must be defined here').bail().isString().withMessage('phone must be string'),
    body('Address').exists().withMessage('Address must be defined here').bail().isString().withMessage('address must be string'),
    body('password').exists().withMessage('password must be defined here').bail().isString().withMessage('password must be string'),
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
    body('name').optional().isString().withMessage('name must be string'),
    body('email').optional().isString().withMessage('email must be string'),
    body('phone').optional().isString().withMessage('phone must be string'),
    body('Address').optional().isString().withMessage('address must be string'),
    body('password').optional().isString().withMessage('password must be string'),
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

employer.post('/add', async (req, res) => {
    const { name, email, phone, Address, password } = req.body;
    const findEmp = await prisma.employer.findUnique({
        where: {
          email,
        }
      });
    if(!findEmp){
        const employer = await prisma.employer.create({
            data: {
              name,
              email,
              phone,
              Address,
              password,
            }
          });
            res.send({
              status: 'successfully created',
              employer
            });
    }
    else{
        res.send({
            message: 'This email is used!'
          });
    }
    
  });

employer.delete('/delete/:id', async(req, res) => {
    const findEmp = await prisma.employer.findUnique({
        where: {
        id: +req.params.id,
        }
    });
    if(findEmp){
        const deleteEmp = await prisma.employer.delete({
        where: {
            id: +req.params.id,
        },
        })
        res.send({
        Message: 'The employer with id: ' + req.params.id + ' deleted successfully',
        });
    }
    else{
        res.send({
        Message: 'There is no employer with id: ' + req.params.id,
        });
    }
});

employer.get('/get/:id', async(req, res) => {
    const findEmp = await prisma.employer.findUnique({
        where:{
            id: +req.params.id,
        }
    });
    if(findEmp){
        res.send({
            findEmp,
        })
    }
    else{
        res.send({
            message: 'There is no employer with id: ' + req.params.id,
        })
    }

});

employer.get('/getAll/', async(req, res) => {
    const findEmp = await prisma.employer.findMany();
    if(findEmp){
        res.send({
            findEmp,
        })
    }
    else{
        res.send({
            message: 'There is no employers registered',
        })
    }

});

employer.put('/update/:id', validateUserInputPut, async(req, res) => {
    const { name, email, phone, Address, password } = req.body;
    const findEmp = await prisma.employer.findUnique({
      where: {
        id: +req.params.id,
      }
    });
    if(findEmp){
      const newData = {};
      if (name) {
        newData.name = name;
      }
      if (email) {
        newData.email = email;
      }
      if (phone) {
        newData.phone = phone;
      }
      if (Address) {
        newData.Address = Address;
      }
      if (password) {
        newData.password = password;
      }
      const updateEmp = await prisma.employer.update({
        where: {
          id: +req.params.id,
        },
        data: newData,
      })
      const EmpId = await prisma.employer.findUnique({
        where: {
          id: +(req.params.id),
        },
      })
      res.send(EmpId);
    }
    else{
      res.send({
        Message: 'There is no employer with id: ' + req.params.id,
      });
    }
    
  });


  export default employer;