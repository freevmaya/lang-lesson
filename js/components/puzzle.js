var CPuzzle = function(player) {
	var layer = $(
	'<div class="CPuzzle">'+
		'<div class="top"></div>'+
		'<div class="after"></div>' +
		'<div class="bottom"></div>'+
		'<div class="trans"></div>'+
	'</div>');

	var parea = $('.player-area');
  	parea.append(layer);

  	var top = layer.find('.top');
  	var bottom = layer.find('.bottom');
  	var trans = layer.find('.trans');
  	var phrase;
  	var nextBtn = player.layout.find('.nextBtn');
  	var index = -1;
  	var completeList = {};

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
  		completeList[index] = true;
  	}

  	function getWords(puzzle, order) {
  		let words = [], p = puzzle;
  		phrase = [];
		if (p[0].trim()) {
			words = (phrase = p[0].split(/\s/)).slice(0);
			if (p[1].trim()) words = words.concat(p[1].split(/\s/));
			words.sort(order?order:(a, b)=>{return Math.random() - 0.5});
		}
		return words;
  	}

  	function start(puzzle, tindex) {
  		index = tindex;
		top.empty();
		bottom.empty();
		trans.empty();
		let words = getWords(puzzle);
		doc.prepareSpeech(words);
		if (words.length > 0) {
			for (let i=0; i<words.length; i++) wordCtrl(words, i);

	      	nextBtn.prop('disabled', !completeList[index]?true:'');
	  		layer.removeClass('complete');
  		}
  		if (puzzle[2]) trans.text(puzzle[2]);
      	layer.show();
  	}

  	function appendWord(d) {
		top.append(d);
		checkPhrase();
      	if (!player.playing()) doc.playSpeech(d.text());
  	}

  	function removeWord(cont, d) {
		cont.append(d);
		checkPhrase();
  	}

	function checkPhrase() {
		let result = [];
		top.find('.word').each((i, w)=>{
			result.push($(w).text());
		});

		if ($.equals(phrase, result)) complete();
		else {
			nextBtn.prop('disabled', true);
  			layer.removeClass('complete');
		}
	}

  	function wordCtrl(words, i) {
  		var word = $('<div class="word" data-id="' + i + '">' + words[i] + '</div>');
		var cont = $('<div class="cont" data-id="' + i + '"></div>').append(word);
		cont.droppable({drop: (e, ui)=>{
			if (ui.draggable.data('id') == word.data('id'))
				removeWord(cont, ui.draggable);
	  	}});

		function contSize() {
   			cont.css({'min-width': word.outerWidth() + 2, 'min-height': word.outerHeight() + 2});
		}

		word.draggable({
    		delay: 200,
    		start: ()=>{
    			word.css('z-index', 10);
    			contSize();
    		},
    		stop: function() {
				word.css({left:'',top:''});
    			word.css('z-index', '');
			}
		});

		word.droppable({drop: (e, ui)=>{
	  			let d = ui.draggable;
	  			if (d.hasClass('word')) {
	  				let list = d.parent().children();
	  				if (list.index(d) > list.index(word))
	  					d.insertBefore(word);
	  				else d.insertAfter(word);
					checkPhrase();
	  			}
	  		}
	  	});

		word.click((e)=>{
			contSize();
			if (word.parent().hasClass('cont')) appendWord(word);
			else removeWord(cont, word);
		});

		bottom.append(cont);
  	}

	this.visible = (value)=>{
		if (value) layer.show(); else layer.hide();
	}

	this.updateContent = (content, tindex)=>{
		if ((index > -1) && (!completeList[index]) && (!completeList[tindex]) && !doc.editMode) {
			player.setIndex(index, true);
		}
		else {
			if ((tindex > -1) && (content[tindex].puzzle)) {
				start(content[tindex].puzzle, tindex);
		    } else {
		    	layer.hide();
		    }
		}
	}

	this.getCaption = (content, tindex)=>{
		return 'Puzzle: ' + (content[tindex].puzzle?getWords(content[tindex].puzzle, (a, b)=>{return a>b?1:-1}).join(','):'');
	}

	function onChangeIndex(e, player) {
		let cn = player.content[player.index];
		let dis = cn && cn.puzzle && !completeList[player.index];
		nextBtn.prop('disabled', dis?true:'');
	}

	$(window).on('onChangeIndex', onChangeIndex);

	this.dispose = ()=>{
		$(window).off('onChangeIndex', onChangeIndex);
		layer.remove();
		completeList = {};
	}

	this.stop = (player, index)=>{
		return !completeList[index] && (player.content[index].puzzle != undefined);
	}
}

CPuzzle.id = 3;
CPuzzle.title = 'Puzzle';
CPuzzle.Editor = function(parent, onChange) {

	var This = this;
	var layer = $(
    '<div class="CPuzzleEdit">' +
      '<div>' +
      	'<input type="text" class="text" placeholder="Phrase"/>' +
      '</div>' +
      '<div class="separate"></div>' +
      '<div>' +
      	'<input type="text" class="trans" placeholder="Translation"/>' +
      '</div>' +
      '<div class="separate"></div>' +
      '<div class="ftable">' +
        '<input type="text" name="words" placeholder="Additional words"/>' +
        '<input type="button" class="btn-primary send" value="Set"></input>' +
      '</div>' +
    '</div>');
	parent.append(layer);

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