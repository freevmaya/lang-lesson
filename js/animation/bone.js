(()=>{
	var bone = {
		soffset: null,
		drag: null
	}

	$.fn.anchorControl = function() {
		Object.defineProperty(this, 'pos', {
			get: ()=>{
				let p = this.position();
				let c = this.center;
				return new Vector(p.left + c.x, p.top + c.y);},
			set: (value)=>{
				let c = this.center;
				this.css({'left': value.x - c.x, 'top': value.y - c.y});
			}
		});

		Object.defineProperty(this, 'center', {get: ()=>{
			return this.size.divide(2);
		}});

		Object.defineProperty(this, 'size', {
			get: ()=>{return new Vector(this.outerWidth(), this.outerHeight());},
			set: (value)=>{this.outerWidth(value.x); this.outerHeight(value.y);}
		});
		return this;
	}

	$.fn.boneControl = function() {
		let _anchor = new Vector();
		let _rotate = 0;

		Object.defineProperty(this, 'pos', {
			get: ()=>{return new Vector(parseInt(this.css('left')), parseInt(this.css('top')));},
			set: (value)=>{this.css({'left': value.x, 'top': value.y});}
		});

		Object.defineProperty(this, 'size', {
			get: ()=>{return new Vector(this.outerWidth(), this.outerHeight());},
			set: (value)=>{this.outerWidth(value.x); this.outerHeight(value.y);}
		});

		Object.defineProperty(this, 'anchor', {
			get: ()=>{return _anchor;},
			set: (value)=>{
				if (_anchor != value) {
					_anchor = value;
					this.css('transform-origin', _anchor.x + 'px ' + _anchor.y + 'px');
				}
			}
		})

		Object.defineProperty(this, 'rotate', {
			get: ()=>{return _rotate;},
			set: (value)=>{
				if (_rotate != value) {
					_rotate = value;
					this.css('transform', 'rotate(' + _rotate + 'rad)');
				}
			}
		})

		this.anchor = new Vector(this.width() / 2, 0);

		return this;
	}


	$.fn.animCanvas = function() {

		var selected;
		var anchorEnd = $('.anchor.end').anchorControl();
		var anchorBase = $('.anchor.base').anchorControl();

		function updateSelected() {
			let p1 = anchorBase.pos;
			/*let p2 = anchorEnd.pos;

			selected.rotate = p1.sub(p2).angle();*/
			selected.pos = p1;
		}

		function setSelected(value) {
			if (value != selected) {
				if (selected) selected.removeClass('selected');
				selected = value;
				if (selected) {
					selected.addClass('selected');

					anchorBase.pos = selected.pos;
					anchorEnd.pos = (new Vector(Math.cos(selected.rotate), Math.sin(selected.rotate))).multiply(selected.outerHeight()).add(selected.pos);
				}
			}
		}

		$.each($('.anim-bone'), (i, itm)=>{
			let ctrl = $(itm).boneControl();
			$(itm).click((e)=>{setSelected(ctrl);});
		});

		$('.draggable').draggable();
		$('.anchor').on('drag', ()=>{
			if (selected) updateSelected();
		});
	}

	$(window).ready(()=>{
		$('.anim-canvas').animCanvas();
	});
})();