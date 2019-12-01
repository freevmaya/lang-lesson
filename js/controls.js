$.dialog = (title, content, success, okCaption)=>{
	let dlg = Template.create($('#dialogModal'), {
		title: title,
		content: content,
		okButton: (elem)=>{
			if (success) {
				elem.html(okCaption?okCaption:'Ok');
				elem.click(success);
			} else elem.hide();
		}
	}, true).modal();

  	dlg.on('hidden.bs.modal', function (e) {
  		dlg.remove();
	});

	dlg.close = ()=>{
		dlg.modal("hide");
		setTimeout(()=>{dlg.remove();}, 1000);
	}
	dlg.error = (error)=>{
		dlg.find('.error').show().children('span').text(error);
		dlg.find('[name=okButton]').hide();
	}
	return dlg;
}

$.message = (message)=>{
	$.dialog('Message', message);
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