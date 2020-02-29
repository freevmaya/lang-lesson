$.Discussion = (params, user)=>{
	let This = this;
	let layer = $('#discussionDialog').clone();
	layer.removeAttr('id');

	let dlg = $.dialog(Locale.value('discussion'), layer, ()=>{
		sendMessage();
	}, Locale.value('send'));

	let ta = dlg.find('textarea');
	let list = dlg.find('.list');
	let cache_key = params.vid + '-' + params.tid;
	var md = dlg.find('.modal-dialog');

	let tmpl = $('#discussionItem').clone();
	tmpl.removeAttr('id');

	dlg.hLimit(list);

	function addItem(itm, parent) {
		let html = tmpl.clone();
		let n = html.find('.name');
		n.text(itm.first_name + ' ' + itm.last_name);
		html.find('.message').text(itm.message);
		html.data('id', itm.id);
		if (itm.uid == user.uid) {
			html.addClass('myself');
			n.text(Locale.value('you'));
		}
		parent.append(html);
	}

	function getParent(pid) {

		let parent = list;
		if (pid > 0) {
			parent = list.find('[data-id="' + pid +'"]');
			if (parent.length > 0) parent = parent.find('.childs');
		}

		return parent;
	}

	function addMesages(pid, data) {
		let parent = list;

		if (pid) {
			parent = getParent(pid);
			if (parent.length == 0) return;
		} else {
			if (data.length == 0) {
				layer.find('.empty').css('display', 'block');
				return;
			} else layer.find('.empty').css('display', 'none');
		}

		let plist = [];

		$.each(data, (i, itm)=>{
			if (itm.pid == pid) {
				addItem(itm, parent);
				plist.push(itm.id);
			};
		});

		if (plist.length > 0)
			$.each(plist, (i, id)=>{addMesages(id, data);});
	}

	let ch = $.Discussion.cache[cache_key];

	if (ch) addMesages(0, ch);
	else $.post(echoURL + "?model=discussion&task=getMessages", params, function(result) {
		if (result.result == 'ok') {
			$.Discussion.cache[cache_key] = result.data;
			addMesages(0, result.data);
		} else $(window).trigger('onAppError', result.error);
	});

	function sendMessage() {
		params.pid = 0;
		params.message = ta.val();
		$.post(echoURL + "?model=discussion&task=sendMessage", params, function(result) {
			if (result.result == 'ok') {
				delete($.Discussion.cache[cache_key]);
				if (user) {
					result.data.first_name = user.first_name;
					result.data.last_name = user.last_name;
				} else {
					result.data.first_name = Locale.value('guest');
					result.data.last_name = '';
				}
				addItem(result.data, getParent(params.pid));
				ta.val('');
				doc.countMessages++;
			} else $(window).trigger('onAppError', result.error);
		});
	}

	ta.focus();
	return this;
}

$.Discussion.cache = {};