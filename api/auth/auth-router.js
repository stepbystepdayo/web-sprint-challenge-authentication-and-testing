const router = require("express").Router();
const bcrypt = require("bcrypt");
const db = require("../../data/dbConfig");
const { jwtSecret } = require("./secret");
const jwt = require("jsonwebtoken");

const { findBy, findById, add } = require("./auth-model");

//middleware for login

const checkUsernameExists = async (req, res, next) => {
  console.log("hi im in checkusername", req.body.username);
  try {
    const rows = await findBy({ username: req.body.username });
    if (rows.length) {
      req.userData = rows[0];
      // console.log("I got the right row!", req.userData);
      next();
    } else {
      res.status(401).json({
        message: "Invalid credentials",
      });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

router.post("/register", async (req, res) => {
  // res.end("implement register, please!");
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
  let user = req.body;
  // console.log(user);
  // console.log("this is user:", user);
  const rounds = process.env.BCRYPT_ROUNDS || 8;

  const hash = bcrypt.hashSync(user.password, rounds);

  user.password = hash;
  // console.log(user.password);
  add(user)
    .then((saved) => {
      // console.log("This is saved", saved);
      res.status(201).json(saved);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/login", checkUsernameExists, async (req, res) => {
  // res.end("implement login, please!");
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }
    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }
    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(401).json({ message: "username and password required" });
  }
  findBy({ username }).then(([user]) => {
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = makeToken(user);
      res.status(200).json({
        message: `welcome, ${user.username} `,
        token,
      });
    } else {
      res.status(401).json({ message: "invalid credentials" });
    }
  });
});

const makeToken = (user) => {
  const options = {
    expiresIn: "1d",
  };
  // console.log(options);
  const payload = {
    subject: user.user_id,
    username: user.username,
    role_name: user.role_name,
  };
  // console.log(payload);
  return jwt.sign(payload, jwtSecret, options);
};

module.exports = router;
