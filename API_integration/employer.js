import express from 'express';
import { PrismaClient } from "@prisma/client";
import {body, validationResult} from 'express-validator'
import hashPassword from './EncryptionPassword/hashPassword.js'
import verifyPassword from './EncryptionPassword/verifyPassword.js'
import jwt from 'jsonwebtoken'
import authenticateToken from './authorization.js';
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
/*********************************************************************** */
employer.post('/add', validateUserInputPost, async (req, res) => {
    const { name, email, phone, Address, password } = req.body;
    const findEmp = await prisma.employer.findUnique({
        where: {
          email,
        }
      });
    if(!findEmp){
        const encryptedPassword = await hashPassword(password)
        const employer = await prisma.employer.create({
            data: {
              name,
              email,
              phone,
              Address,
              password: encryptedPassword,
            }
          });
            res.status(201).send({
              status: 'successfully created',
              employer
            });
    }
    else{
        res.status(409).send({ //conflict
            message: 'This email is used!'
          });
    }
    
  });
/************************************************************** */
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
        res.status(200).send({
        Message: 'The employer with id: ' + req.params.id + ' deleted successfully',
        });
    }
    else{
        res.status(404).send({
        Message: 'There is no employer with id: ' + req.params.id,
        });
    }
});
/*************************************************************** */
employer.get('/get/:id', async(req, res) => {
    const findEmp = await prisma.employer.findUnique({
        where:{
            id: +req.params.id,
        }
    });
    if(findEmp){
        res.status(200).send({
            findEmp,
        })
    }
    else{
        res.status(204).send({
            message: 'There is no employer with id: ' + req.params.id,
        })
    }

});
/************************************************************************* */
employer.get('/getAll/', async(req, res) => {
    const findEmp = await prisma.employer.findMany();
    if(findEmp){
        res.status(200).send({
            findEmp,
        })
    }
    else{
        res.status(204).send({
            message: 'There is no employers registered',
        })
    }

});
/************************************************************************************ */
employer.put('/update/:id', validateUserInputPut, authenticateToken, async(req, res) => {
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
        newData.password = await hashPassword(password);;
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
      res.status(200).send(EmpId);
    }
    else{
      res.status(404).send({
        Message: 'There is no employer with id: ' + req.params.id,
      });
    }
  });
/********************************************************************** */

employer.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.employer.findUnique({
    where: {
      email,
    }
  });

  if (!user) {
    return res.status(404).json({ Message: 'User not found' });
  }

  try {
    const passwordMatch = await verifyPassword(password, user.password);
    if (passwordMatch) {
      const token = jwt.sign({ user }, 'thisIsAccessTokenSecretForJwtToMakeAuthorization', { expiresIn: '50s' });
      return res.status(200).json({ Message: 'Login successful', Token: token});
    } else {
      return res.status(401).json({ Message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ Message: 'Internal server error' });
  }
});

export default employer;