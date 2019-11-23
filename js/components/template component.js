var CTemplate = function() {
	this.updateContent = (content, tindex)=>{}
	this.dispose = ()=>{}
}

CTemplate.id = ID NUMBER ;
CTemplate.Editor = function(parent, onChange) {
	var layer = $(
    '<div class="component title">' +
      '<h3 class="secondary-heading mb-4">Title</h3>' +
      '<div>' +
        '<input type="text"/>' +
        '<input type="button" class="btn-primary send" value="Set"></input>' +
      '</div>' +
    '</div>');
	parent.append(layer);

	var This = this;

	this.validate = function() {
		return true;
	}

	this.setData = function(a_data, a_ix) {
	}

	this.defaultData = ()=>{
		return {};
	}

	this.setTime = function(a_time) {
	}

	this.dispose = ()=>{
		layer.remove();
	}

	this.ApplyItemCommand = function(app, data) {
		this.execute = ()=>{
		    return true;
		}

		this.undo = ()=>{
		}

		this.redo = ()=>{
			return true;
		}

		this.name = 'Template apply';
	}

	function doSend() {
		if (This.validate()) onChange();
	} 

	layer.find('.send').click(doSend);
}