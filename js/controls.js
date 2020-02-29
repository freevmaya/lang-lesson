$.dialog = (title, content, success, okCaption)=>{
	let tmpl = $('#dialogModal');
	if (Template && (tmpl.length > 0)) {
		let dlg = Template.create(tmpl, {
			title: title,
			content: content,
			okButton: (elem)=>{
				if (success) {
					elem.html(okCaption?okCaption:'Ok');
					elem.click(success);
				} else elem.hide();
			}
		}, true).modal();

		$.dialog.show = this;
		dlg.onAfterClose = null;

	  	dlg.on('hidden.bs.modal', function (e) {
			$.dialog.show = null;
	  		dlg.remove();
	  		if (dlg.onAfterClose) dlg.onAfterClose();
		});

		dlg.close = ()=>{
			dlg.modal("hide");
			setTimeout(()=>{dlg.remove();}, 1000);
		}
		dlg.error = (error)=>{
			dlg.find('.error').show().children('span').text(error);
			dlg.find('[name=okButton]').hide();
		}

		dlg.hLimit = (reducSelector)=>{
			let md = dlg.find('.modal-dialog');
			let relem = dlg.find(reducSelector);
			function updateHeight() {
				let dh = md.outerHeight() - $(window).innerHeight() + 5;
				if (dh > 0)
					relem.css({height: relem.height() - dh, 'overflow-y': 'scroll'});
			}

			var observer = new ResizeObserver(function(entries) {
		      entries.forEach(function(entry) {
		        if (entry.target == md[0]) updateHeight();
		      });
		    });
		    observer.observe(md[0]);

		  	dlg.on('hidden.bs.modal', function (e) {observer.disconnect();});
		}
		return dlg;
	}
	return null;
}

$.dialog.show = null;

$.message = (message)=>{
	$.dialog(Locale.value('message'), message);
}

$.fn.selectCtrl = function(list) {
	this.empty();
	for (let i in list)
		this.append($('<option value="' + i + '">' + list[i] + '</option>'));
}

function captionDialog(template) {

	let vdata = doc.getData();
	if (vdata) {
	  	$.getJSON(echoURL + '?task=getListLang&model=captions&vid=' + vdata.id, (result)=>{
		    if (result && (result.length > 0)) {
				let ctmpl = template.clone();
				let list = ctmpl.find('.component-list');
				let layout = ctmpl.find('.control');
				var component;
				var cdlg;
				list.append($('<option value="0">--</option>'));
				for (let i in Components)
					if (Components[i].title) list.append($('<option value="' + i + '">' + Components[i].title + '</option>'));
				list.on('change', ()=>{
					layout.empty();
					cdlg = (component = Components[list.val()]).dialog(layout, result);
				});

				let dlg = $.dialog('Captions', ctmpl, ()=>{
					let params = cdlg.params();

					$.post(echoURL + '?task=getCaptions&model=captions', params, (result)=>{
						if (result && result.length) {
							$(window).trigger('applyYTCaptions', {
								id: vdata.id,
								items: result,
								component: component
							});
						} else if (result.error) {
							dlg.error(result.error);
							return;
						}
						dlg.close();
					});
				}, 'Apply');
		    } else {
		    	let msg = "Empty list of languages\n";
		    	if (result.error) msg += "\nResult: " + JSON.stringify(result.error);
		    	$.message(msg);
		    }
		});
	}
}

$.fn.wordHint = function(word, trans) {

	let This = this;
	let layer = $.fn.wordHint.layer;
	let stimer, etimer;

	if (!layer) {
		$.fn.wordHint.layer = layer = $('<div id="word-hint"><div>' +
			'<div><a class="glyphicon glyphicon-volume-up"></a><span class="hint-word"></span></div>' +
			'<div class="dropdown-divider"></div>' +
			'<div><span class="hint-trans"></span></div>' +
			'</div></div>');

		let agh = layer.find('a.glyphicon');
		agh.click((e)=>{
			doc.playSpeech(layer.find('.hint-word').text());
		});

		$('body').append(layer);

		layer.mouseenter(()=>{layer.is_focus = true});
		layer.mouseleave(()=>{
			layer.is_focus = false
			if ($.fn.wordHint.current) $.fn.wordHint.current.onHide();
		});
	}

	function onShow() {
		$.fn.wordHint.current = This;

		layer.find('.hint-word').text(word);
		layer.find('.hint-trans').text(trans);
		let p = This.offset();
		layer.css({'left': p.left + (This.outerWidth() - layer.outerWidth()) / 2, 'top': p.top - layer.outerHeight()});
		layer.show(100);
		stimer = 0;
	}

	this.onHide = ()=>{
		if (!layer.is_focus) {
			$.fn.wordHint.current = null;		
			layer.hide(100);
		}
	}

	function onEnter(e) {
		stimer = setTimeout(onShow, 1000);
	}

	function onLeave(e) {
		if (stimer) {
			clearTimeout(stimer);
			stimer = 0;
		}
		etimer = setTimeout(This.onHide, 200);
	}

	this.mouseenter(onEnter);
	this.mouseleave(onLeave);
}