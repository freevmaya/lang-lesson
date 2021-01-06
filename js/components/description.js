var CDescription = function() {

	let dlayer = $('#video-description');
	let layer = dlayer.find('.CDescription');

	if (layer.length == 0) {
		layer = $('<div class="CDescription"></div>');
		dlayer.before(layer);
	}

	this.visible = (value)=>{
		if (value) layer.show(); else layer.hide();
	}

	this.updateContent = (content, tindex)=>{
		if ((tindex > -1) && (content[tindex].description)) {
			layer.html(content[tindex].description);
	      	layer.show();
	    } else layer.hide();
	}

	this.getCaption = (content, tindex)=>{
		return '';
	}

	this.dispose = ()=>{layer.remove();}

	this.stop = (player, index)=>{
		return false;
	}
}

CDescription.id = 5;
CDescription.title = 'Description';
CDescription.Editor = function(parent, onChange) {
	var This = this;
	var layer = $(
    '<div>' +
      '<div class="ftable">' +
        '<textarea class="input" autocomplete="off"></textarea>' +
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
		input.val(a_data?a_data.content[ix].description:'');
	}

	this.clearData = (a_data, a_ix)=>{
		delete a_data.content[ix].description;
	}

	this.defaultData = ()=>{
		return {description: ''};
	}

	this.setTime = function(a_time) {
	}

	this.dispose = ()=>{
		layer.remove();
	}

	this.ApplyItemCommand = function(app, data) {
		var back = data.content[ix].description;
		var newt = input.val();

		function applyData(adescription) {
			let cdata = data.content[ix];
			cdata.description = adescription;
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

    	this.name = 'Description apply';
	}

	function doSend() {
		if (This.validate()) onChange();
	} 

	layer.find('.send').click(doSend);
}