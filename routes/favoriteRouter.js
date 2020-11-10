const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
        .populate('user')
        .populate('campsites')
        .then(favorites => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        })
        .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorites => {
        if (favorites) {
            req.body.forEach(campsite => {
                if (!favorites.campsites.includes(campsite._id)) {
                    favorites.campsites.push(campsite._id);
                }
            })
            favorites.save()
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
                .catch(err => next(err));
        } else {
            Favorite.create({ user: req.user._id, campsites: []})
                .then(favorites => {
                    req.body.forEach(campsite => {
                        if (!favorites.campsites.includes(campsite._id)) {
                            favorites.campsites.push(campsite._id)
                        }
                    });
                    favorites.save()
                        .then(favorites => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        })
                        .catch(err => next(err));
                })
                .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
        .then(favorites => {
            res.statusCode = 200;
            if (favorites) {
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            } else {
                res.setHeader('Content-Type', 'text/plain');
                res.end('You do not have any favorites to delete!');
            }
        })
        .catch(err => next(err));
})

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation is not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
        .then(favorites => {
            if (favorites) {
                if (!favorites.campsites.includes(req.params.campsiteId)) {
                    favorites.campsites.push(req.params.campsiteId);
                    favorites.save()
                        .then(favorites => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        })
                } else {
                    res.end('That campsite is already in the list of favorites!');
                }
            } else {
                Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
                    .then(favorites => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites); 
                    })
                    .catch(err => next(err));
            }
        })
        .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation is not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
        .then(favorites => {
            if (favorites) {
                favorites.campsites.splice(favorites.campsites.indexOf(req.params.campsiteId), 1);
                favorites.save()
                    .then(favorites => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
                    .catch(err => next(err));
            } else {
                res.setHeader('Content-Type', 'text/plain');
                res.end('There are no favorite campsites to delete!');
            }
        })
        .catch(err => next(err));
})

module.exports = favoriteRouter;