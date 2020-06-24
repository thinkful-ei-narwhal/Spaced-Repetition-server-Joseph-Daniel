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
    sll.language_id = language.id;
    sll.name = language.name;
    sll.total_score = language.total_score;

    let word = words.find(w => w.id === language.head);
    
    sll.insertFirst({
      id: word.id, 
      original: word.original, 
      translation: word.translation, 
      memory_value: word.memory_value, 
      correct_count: word.correct_count, 
      incorrect_count: word.incorrect_count});

    while(word.next) {
      word = words.find(w => w.id === word.next);
      sll.insertLast({
        id: word.id, 
        original: word.original, 
        translation: word.translation, 
        memory_value: word.memory_value, 
        correct_count: word.correct_count, 
        incorrect_count: word.incorrect_count});  
    }

    return sll;
  },

  persistLinkedList(db, sll, score) {
    return db.transaction(function(trx) {
      return Promise.all([
        db('language').transacting(trx).where('id', sll.language_id).update({total_score: score, head: sll.head.value.id}),
        ...sll.map(node => db('word').transacting(trx).where('id', node.value.id).update({
          memory_value: node.value.memory_value,
          correct_count: node.value.correct_count,
          incorrect_count: node.value.incorrect_count,
          next: node.next ? node.next.value.id : null
        }))
      ]);
      
    });
  }
};



module.exports = LanguageService;