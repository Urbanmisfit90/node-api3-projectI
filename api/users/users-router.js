const express = require('express');
const {
  validateUserId,
  validateUser,
  validatePost,
} = require('../middleware/middleware')

const User = require('./users-model')
const Post = require('../posts/posts-model')

const router = express.Router();

router.get('/', async (req, res, next) => {
  // RETURN AN ARRAY WITH ALL THE USERS
  User.get()
  .then(users => {
    res.json(users)
  })
  .catch(next)
});

router.get('/:id', validateUserId, (req, res) => {
  // RETURN THE USER OBJECT
  // this needs a middleware to verify user id
  res.json(req.user)
});

router.post('/', validateUser, (req, res, next) => {
  // RETURN THE NEWLY CREATED USER OBJECT
  // this needs a middleware to check that the request body is valid
  User.insert({ name: req.name })
    .then(newUser => {
      res.status(201).json(newUser)
    })
    .catch(next)
});

router.put('/:id', validateUserId, validateUser, async (req, res, next) => {
  try {
    // Update the user in the database with the new name
    await User.update(req.params.id, { name: req.name });
    
    // Fetch the updated user from the database
    const updatedUser = await User.getById(req.params.id);

    // Respond with the updated user object
    res.json(updatedUser);
  } catch (error) {
    next(error); // Forward any errors to the error handling middleware
  }
});

router.delete('/:id', validateUserId, async (req, res, next) => {
  // RETURN THE FRESHLY DELETED USER OBJECT
  // this needs a middleware to verify user id
  try {
    await User.remove(req.params.id)
    res.json(req.user)
  } catch (err) {
    next(err)
  }
});

router.get('/:id/posts', validateUserId, async (req, res, next) => {
  // RETURN THE ARRAY OF USER POSTS
  // this needs a middleware to verify user id
  try {
    const result = await User.getUserPosts(req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
});

router.post(
  '/:id/posts',
  validateUserId,
  validatePost,
  async(req, res, next) => {
  // RETURN THE NEWLY CREATED USER POST
  // this needs a middleware to verify user id
  // and another middleware to check that the request body is valid
    try {
      const result = await Post.insert({
        user_id: req.params.id,
        text: req.text,
      })
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
});

router.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    customMessage: 'something tragic inside posts router happened',
    message: err.message,
    stack: err.stack,
  })
})

// do not forget to export the router
module.exports = router;
