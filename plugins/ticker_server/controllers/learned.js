var fs = require('fs')
  , path = require('path')

module.exports = function container (get, set) {
  return get('controller')()
    .put('/learned', function (req, res, next) {
      if (!res.vars.secret) return next(new Error('secret required'))
      next()
    })
    .put('/learned', function (req, res, next) {
      get('db.mems').load('learned', function (err, learned) {
        if (err) throw err
        get('console').info(('[best]' + JSON.stringify(learned, null, 2)).white)
        if (!learned) learned = req.body
        else if (learned.best_fitness > req.body.best_fitness) {
          return res.json({rejected: req.body, learned: learned, reason: 'low fitness'})
        }
        else if (!req.body.best_params || !req.body.best_params.vol_decay) {
          return res.json({rejected: req.body, learned: learned, reason: 'requires brain_upgrade'})
        }
        else {
          Object.keys(req.body).forEach(function (k) {
            learned[k] = req.body[k]
          })
        }
        learned.id = 'learned'
        get('db.mems').save(learned, function (err, saved) {
          if (err) return next(err)
          fs.writeFileSync(path.resolve(__dirname, '..', 'conf', 'defaults.json'), JSON.stringify(learned.best_params, null, 2))
          get('console').info(('[saved]' + JSON.stringify(req.body, null, 2)).cyan)
          res.json({saved: saved})
        })
      })
    })
    .get('/learned', function (req, res, next) {
      res.redirect('/')
    })
}