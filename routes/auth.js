const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const collection = require('../conecction/collectionUser');

const { secret } = config;

/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   * @path {POST} /auth
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @response {Object} resp
   * @response {String} resp.token Token a usar para los requests sucesivos
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @auth No requiere autenticación
   */
  app.post('/auth', (req, resp, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(400);
    }


    return collection(config.dbUrl)
      .then((collectionUser) => {
        collectionUser.findOne({ email })
          .then((resolve) => {
            // bcrypt.compare(resolve.password, password).then((e) => console.log(e));
            if (resolve.email === email && bcrypt.compare(resolve.password, password)) {
              const payload = {
                id: '1',
                iss: 'burgerqueen',
              };
              const token = jwt.sign(payload, secret, { expiresIn: 1440 });
              console.log('token: ', token);
              return resp.status(200).json(token);
            }
          });
      });
    // TODO: autenticar a la usuarix
    /* if (email === req.email && password === req.password) {
      // console.log(resp.status(200).json());
      const payload = {
        id: '1',
        iss: 'burgerqueen',
      };
      const token = jwt.sign(payload, secret, { expiresIn: 1440 });
      console.log('token: ', token);
      // return token;
      resp.status(200).json(token);
    } */
    next();
  });

  return nextMain();
};
