var TimeMarker = function() {

}

TimeMarker.id = 0;
TimeMarker.title = 'Time';
TimeMarker.Editor = function(parent, onChange) {
  var layer = $(
  	'<div>' +
      '<input type="text" name="time" class="time">' +
    '</div>')
  parent.append(layer);

  var This = this;
  var time = layer.find('[name="time"]');

  this.validate = function() {
    return (time.val().trim().length > 0);
  }

  this.setData = function(a_data, a_ix) {
    ix = a_ix;
    if (a_data)
      time.val(secondsToTime(a_data.timeline[ix], true));
    else time.val('00:00.0');
  }

  this.defaultData = ()=>{
    return {};
  }

  this.setTime = function(a_time) {
    time.val(a_time);
  }

  this.dispose = ()=>{
    layer.remove();
  }

  this.ApplyItemCommand = function(app, data) {
    var back = data.timeline[ix];
    var newt = parseTime(time.val());

    this.execute = ()=>{
    	app.setItemTime(ix, newt);
	    return true;
    }

    this.undo = ()=>{
    	app.setItemTime(ix, back);
    }

    this.redo = ()=>{
    	app.setItemTime(ix, newt);
    	return true;
    }

    this.name = 'Time marker apply';
  }

  function doChange() {
    if (This.validate()) onChange();
  } 

  time.mask("99:99.9");
  time.change(doChange);
}