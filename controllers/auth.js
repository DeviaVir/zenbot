var Faker2 = require('Faker2')
var bcrypt = require('bcrypt')

module.exports = function container (get, set) {
  return get('controller')()
    .post('/login', function (req, res, next) {
      if (req.user) return next()
      get('db.users').load(req.body.id, function (err, user) {
        if (err) return next(err)
        if (!user) {
          res.vars.message = 'User not found.'
          next()
        }
        else {
          bcrypt.compare(req.body.password, user.password, function (err, passwordOk) {
            if (err) return next(err)
            if (passwordOk) {
              req.login(user)
              return res.redirect('/')
            }
            else {
              res.vars.message = 'Bad password.'
            }
            next()
          })
        }
      })
    })
    .add('/login', function (req, res, next) {
      if (req.user) return res.redirect('/')
      var user = {
        id: Faker2.Internet.userName(),
        plaintext: Faker2.Name.lastName()
      }
      bcrypt.hash(user.plaintext, get('conf.auth.strength'), function (err, hash) {
        if (err) return next(err)
        user.password = hash
        get('db.users').save(user, function (err, user) {
          if (err) return next(err)
          req.session.users || (req.session.users = [])
          req.session.users.push(user)
          res.vars.users = req.session.users
          res.render('login')
        })
      })
    })
    .get('/logout', function (req, res, next) {
      req.logout()
      res.redirect('/')
    })
}