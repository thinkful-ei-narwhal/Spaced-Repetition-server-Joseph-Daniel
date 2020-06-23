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
    
  }
};

module.exports = LanguageService;
