const SLL = require('../SLL/SLL');

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },

  getLanguageHead(db, language_id) {
    return db
      .from('word')
      .rightJoin('language', 'language.id', '=', 'word.language_id')
      .column({
        nextWord: 'original',
        totalScore: 'total_score',
        wordCorrectCount: 'correct_count',
        wordIncorrectCount: 'incorrect_count',
      })
      .select()
      .where('language_id', language_id)
      .first();
    
  },

  createList(language, words) {
    const sll = new SLL();
    sll.id = language.id;
    sll.name = language.name;
    sll.total_score = language.total_score;

    let word = words.find(w => w.id === language.head)
    
    sll.insertFirst({
      id: word.id, 
      original: word.original, 
      translation: word.translation, 
      memory_value: word.memory_value, 
      correct_count: word.correct_count, 
      incorrect_count: word.incorrect_count})

    while(word.next) {
      word = words.find(w => w.id === word.next)
      sll.insertLast({
        id: word.id, 
        original: word.original, 
        translation: word.translation, 
        memory_value: word.memory_value, 
        correct_count: word.correct_count, 
        incorrect_count: word.incorrect_count})  
    }

    return sll;
  },

  persistLinkedList(db, sll, score) {
    return db.transaction(function(trx) {
      return trx('language')
        .update({ totalScore: score })
        .then(function() {
          sll.forEach(item => {
            trx('word').where('word.id', '=', `${item.value.id}`).update(item);
          })
        })
    })
  }
};

module.exports = LanguageService;

// knex.transaction(function(trx) {

//   const books = [
//     {title: 'Canterbury Tales'},
//     {title: 'Moby Dick'},
//     {title: 'Hamlet'}
//   ];

//   return trx
//     .insert({name: 'Old Books'}, 'id')
//     .into('catalogues')
//     .then(function(ids) {
//       books.forEach((book) => book.catalogue_id = ids[0]);
//       return trx('books').insert(books);
//     });
// })
// .then(function(inserts) {
//   console.log(inserts.length + ' new books saved.');
// })
// .catch(function(error) {
//   console.error(error);
// });