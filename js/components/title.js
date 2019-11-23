var CTitle = function() {
	var layer = $(
	'<div class="CTitle">'+
		'<h2></h2>'+
	'</div>');

  	$('.player-area').append(layer);
  	var htitle = layer.find('h2');

	this.visible = (value)=>{
		if (value) layer.show(); else layer.hide();
	}

	this.updateContent = (content, tindex)=>{
		if ((tindex > -1) && (content[tindex].title)) {
			htitle.text(content[tindex].title);
	      	layer.show();
	    } else layer.hide();
	}

	this.getCaption = (content, tindex)=>{
		return content[tindex].title;
	}

	this.dispose = ()=>{layer.remove();}

	this.stop = (player, index)=>{
		return false;
	}
}

CTitle.id = 2;
CTitle.title = 'Title';
CTitle.Editor = function(parent, onChange) {

	var This = this;
	var layer = $(
    '<div>' +
      '<div class="ftable">' +
        '<input type="text" class="input"/>' +
        '<input type="button" class="btn-primary send" value="Set"></input>' +
      '</div>' +
    '</div>');
	parent.append(layer);

	var input = layer.find('.input'); 

  	layer.find('.send').click(doChange);

	function doChange() {
		if (This.validate()) onChange();
	}

	this.validate = ()=>{
		return input.val().length > 0;
	}

	this.setData = (a_data, a_ix)=>{
		input.val(a_data?a_data.content[ix].title:'');
	}

	this.clearData = (a_data, a_ix)=>{
		delete a_data.content[ix].title;
	}

	this.defaultData = ()=>{
		return {title: ''};
	}

	this.setTime = function(a_time) {
	}

	this.dispose = ()=>{
		layer.remove();
	}

	this.ApplyItemCommand = function(app, data) {
		var back = data.content[ix].title;
		var newt = input.val();

		function applyData(atitle) {
			let cdata = data.content[ix];
			cdata.title = atitle;
			app.setItemData(ix, cdata);
		}

		this.execute = ()=>{
			applyData(newt);
			return true;
		}

		this.undo = ()=>{
			applyData(back);
			This.setData(data, ix);
		}

		this.redo = ()=>{
			applyData(newt);
			This.setData(data, ix);
			return true;
		}

    	this.name = 'Title apply';
	}

	function doSend() {
		if (This.validate()) onChange();
	} 

	layer.find('.send').click(doSend);
}