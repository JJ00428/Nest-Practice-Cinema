import * as Joi from '@hapi/joi';
import { Types } from 'mongoose';

export const CreateUserSchema = Joi.object({
  username: Joi.string().required().min(2).max(30).messages({
    'string.empty': 'Username is required 👤',
    'string.min': 'Username should be at least 3 characters 👤',
    'string.max': 'Username should be at most 30 characters 👤',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required 📧',
    'string.email': 'Please enter a valid email address 📧',
  }),
  password: Joi.string().required().min(6).messages({
    'string.empty': 'Password is required 🔑',
    'string.min': 'Password should be at least 6 characters 🔑',
  }),
  passwordConfirm: Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'Passwords do not match 🔑',
    'string.empty': 'Please confirm your password 🔑',
  }),
  role: Joi.string().valid('user', 'admin').default('user'),
//   reservations: Joi.array().items(Joi.string().hex().length(24)).optional(),
});

export const createFilmSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': `Film title is required 🎬`,
  }),
  description: Joi.string().required().messages({
    'any.required': `Film describtion is required 🎬`,
  }),
  duration: Joi.number().required().min(30).messages({
    'number.min': `A film should be at least 30 minutes ⌚`,
    'any.required': `Film duration is required ⌚`,
  }),
  genre: Joi.string().required().valid('Sci-fi', 'Action', 'Horror', 'Romance', 'Comedy', 'Animation', 'Slice-of-life').messages({
    'any.only': `Film Genre must be one of ['Sci-fi', 'Action', 'Horror', 'Romance', 'Comedy', 'Animation', 'Slice-of-life'] 🎬`,
    'any.required': `Film Genre is required 🎬`,
  }),
  releaseDate: Joi.date().required().default(Date.now).messages({
    'date.base': `releaseDate should be a valid date 🗓️`,
    'any.required': `releaseDate is required 🗓️`,
  }),
  removeDate: Joi.date().required().messages({
    'date.base': `"removeDate" should be a valid date 🗓️`,
    'any.required': `removeDate is required 🗓️`,
  }),
  hall: Joi.number().required(),
  type: Joi.string().valid('2D', '3D').required().messages({
    'any.only': `type must be one of ['2D', '3D'] 🎬`,
    'any.required': `type is a required field 🎬`,
  }),
});


export const createHallSchema = Joi.object({
  hallNum : Joi.number().required().messages({
    'any.required': `hallNum is required 💺🏢`,
  }),
  Imax: Joi.boolean().required().messages({
    'any.required': `You need to specify if the hall is Imax or not 🏢💺`,
  }),
  capacity: Joi.number(),
  price: Joi.number().required()
});

export const showtimeSeatsSchema = Joi.object({
  film: Joi.string()
    .required()
    .messages({
      'any.required': 'Film ID is required 🎬',
    }),
  hall: Joi.string(),
  showtime: Joi.date()
    .required()
    .messages({
      'date.base': 'Showtime must be a valid date.',
      'any.required': 'Showtime is required. 🗓️',
    }),
  
});