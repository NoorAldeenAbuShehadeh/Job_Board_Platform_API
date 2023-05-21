import express from 'express';
import { PrismaClient } from "@prisma/client";
import {body, validationResult} from 'express-validator'
import hashPassword from './EncryptionPassword/hashPassword.js'
import verifyPassword from './EncryptionPassword/verifyPassword.js'
import jwt from 'jsonwebtoken'
const prisma = new PrismaClient();
const applicant = express.Router();



const validateUserInputPost = [
    body('firstName').exists().withMessage('firstName must be defined here').bail().isString().withMessage('firstName must be string'),
    body('lastName').exists().withMessage('lastName must be defined here').bail().isString().withMessage('lastName must be string'),
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
    body('firstName').optional().isString().withMessage('firstName must be string'),
    body('lastName').optional().isString().withMessage('lastName must be string'),
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

applicant.post('/add', validateUserInputPost, async (req, res) => {
    const { firstName, lastName, email, phone, Address, password } = req.body;
    const findApp = await prisma.applicant.findUnique({
        where: {
          email,
        }
      });
    if(!findApp){
      const encryptedPassword = await hashPassword(password)
        const applicant = await prisma.applicant.create({
            data: {
              firstName,
              lastName,
              email,
              phone,
              Address,
              password: encryptedPassword,
            }
          });
            res.status(201).send({
              status: 'successfully created',
              applicant
            });
    }
    else{
        res.status(409).send({//conflict
            message: 'This email is used!'
          });
    }
    
  });

  applicant.delete('/delete/:id', async(req, res) => {
    const findJobSearch = await prisma.saveJob.findMany({
        where: {
            applicantId: +req.params.id,
        }
    })
    let i=0;
    for(i=0; i<findJobSearch.length; i++){
        await prisma.saveJob.delete({
            where: {
                id: findJobSearch[i].id,
            }
        })
    }
    const findJobApplication = await prisma.jobApplication.findMany({
        where: {
            applicantId: +req.params.id,
        }
    })
    for(i=0; i<findJobApplication.length; i++){
        await prisma.jobApplication.delete({
            where: {
                id: findJobApplication[i].id,
            }
        })
    }
    const findApp = await prisma.applicant.findUnique({
        where: {
        id: +req.params.id,
        }
    });
    if(findApp){
        const deleteEmp = await prisma.applicant.delete({
        where: {
            id: +req.params.id,
        },
        })
        res.status(200).send({   
        Message: 'The applicant with id: ' + req.params.id + ' deleted successfully',
        });
    }
    else{
        res.status(404).send({
        Message: 'There is no applicant with id: ' + req.params.id,
        });
    }
});

applicant.get('/get/:id', async(req, res) => {
    const findApp = await prisma.applicant.findUnique({
        where:{
            id: +req.params.id,
        }
    });
    if(findApp){
        res.status(200).send({
            findApp,
        })
    }
    else{
        res.status(204).send({
            message: 'There is no applicant with id: ' + req.params.id,
        })
    }

});

applicant.get('/getAll/', async(req, res) => {
    const findApp = await prisma.applicant.findMany();
    if(findApp){
        res.status(200).send({
            findApp,
        })
    }
    else{
        res.status(204).send({
            message: 'There is no applicants registered',
        })
    }

});

applicant.put('/update/:id', validateUserInputPut, async(req, res) => {
    const { firstName, lastName, email, phone, Address, password } = req.body;
    const findApp = await prisma.applicant.findUnique({
      where: {
        id: +req.params.id,
      }
    });
    if(findApp){
      const newData = {};
      if (firstName) {
        newData.firstName = firstName;
      }
      if (lastName) {
        newData.lastName = lastName;
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
        newData.password = await hashPassword(password);
      }
      const updateApp = await prisma.applicant.update({
        where: {
          id: +req.params.id,
        },
        data: newData,
      })
      const appData = await prisma.applicant.findUnique({
        where: {
          id: +(req.params.id),
        },
      })
      res.status(200).send(appData);
    }
    else{
      res.status(404).send({
        Message: 'There is no applicant with id: ' + req.params.id,
      });
    }
    
  });
/**************************************************************************** */

applicant.post('/login', async (req, res) => {
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
    const passwordMatch = await verifyPassword(password, await hashPassword(password));
    if (passwordMatch) {
      const token = jwt.sign({ user }, 'thisIsAccessTokenSecretForJwtToMakeAuthorization', { expiresIn: '1h' });
      return res.status(200).json({ Message: 'Login successful', Token: token });
    } else {
      return res.status(401).json({ Message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ Message: 'Internal server error' });
  }
});

export default applicant;