var CPuzzle = function(player) {
	var layer = $(
	'<div class="CPuzzle">'+
		'<div class="top"></div>'+
		'<div class="after"></div>' +
		'<div class="bottom"></div>'+
		'<div class="trans"></div>'+
	'</div>');

	var This = this;
	var parea = $('.player-area');
  	parea.append(layer);

  	var top = layer.find('.top');
  	var bottom = layer.find('.bottom');
  	var trans = layer.find('.trans');
  	var phrase;
  	var nextBtn = player.layout.find('.nextBtn');
  	var index = -1;
  	var completeList = {};
  	var state = {};
  	var doubleScope;
  	var setting = {
  		showWrongWord: false
  	};
  	var _puzzle;

    Object.defineProperty(this, 'storage_id', {get: ()=>{return 'puzzle-state-' + doc.data.id;}});
    Object.defineProperty(this, 'storage_id_cl', {get: ()=>{return 'puzzle-cl-' + doc.data.id;}});

    let storage_data = localStorage.getItem(This.storage_id);
    if (storage_data) state = JSON.parse(storage_data);
    let cl_data = localStorage.getItem(This.storage_id_cl);
    if (cl_data) completeList = JSON.parse(cl_data);

  	top.droppable({drop: (e, ui)=>{
  		let d = ui.draggable;
  		if (d.hasClass('word')) {
  			if (!d.parent().hasClass('top')) 
  				appendWord(d);
  		}
  	}});

  	function complete() {
  		nextBtn.prop('disabled', '');
  		layer.addClass('complete');
  		if (!doc.editMode) {
  			
	  		if (!completeList[index]) doc.changeScope(phrase.length * (doubleScope?2:1), 0);

  			completeList[index] = true;  		
  			localStorage.setItem(This.storage_id_cl, JSON.stringify(completeList));
  		}
  	}

  	function splitWords(words) {
  		let result = [];

  		$.each(words.split(/[\s\|,.;]+/).slice(0), (i, s)=>{
  			if (s.trim()) result.push(s);
  		});

  		return result;
  	}

  	function getWords(puzzle, order) {
  		let words = [], trans = {}, p = puzzle;
		if (p[0].trim()) {
			words = splitWords(p[0]);

			if (p[1].trim()) {
				let t = splitWords(p[1]);
				$.each(words, (i, v)=>{
					trans[v] = (i < t.length)?t[i]:'';
				})
			}

			if (order) words.sort(order);
			else {
				let origin = words.concat([]);
				while ($.equals(words, origin))
					words.sort((a, b)=>{return Math.random() - 0.5});
			}
		}
		return [words, trans];
  	}

  	function refresh() {
  		let words, trans_list;

		top.empty();
		bottom.empty();
		trans.empty();

  		if (state[index]) {
  			words = state[index].words;
  			trans_list = state[index].trans;
  			phrase = state[index].phrase;
  		}
  		else {
  			let wa = getWords(_puzzle);
  			state[index] = {words: words = wa[0], trans: trans_list = wa[1], top: [], phrase: []};
  			state[index].phrase = phrase = splitWords(_puzzle[0]);
  		}

		doc.prepareSpeech(words);
		if (words.length > 0) {
			let conts = [];
			for (let i=0; i<words.length; i++) {
				conts[i] = wordCtrl(words, trans_list, i);
			}

	      	nextBtn.prop('disabled', !completeList[index]?true:'');
	  		layer.removeClass('complete');

			if (!doc.editMode && state[index]) {
				for (let i=0; i<state[index].top.length; i++)
					appendWord(conts[state[index].top[i]].children(), true);
			}
  		}
  		if (_puzzle[2]) trans.text(_puzzle[2]);

  		doubleScope = top.find('.word').length == 0;
  	}

  	function start(puzzle, tindex) {
  		if (index != tindex) {
	  		index = tindex;
	  		_puzzle = puzzle;
	  		refresh();
      	}
      	layer.show();
  	}

  	function refreshTopStorage() {
  		let ws = top.find('.word');
  		state[index].top = [];
  		for (let i=0; i<ws.length; i++)
  			state[index].top.push($(ws[i]).data('id'));

		if (!doc.editMode) localStorage.setItem(This.storage_id, JSON.stringify(state));      
  	}

  	function appendWord(d, isInit) {
		top.append(d);
		if (!isInit) {
			refreshTopStorage();
	      	if (!player.playing()) doc.playSpeech(d.data('word'));
		}
		checkPhrase(!isInit);
		if (!isInit && !correctSequense()) doubleScope = false;
		doc.resetFromInfo();
  	}

  	function removeWord(cont, d) {
		cont.append(d);
		refreshTopStorage();
		checkPhrase(true);
		doc.resetFromInfo();
  	}

  	function correctSequense() {
  		let result = true;
  		top.find('.word').each((i, w)=>{
			let wc = $(w);
			if (i < phrase.length)
				result = result && (wc.text() == phrase[i]);
		});
		return result;
  	}

	function checkPhrase(isComplete) {
		let result = [];
		let right = true;
		top.find('.word').each((i, w)=>{
			let wc = $(w);
			let wd = wc.text();
			result.push(wd);
			if (setting.showWrongWord) {
				if ((phrase[i] == wd) && right) wc.addClass('right');
				else {
					wc.removeClass('right');
					right = false;
				}
			}
		});

		let r = $.equals(phrase, result);
		if (r) {
			if (isComplete) complete();
		} else {
			nextBtn.prop('disabled', true);
  			layer.removeClass('complete');
		}
		return r;
	}

  	function wordCtrl(words, tn_list, i) {
  		var word = $('<div class="word" data-id="' + i + '" data-word="' + words[i] + '">' + words[i] + '</div>');
		var cont = $('<div class="cont" data-id="' + i + '"></div>').append(word);
		cont.droppable({drop: (e, ui)=>{
			if (ui.draggable.data('id') == word.data('id'))
				removeWord(cont, ui.draggable);
	  	}});

//	  	if (tn_list && tn_list[words[i]]) word.wordHint(words[i], tn_list[words[i]]);

		word.draggable({
    		delay: 200,
    		start: ()=>{
    			word.css('z-index',10);
    		},
    		stop: function() {
				word.css({left:'',top:'', 'z-index':''});
			}
		});

		word.droppable({drop: (e, ui)=>{
	  		let d = ui.draggable;
	  			if (d.hasClass('word')) {
	  				let list = d.parent().children();
	  				if (list.index(d) > list.index(word))
	  					d.insertBefore(word);
	  				else d.insertAfter(word);
					refreshTopStorage();
					checkPhrase(true);
	  			}
	  		}
	  	});

	  	function onClickTouch() {
	  		if (word.parent().hasClass('cont')) appendWord(word);
			else removeWord(cont, word);
	  	}

	  	if (isMobile) {

			var pressTimer, ttime;
			word.on('touchend', ()=>{
				clearTimeout(pressTimer);
				let delta = $.now() - ttime;
				if (delta < 160) onClickTouch();
			}).on('touchstart', ()=>{
				ttime = $.now();
				pressTimer = window.setTimeout(function() {
					console.log('long touch');
				},1000);
			});

	  	} else word.click((e)=>{
			if (e.target == word[0]) onClickTouch();
		});

		bottom.append(cont);
    	cont.css({'min-width': word.outerWidth() + 2, 'min-height': word.outerHeight() + 2});

		return cont;
  	}

	this.visible = (value)=>{
		if (value) layer.show(); else layer.hide();
	}

	this.updateContent = (content, tindex)=>{
		if (tindex != index) {
			if ((index > -1) && !completeList[index] && !completeList[tindex] && !doc.editMode) {
				player.setIndex(index, true);
			}
			else {
				if ((tindex > -1) && (content[tindex].puzzle) && (content[tindex].puzzle[0])) {
					start(content[tindex].puzzle, tindex);
			    } else {
			    	layer.hide();
			    }
			}
		}
	}

	this.settingMenu = (menu)=>{
		var price = 40;
		var spk_price = 15;

		menu.appendItem('reset_answers', ()=>{doc.resetAnswers();});
		menu.appendItem('suggest_the_wrong_word', ()=>{
			if (!setting.showWrongWord) {
				//doc.serviceOn(price, ()=>{
					setting.showWrongWord = true;
			        $.message(Locale.value('mode_is_on'));
	  				refresh();
	  				doc.resetFromInfo();
				//});
			} else $.message(Locale.value('already_on'));
		}, {':price':price});
		menu.appendItem('talk_phrase', ()=>{
			doc.talkPhrase(phrase.join(' '), spk_price);
		}, {':price': spk_price});
	}

	this.getCaption = (content, tindex)=>{
		let p = content[tindex].puzzle;
		return p?(p[2]?p[2]:''):'';
	}

	function onChangeIndex(e, player) {
		let cn = player.content[player.index];
		let dis = cn && cn.puzzle && !completeList[player.index];
		nextBtn.prop('disabled', dis?true:'');
	}

	$(window).on('onChangeIndex', onChangeIndex);

	this.dispose = ()=>{
		nextBtn.prop('disabled', '');
		$(window).off('onChangeIndex', onChangeIndex);
		layer.remove();
	}

	this.stop = (player, index)=>{
		return !completeList[index] && (player.content[index].puzzle != undefined);
	}

	$(window).on('onResetAnswers', ()=>{
  		completeList = {};
  		state = {};
  		localStorage.setItem(This.storage_id, JSON.stringify(state));
  		localStorage.setItem(This.storage_id_cl, JSON.stringify(completeList));
  		if (index > -1) {
  			let i = index;
  			index = -1;
  			if (player.content[i].puzzle)
  				start(player.content[i].puzzle, i);
  		}
	});
}

CPuzzle.id = 3;
CPuzzle.title = 'Puzzle';
CPuzzle.parser = function(vdata, captions) {

	let items = captions.items;
	vdata.timeline = {};
	vdata.content = {};

	if (typeof items == 'string') {

		let list = items.split(/^[\d]+$/g);
		console.log(list);
		return vdata;
	}

	function twords(items) {
		let words = [];
		for (let i=0; i<items.length; i++) {
			let tstart = parseTime(items[i][0]);
			let tcount = parseTime(items[i][1]) - tstart;
			let s = items[i][2];
			let lcount = s.length;
			let k = tcount / lcount;
			let ws = s.split(/\s/);
			let l = 0;
			for (let w=0; w<ws.length; w++) {
				s = ws[w];
				let isep = s.charAt(s.length - 1) == '.';
				words.push([tstart + l * k, ws[w]]);
				l += ws[w].length + 1;
			}
		}
		return words;
	}

	let maxl = 50;
	let minl = 30;

	if (items.length >0) {
		let words 	= twords(items[0]);
		let words2 	= (items.length > 1)?twords(items[1]):[];

		let buff = '', buff2 = '', st, i=0;
		for (let w=0; w<words.length; w++) {
			if (buff.length == 0) st = words[w][0];
			else buff += ' ';

			buff += words[w][1];
			let isBreak = (buff.charAt(buff.length - 1) == '.') && (buff.length > minl);
			if ((buff.length > maxl) || isBreak) {

				let et = words[w][0];
				let buff2 = '';

				for (let w2=0; w2<words2.length; w2++) {
					let w2t = words2[w2][0];

					if (w2t > et) {
						words2.splice(0, w2);
						break;
					}
					buff2 += (buff2?' ':'') + words2[w2][1];
				}

				vdata.timeline[i] = st;
				vdata.content[i] = {c:[CPuzzle.id], puzzle: [buff, '', buff2]};
				buff = '';
				i++;
			}
		}
	}

	return vdata;
}

CPuzzle.dialog = function(parent, langList) {
	var This = this;
	function selectCtrl(sel) {
		for (let i=0; i<langList.length; i++)
			sel.append($('<option value="' + langList[i].id + '">' + langList[i].lang + '</option>'));
		return This[name] = sel;
	}

	let tmpl = $('.pizzleDialog').clone();
	let slan1 = selectCtrl(tmpl.find('[name=lang1]'));
	let slan2 = selectCtrl(tmpl.find('[name=lang2]'));
	parent.append(tmpl);

	this.params = ()=>{
		return {cids: [slan1.val(), slan2.val()]}
	}

	return this;
}

CPuzzle.Editor = function(parent, onChange) {

	var This = this;
	var layer = $(
    '<div class="CPuzzleEdit">' +
      '<div>' +
      	'<input type="text" class="text" placeholder="Phrase" data-locale="phrase"/>' +
      '</div>' +
      '<div class="separate"></div>' +
      '<div>' +
      	'<input type="text" class="trans" placeholder="Translation" data-locale="translated"/>' +
      '</div>' +
      '<div class="separate"></div>' +
      '<div class="ftable">' +
        '<input type="text" name="words" placeholder="Translation words"/>' +
        '<input type="button" class="btn-primary send" value="Set"></input>' +
      '</div>' +
    '</div>');
	parent.append(Locale.parse(layer));

	var phrase = layer.find('.text');
	var words = layer.find('[name="words"]');
	var input = layer.find('.input'); 
	var trans = layer.find('.trans'); 
	var ix;

	function doChange() {
		if (This.validate()) onChange();
	}

	this.validate = ()=>{
		return true;
	}

	this.setData = (a_data, a_ix)=>{
    	ix = a_ix;
		phrase.val(a_data?a_data.content[ix].puzzle[0]:'');
		words.val(a_data?a_data.content[ix].puzzle[1]:'');
		trans.val(a_data?a_data.content[ix].puzzle[2]:'');
	}

	this.clearData = (a_data, a_ix)=>{
		delete a_data.content[ix].puzzle;
	}

	this.defaultData = ()=>{
		return {puzzle: ['', '', '']};
	}

	this.setTime = function(a_time) {}

	this.dispose = ()=>{
		layer.remove();
	}

	function getData() {
		return {
			puzzle: [phrase.val(), words.val(), trans.val()]
		}
	}

	this.ApplyItemCommand = function(app, data) {

		var prev = $.extend({}, data.content[ix]);
		var n = $.extend({}, data.content[ix], getData());


		this.execute = ()=>{
			app.setItemData(ix, n);
			return true;
		}

		this.undo = ()=>{
			app.setItemData(ix, prev);
		}

		this.redo = ()=>{
			app.setItemData(ix, n);
			return true;
		}

		this.name = 'Pizzle apply';
	}

	function doSend() {
		if (This.validate()) onChange();
	} 

	layer.find('.send').click(doSend);
}