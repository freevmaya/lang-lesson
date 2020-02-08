var LocaleData = {
	rus: {
		file: 'Файл',
		new: 'Новый',
		open: 'Открыть',
		edit: 'Редактировать',
		playlist: 'Плейлист',
		lessons: 'Уроки',
		undo: 'Отменить',
		redo: 'Применить',
		share: 'Поделиться',
		copy: 'Копировать',
		paste: 'Вставить',
		insert_marker: 'Вставить метку',
		delete_marker: 'Удалить метку',
		youtube_captions: 'Youtube титры',
		login: 'Войти',
		translate: 'Перевод',
		time: 'Время',
		save_to_disk: 'Сохранить на диск',
		save_to_lib: 'Сохранить в альбом',
		reset_answers: 'Сбросить ответы',
		suggest_the_wrong_word: 'Подсказывать неверное слово (:price)',
		already_on: 'Уже включено',
		not_enough_points: 'Недостаточно баллов. Требуется :price баллов.',
		mode_is_on: 'Режим включен',
		talk_phrase: 'Проговорить фразу (:price)'
	},
	eng: {
		file: 'File',
		new: 'New',
		open: 'Open',
		edit: 'Edit',
		playlist: 'Playlist',
		lessons: 'Lesson',
		undo: 'Undon',
		redo: 'Redo',
		share: 'Share',
		copy: 'Copy',
		paste: 'Paste',
		insert_marker: 'Insert marker',
		delete_marker: 'Delete marker',
		youtube_captions: 'Youtube captions',
		login: 'Login',
		translate: 'Translate',
		time: 'Time',
		save_to_disk: 'Save to disk',
		save_to_lib: 'Save to my library',
		reset_answers: 'Reset answers',
		suggest_the_wrong_word: 'Suggest the wrong word (:price).',
		already_on: 'Already included',
		not_enough_points: 'Not enough points. Requires :price points.',
		mode_is_on: 'Mode is on',
		talk_phrase: 'Speak a phrase (:price)'
	}
}

var Locale = new (function() {

	var _lang = 'eng';
	var This = this;

    Object.defineProperty(this, 'lang', {get: ()=>{
    	return _lang;
    }, set: (a_lang)=>{
    	if (_lang != a_lang) {
    		_lang = a_lang;
    		This.parse($('body'), _lang);
    	}
    }});
	this.parse = function(elem) {

		if ($.type(elem) == 'string')
			return LocaleData[_lang][elem];
		else {
			let list = elem.find('[data-locale]');
			
			list.each((i, itm)=>{

				let s = $(itm);
				let val = LocaleData[_lang][s.data('locale')];
				if (val) {
					if (s.attr('placeholder')) s.attr('placeholder', val);
					else s.text(val);
				}
			});
		}

		return elem;
	}
	this.value = function(wi, params) {
		let v = LocaleData[_lang][wi];
		if (params) {
			for (let i in params)
				v = v.replace(i, params[i]);
		}
		return v;
	}
})();

$(window).ready(()=>{
	Locale.lang = 'rus';
});