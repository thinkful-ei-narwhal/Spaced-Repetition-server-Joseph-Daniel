const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonParser = express.json();

const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const headWord = await LanguageService.getLanguageHead(
        req.app.get('db'),
        req.language.id
      )

      res.json(
        headWord
      )
      next()
    } catch (error) {
      next(error)
    }
  })
  

languageRouter
  .post('/guess', jsonParser, async (req, res, next) => {
    try {

      for (const [key, value] of Object.entries(req.body.guess))
      // eslint-disable-next-line eqeqeq
      if (value == null) {
        return res.status(400).json({error: `Missing '${key}' in request body`});
      }

      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      const sll = LanguageService.createList(req.langauge, words)

      const node = sll.head;

      const answer = node.value.translation;

      let isCorrect = (req.body.guess === answer)

      if (isCorrect) {
        // do thing to sll
      } else {
        // do other thing to sll
      }

      // eventually call something like LanguageService.persistLinkedList(req.app.get('db), ll)


      res.json({
        nextWord: ll.head.value.original,
        wordCorrectCount: ll.head.value.correct_count,
        wordIncorrectCount: ll.head.value.incorrect_count,
        totalScore: ll.total_score,
        answer,
        isCorrect,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

module.exports = languageRouter
