
var Timeline = function(elem, options) {

	var This = this;
	var tlist = {};
	var bar = $('<div></div>');
	elem.find('.timeline-bar').append(bar);
	var outerBar = bar.parent().parent();
	var addBtn = elem.find('.add');
	var delBtn = elem.find('.delete');
	var cursor = elem.find('.cursor');
	var scBar	= elem.find('.timeline-sc');
	var cursorTime = 0;
	var totalLength = 0;
	var selectIndex = -1;
	var markerWidth = 0;
	var curDrag = null;
  	this.options = options;

  	var slider = elem.find('.slider').slider({range	: true, slide: onChangeSlider});
	var rangeHandle = elem.find('.ui-slider-range');
	var rangeDrag = false;
	var nextIndex = 0;
	var _rangeMin;
	var _range;
	var _requireRefresh = false;

	delBtn.prop("disabled", true);

	tooltip.updateText = (ix)=>{
		tooltip.text(secondsToTime(tlist[ix], true));
		return tooltip;
	}

	tooltip.updatePos = (m)=>{
		var offset = m.offset();
        return tooltip.pos(offset.left + m.width() / 2, offset.top);
	}	

	rangeHandle.draggable({
        containment: "parent",
        axis: "x",
        start: onRangeStart,
        stop: onRangeStop,
        drag: onRangeDrag
    }).filter('#dragV').draggable("option", "axis", "y");

    function applyRange(range) {
    	range[0] = Math.round(range[0]);
    	range[1] = Math.round(range[1]);
    	let d = range[1] - range[0];
    	if (d < _rangeMin) {
    		let ad = _rangeMin - d;
    		d += ad;
    		if (range[1] + ad < totalLength) range[1] += ad;
    		else range[0] -= ad;
    	}

    	var k = outerBar.width() / d;
    	bar.parent().css({"margin-left": -range[0] * k, "margin-right": (range[1] - totalLength) * k});
		cursor.css('margin-left', cursorTime / totalLength * width());

		_range = range;
		_requireRefresh = true;
    }

    function calcRange(left) {
    	var range = slider.slider('values');
    	var delta = range[1] - range[0]; 
    	range[0] = totalLength * left/slider.width();
    	range[1] = range[0] + delta;
    	return range;
    }

    function onRangeStart(e, ui) {
		rangeDrag = true;
    }

    function onRangeStop(e, ui) {
		slider.slider({values: calcRange(ui.position.left)});
		rangeDrag = false;
    }

    function onRangeDrag(e, ui) {
    	var handle = slider.find('.ui-slider-handle');
    	$(handle[0]).css('left', ui.position.left);
    	$(handle[1]).css('left', ui.helper.width() + ui.position.left);
    	applyRange(calcRange(ui.position.left));
    }

    function onChangeSlider(event, ui) {
    	if (ui.values[1] - ui.values[0] >= _rangeMin) applyRange(ui.values);
    	else return false;
    }

	function width() {
		return bar.width() - markerWidth;
	}

	function gl(om) {
		return parseFloat(om.css('left')) + om.outerWidth() / 2;
	}

	function gix(om) {
		return om.data('ix');
	}

	function sl(ix, om, left, setTime) {
		var w = width();
		if (left < 0) left = 0;
		else if (left > w) left = w;
		om.css('left', left - om.outerWidth() / 2);
		if (setTime) {
			tlist[ix] = left / w * totalLength;
			if (This.options.onChangeMarker) This.options.onChangeMarker(ix);
		}
	}

	function getMarker(index) {
		var childs = bar.children('.marker');
		for (var i=0; i<childs.length; i++) {
			if (gix($(childs[i])) == index) return $(childs[i]);
		}
	}

	function refreshMarkers() {
		var w = width();
		var p = [];
		var min = Number.MAX_VALUE;
		let minMin = 8;
		bar.children('.marker').each((i, m)=>{
			let ix = gix($(m));
			p[i] = tlist[ix] / totalLength * w;
			if (i > 0) {
				let d = p[i] - p[i - 1];
				if ((d < min) && (d > 0)) {
					min = d;
					if (min < minMin) {
						console.log('Marker ID: ' + i + ' no correct interval. Time: ' + secondsToTime(tlist[ix]));
					}
				}
			}
		});

		markerWidth = Math.round(Math.min(Math.max(min, minMin), options.markerWidth));
		bar.children('.marker').each((i, m)=>{
			m = $(m);
			m.css({width: Math.floor(markerWidth), top: -(5 + i * 15)});
			sl(i, m, p[i]);
		});
		refreshSc();
		_requireRefresh = false;
	}

	setInterval(()=>{
		if (_requireRefresh) refreshMarkers();
	}, 20);

	function refreshSc() {

		scBar.empty();

		let k = totalLength / width();
		let st = _range[0];
		let t = Math.ceil(Math.floor(Math.floor(_range[0] / k) * k) / 2) * 2;
		let step = Math.ceil((_range[1] - _range[0]) / 60);
		let ofs = 0;

		while (t < _range[1]) {
			t += step;
			m = Math.round((t - st) / k);
			if (t % 5 == 0) {
				scBar.append('<span style="margin-left: ' + m + 'px" class="ten">' + secondsToTime(t) + '</span>');
			} else {
				scBar.append('<span style="margin-left: ' + m + 'px"></span>');
			}
		}
	}

	function deleteMarker(ix) {
		if (!ix) ix = selectIndex;

		if (ix > -1) {
			var m = getMarker(ix);
			if (m) {
				delete tlist[ix];
				if (ix == selectIndex) selectMarkerA(-1);
				m.remove();

				_requireRefresh = true;

				if (This.options.onDelete) This.options.onDelete(ix);
			}
		}
	}

	function checkOther(marker, x) {
		var childs = bar.children('.marker');
		for (var i=0; i<childs.length; i++) {
			om = $(childs[i]);
			if (gix(om) != gix(marker)) {
				var omx = gl(om);
				if (x < omx) {
					var omnx = x + markerWidth * 1.2;
					if (omnx > omx) {
						sl(i, om, omnx, true);
						if (omnx >= width()) return false;
						else if (!checkOther(om, omnx)) return false;
					}
				} else if (x > omx) {
					var omnx = x - markerWidth * 1.2;
					if (omnx < omx) {
						sl(i, om, omnx, true);
						if (omnx < 0) return false;
						else if (!checkOther(om, omnx)) return false;
					}
				}
			}
		}
		return true;
	}

	function onBarClick(e) {
		var m = $(e.target);
		if (m.hasClass('marker')) {
			setCursor(tlist[gix(m)]);
			_requireRefresh = true;
		} else setCursor((e.pageX - bar.offset().left) / width() * totalLength);
	}

	function onBarDown(e) {
		var m = $(e.target);
		if (!m.hasClass('marker')) setCursor((e.pageX - bar.offset().left) / width() * totalLength);
	}

	var MarkerDragCommand = function(ix) {
		var bx = gl(getMarker(ix)), nx;		

		this.execute = ()=>{
			nx = gl(getMarker(ix));
			return true;
		}

		this.undo = ()=>{
			sl(ix, getMarker(ix), bx, true);
		}

		this.redo = ()=>{
			sl(ix, getMarker(ix), nx, true);
		}

    	this.name = 'Drag marker';
	}

	var dragCommand; 
	function onMarkerStart(e) {
		var m = $(e.target);
		curDrag = m;
		dragCommand = new MarkerDragCommand(gix(curDrag), curDrag);
	}

	function onMarkerDrag(e) {
		var ix = gix(curDrag);
		var w = width();
		var nx = gl(curDrag);
		sl(ix, curDrag, nx, true);
		tooltip.updatePos(curDrag);
		tooltip.updateText(ix);

		if (!checkOther(curDrag, nx)) return false;
		return true;
	}

	function onMarkerStop(e) {
		tooltip.hide();
		if (This.options.onChange) This.options.onChange(gix(curDrag));
		curDrag = null;

		commandManager.executeCmd(dragCommand);
		dragCommand = null;
	}

	function onMouseEnter(e) {
		var m = $(e.target);
		var ix = gix(m);

		var offset = m.offset();
        tooltip.updateText(ix);
        tooltip.updatePos(m);
        tooltip.show();
	}

	function onMouseLeave(e) {
		if (!curDrag) tooltip.hide();
	}

	function selectMarkerA(ix) {
		if (selectIndex != ix) {
			if (selectIndex > -1) {
				let m = getMarker(selectIndex);
				if (m) m.removeClass("selected");
			}
			selectIndex = ix;
			if (selectIndex > -1) {
				getMarker(selectIndex).addClass("selected");
				elem.addClass('is-selected-marker');
				setCursor(tlist[selectIndex]);			
			} else elem.removeClass('is-selected-marker');

			delBtn.prop("disabled", selectIndex == -1);

			if (This.options.onSelect) This.options.onSelect(ix);
		}
	}

	var SelectMarkerCommand = function(ix) {
		var back = selectIndex;

		this.execute = this.redo = ()=>{
			selectMarkerA(ix);
			return true;
		}

		this.undo = ()=>{
			selectMarkerA(back);
		}

		this.redo = ()=>{
			selectMarkerA(ix);
		}

    	this.name = 'Select marker';
	}


	let doSelectMarker = this.setSelectIndex = (ix)=>{
		if (selectIndex != ix) {
			if (typeof(tlist[ix]) == 'number') {
				setCursor(tlist[ix]);
				commandManager.executeCmd(new SelectMarkerCommand(ix));		
			} else selectMarkerA(ix);
		} else setCursor(tlist[ix]);
	}

	var CreateMarkerCommand = function(type) {
		var ix, safeCursor = cursorTime, prev_ix = selectIndex;

		this.getIndex = ()=>{
			return ix;
		}

		this.execute = ()=>{
			ix = createMarkerAndAdd(safeCursor, undefined, type);
			selectMarkerA(ix);
			return true;
		}

		this.undo = ()=>{
			deleteMarker(ix);
			selectMarkerA(prev_ix);
		}

		this.redo = ()=>{
			createMarkerAndAdd(safeCursor, ix, type);			
			selectMarkerA(ix);
		}

		this.destroy = ()=>{}

    	this.name = 'Create marker';
	}	

	var DeleteMarkerCommand = function(ix) {
		var safeCursor = cursorTime;
		var isSelected = ix == selectIndex;

		this.execute = ()=>{
			deleteMarker(ix);
			return true;
		}

		this.undo = ()=>{
			createMarkerAndAdd(safeCursor, ix);	
			if (isSelected) selectMarkerA(ix);
		}

		this.redo = ()=>{
			deleteMarker(ix);
		}

		this.destroy = ()=>{}

    	this.name = 'Delete marker';
	}

	function nextIndexInc() {
		nextIndex++;
		return nextIndex;
	}

	function createMarkerAndAdd(a_cursor, a_ix, types) {
		let ix;
		if (typeof(a_cursor) == 'number') {
			ix = a_ix?a_ix:nextIndexInc();
			tlist[ix] = a_cursor;

			let m = createMarker(ix);
			sl(ix, m, tlist[ix] / totalLength * width());		

			if (This.options.onAddMarker) 
				This.options.onAddMarker(ix, types);
		} else throw "Undefined cursor";
		return ix;
	}

	function createMarker(ix) {
		var marker = $('<div class="marker" style="top: -' + (5 + bar.children('.marker').length * 15) + 'px;"></div>');
		marker.css({width: markerWidth, left: 0});
		marker.data('ix', ix);
		marker.draggable({
	        containment: "parent",
	        axis: "x",
	        delay: 200,
	        start: onMarkerStart,
	        drag: onMarkerDrag,
	        stop: onMarkerStop
	    }).filter('#dragV').draggable("option", "axis", "y");

	    marker.click(()=>{doSelectMarker(ix);})
	    marker.mouseenter(onMouseEnter);
	    marker.mouseleave(onMouseLeave);
	    bar.append(marker);

//	    console.log('create marker: ' + ix);
	    return marker;
	}

	function setCursor(time) {
		if (cursorTime != time) {
			cursorTime = time;
			var x = cursorTime / totalLength * width();
			cursor.css('margin-left', x);

			if (!rangeDrag) {
				var lft = bar.position().left;
				var offset = x + lft;
				if ((offset < 0) || (offset > outerBar.width())) {
					let range = slider.slider('values');

			    	let delta = range[1] - range[0]; 
    				range[0] = Math.min(Math.max(cursorTime - delta / 2, 0), totalLength - delta);
    				range[1] = range[0] + delta;

					slider.slider({values: range});				
	    			applyRange(range);
				}
			}

			if (This.options.onChangeCursor) This.options.onChangeCursor(time);
		}
	}

	this.setList = function(a_listObj, a_totalLength) {
		selectIndex = -1;
		totalLength = a_totalLength;
		_range = null;
		bar.empty();
	    tlist = a_listObj;
	    let maxTime = 0;
	    nextIndex = 0;
    	for (let i in tlist) {
    		let ni = parseInt(i);
			createMarker(ni);
			maxTime = Math.max(tlist[ni], maxTime);
			nextIndex = Math.max(nextIndex, ni);
    	}

      	if (totalLength == 0) totalLength = maxTime;

		_rangeMin = 60;
		let maxRange = totalLength < _rangeMin ? totalLength : _rangeMin;

		slider.slider({max: totalLength, values: [0, maxRange]});
		applyRange([0, maxRange]);
	}

	this.refresh = function() {
		_requireRefresh = true;
	}

	this.getList = function() {
		return tlist;
	}

	this.setItem = function(ix, time) {
		if (time <= totalLength) {
			tlist[ix] = time;
			var m = getMarker(ix);
			sl(ix, m, tlist[ix] / totalLength * width());
		}
	}

	function checkCreateMarker() {
		let min = Number.MAX_VALUE;
		let d = min;
		for (let t in tlist) {
			d = Math.abs(tlist[t] - cursorTime);
			if (d < min) min = d;
		}
		
		return min >= 0.8;
	}

	this.setCursor = setCursor;
	this.createMarkerCommand = (type)=>{
		let cmd = new CreateMarkerCommand(type);
		commandManager.executeCmd(cmd);
		return cmd.getIndex();
	}

	this.deleteSelectedMarker = ()=>{
		if (selectIndex > -1)
			commandManager.executeCmd(new DeleteMarkerCommand(selectIndex));
	}

	function checkAndAdd(type) {

		localStorage.setItem('defaultComponent', type);
		let r = markerWidth * totalLength / width() * 0.5;

		for (let i in tlist)
			if ((cursorTime >= tlist[i] - r) && (cursorTime <= tlist[i] + r)) {
				if (selectIndex != i) doSelectMarker(i);
				options.onAppendComponent(i, type);
				return;
			}
		if (checkCreateMarker())
			This.createMarkerCommand(type);
		else $(window).trigger('onAppError', 'Interval too small');
	}	

	function onDelMarker() {
		This.deleteSelectedMarker();
	}	

	function defaultComponent() {
		let deftype = parseInt(localStorage.getItem('defaultComponent'));
		if (!deftype) deftype = Components.defaultComponent;
		return deftype;
	}

	function onChangeIndex(e, player) {
		for (let i in tlist) {
			if (tlist[i] == player.time) {
				selectMarkerA(i);
				break;
			}
		}
	}

	delBtn.click(onDelMarker);
	addBtn.click(()=>{checkAndAdd(defaultComponent())});

	let menu = addBtn.parent().find('.dropdown-menu');
	let id;
	for (let i in Components)
		if (id = parseInt(i)) {
			let itm = $('<a class="dropdown-item" data-id="' + id + '">' +  Components[id].title +'</a>');
			itm.click((e)=>{
				checkAndAdd($(e.currentTarget).data('id'))
			});
			menu.append(itm);
		}

	bar.parent().on('mousedown', onBarDown);
	elem.on('wheel', (e)=>{
		let delta = Math.sign(event.deltaY) * 2;
		let range = slider.slider('values');

		range[0] = Math.min(Math.max(0, range[0] - delta), totalLength);
		range[1] = Math.max(Math.min(totalLength, range[1] + delta), range[0] + 1);
		slider.slider({values: range});		
    	applyRange(range);
    	e.stopPropagation();
    	return false;
	});

	$(window).resize(()=>{_requireRefresh = true;})

	//$(window).on('onChangeIndex', onChangeIndex);
}