$.isEmpty = (e)=>{
	return !e || (e.length == 0);
}

$.fn.findAny = function(n) {
	let result;
	if ($.isEmpty(result = this.find(n)))
		if ($.isEmpty(result = this.find('.' + n)))
			if ($.isEmpty(result = this.find('#' + n)))
				result = this.find('[name="' + n + '"]');

	return result;
}

var Template = {

	create: (a_tmpl, data)=>{
		let tmpl = a_tmpl;
		tmpl = a_tmpl.clone();
		for (let n in data) {
			let elem = tmpl.findAny(n);
			if (!$.isEmpty(elem)) {
				let tmplText = elem.text();
				let options = {};
				try {
					options = JSON.parse(tmplText);
				} catch (e) {}

				let ldata = options.prepare?options.prepare(tmplText, data[n]):data[n];
				if (typeof(ldata) == 'function')
					ldata(elem);
				else if (typeof(ldata) == 'string') elem.html(ldata);
				else elem.append(ldata);
			} else console.log('Field "' + n + '" not found');
		}
		return tmpl;
	}
}