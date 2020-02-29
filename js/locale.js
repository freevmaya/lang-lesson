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
		send: 'Отправить',
		message: 'Сообщение',
		insert_marker: 'Вставить метку',
		delete_marker: 'Удалить метку',
		youtube_captions: 'Youtube титры',
		login: 'Войти',
		logout: 'Выйти',
		translate: 'Перевод',
		time: 'Время',
		save_to_disk: 'Сохранить на диск',
		save_to_lib: 'Сохранить в альбом',
		reset_answers: 'Сбросить ответы',
		suggest_the_wrong_word: 'Подсказывать неверное слово (:price)',
		already_on: 'Уже включено',
		not_enough_points: 'Недостаточно баллов. Требуется :price баллов.',
		mode_is_on: 'Режим включен',
		talk_phrase: 'Проговорить фразу (:price)',
		unsaved_data: 'Для данного видео есть несохраненные данные. Загрузить их?',
		description_edit: 'Редактировать описание',
		description: 'Описание',
		description_help: 'Введите текст',
		first_save_to_lib: 'Сначала сохраните в альбом',
		album_title: 'Альбом:',
		service: 'Сервис',
		thank_vote: 'Спасибо за ваш голос!',
		already_voted: 'Спасибо, вы уже голосовали за это видео.',
		show_scope: 'Поздравляем, вы набрали :scope баллов!',
		discussion: 'Обсуждение',
		guest: 'Гость',
		empty_discussion: 'Здесь сейчас пусто. Будьте первыми!',
		you: 'Вы'
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
		send: 'Send',
		message: 'Message',
		insert_marker: 'Insert marker',
		delete_marker: 'Delete marker',
		youtube_captions: 'Youtube captions',
		login: 'Login',
		logout: 'Logout',
		translate: 'Translate',
		time: 'Time',
		save_to_disk: 'Save to disk',
		save_to_lib: 'Save to my library',
		reset_answers: 'Reset answers',
		suggest_the_wrong_word: 'Suggest the wrong word (:price).',
		already_on: 'Already included',
		not_enough_points: 'Not enough points. Requires :price points.',
		mode_is_on: 'Mode is on',
		talk_phrase: 'Speak a phrase (:price)',
		unsaved_data: 'There is unsaved data for this video. Download them?',
		description_edit: 'Edit description',
		description: 'Description',
		description_help: 'Enter text',
		first_save_to_lib: 'Save to album first',
		album_title: 'Album:',
		service: 'Service',
		thank_vote: 'Thanks for your vote!',
		already_voted: 'Thank you, you have already voted for this video.',
		show_scope: 'Congratulations, you scored :scope points!',
		discussion: 'Discussion',
		guest: 'Guest',
		empty_discussion: 'It’s empty here now. Be the first!',
		you: 'You'
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