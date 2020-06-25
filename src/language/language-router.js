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
      const word = await LanguageService.getLanguageHead(
        req.app.get('db'),
        req.language.id
      )

      res.json(word)
    } catch (error) {
      next(error)
    }
  })
  

languageRouter
  .post('/guess', jsonParser, async (req, res, next) => {
    try {
      for (const [key, value] of Object.entries(req.body))
      // eslint-disable-next-line eqeqeq
      if (value == null || key !== 'guess') {
        return res.status(400).json({error: `Missing 'guess' in request body`});
      }

      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        
        req.language.id,
      )

      
      const sll = LanguageService.createList(req.language, words)

      const node = sll.head;

      const answer = node.value.translation;

      let isCorrect = (req.body.guess === answer)

      if (isCorrect) {
        
        sll.head.value.memory_value * 2 >= sll.size() ? sll.head.value.memory_value = sll.size() - 1 : sll.head.value.memory_value *= 2;
        sll.head.value.correct_count += 1;
        sll.total_score += 1;
      } else {
        sll.head.value.memory_value = 1;
        sll.head.value.incorrect_count += 1;
      }
      
      sll.moveHeadBy(sll.head.value.memory_value)
      await LanguageService.persistLinkedList(req.app.get('db'), sll)
        .catch(error => console.log(error));

      res.json({
        nextWord: sll.head.value.original,
        wordCorrectCount: node.value.correct_count,
        wordIncorrectCount: node.value.incorrect_count,
        totalScore: sll.total_score,
        answer,
        isCorrect,
      })
    } catch (error) {
      next(error)
    }
  })

module.exports = languageRouter
