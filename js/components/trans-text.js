var TransText = function() {
  var layer = $(
  '<div class="trans-text">'+
    '<div class="empty-content">' +
      '<div>Empty content</div>' +
      '<button type="button" class="btn add" onclick="navigate.edit();">add</button>' +
    '</div>' +
    '<div class="transText" id="transText">' +
    '</div>' +
    '<div class="transTextAll" id="transTextAll">' +
    '</div>'+
  '</div>');

  $('.player-area').append(layer);

  var transText = layer.find('.transText'),
      transTextAll = layer.find('.transTextAll'),
      pauseWord = null;

  function initWord(a, t) {
    var x = 0;
    var y = -5;

    a.mouseover(function(d) {
      if (d.currentTarget == a[0]) {
        tooltip.show(d.pageX + x, d.pageY + y, t);
      }
    }).mouseout(function() {
      tooltip.hide();
    }).mousemove(function(d) {
      tooltip.pos(d.pageX + x, d.pageY + y);
    }).click(()=>{
      if (pauseWord != null) {
        pauseWord.removeClass('pfocus');
        pauseWord = a;
        pauseWord.addClass('pfocus');
      } else {
        pauseWord = a;
        pauseWord.addClass('pfocus');
      }

      doc.playSpeech(a.text());
    });
    return a;
  }

  this.visible = (value)=>{
    if (value) layer.show(); else layer.hide();
  }

  this.getCaption = (content, tindex)=>{
    return (content[tindex] && content[tindex].text)?content[tindex].text[0].replace(/\|/ig, ' '):'';
  }

  this.updateContent = (content, tindex)=>{
    var html = '';
    var tw = null;
    var ltw = null;
    transText.empty();

    if ((tindex > -1) && content[tindex].text) {

      ltw = content[tindex].text[1];
      curText = content[tindex].text[0];

      if (curText) {
        tw = ltw?ltw.split('|'):null;
        $.each(curText.split('|'), (i, w)=>{
          if (tw && tw[i])
            transText.append(initWord($('<a>' + w + '</a>'), tw[i].replace(/[,\.]/ig, '')));
          else transText.append(w);
        });

        layer.removeClass("empty");
      } else if (!layer.hasClass("empty")) layer.addClass("empty");
    } else layer.hide();

    if (ltw)
      transTextAll.html(ltw.replace(/\|/ig, ' '));
    else transTextAll.empty();

    tooltip.hide();
  }

  this.dispose = ()=>{layer.remove();}

  this.stop = (player, index)=>{
    return player.content[index].stop?true:false;
  }
}

$.fn.selectedText = function(){
  let input = this[0];
  let s = input.selectionStart, e = input.selectionEnd;
  return {start: s, end: e, text: this.val().substr(s, e - s)};
}

$.fn.langInput = function() {
  var This = this;
  var layer = $('<div class="input-layer" style="display:none"></div>');

  this.setVal = (text)=>{
    This.val(text);
    layer.html(toHtmlChars(text));
  }

  function toHtmlChars(text) {
    let r = '';
    if (text)
      for (let i=0; i<text.length; i++)
        r += '<span>' + text[i] + '</span>';
    return r;
  }

  function updateSize() {layer.css({width: This.outerWidth(), height: This.outerHeight()});}
  function showLayer() {
    let sel = This.selectedText();
    if (sel) {
      layer.children('span').removeClass('sel');

      updateSize();
      layer.css({display: 'block'});
      layer.html(toHtmlChars(This.val()));
      layer.children('span').slice(sel.start, sel.end).addClass('sel');
    }
  }

  this.hideSelect = ()=>{
    layer.css({display: 'none'});
  }

  this.isLayerShow = ()=>{
    return layer.css('display') == 'block';
  }

  layer.mouseover(()=>{This.hideSelect()});
  this.parent().prepend(layer);
  $(window).resize(updateSize);

  This.blur(showLayer);
}


TransText.id = 1;
TransText.title = 'Translate';
TransText.parser = function(vdata, captions) {
  let items = captions.items;
  vdata.timeline = {};
  vdata.content = {};

  if (items.length == 1) {
    items = items[0];
    for (let i=0; i<items.length; i++) {
      vdata.timeline[i] = parseTime(items[i][0]);
      vdata.content[i] = {text: [items[i][2], ''] , stop: true};
    }
  }

  return vdata;
}

TransText.dialog = function(parent, langList) {
  var This = this;
  function selectCtrl(sel) {
    for (let i=0; i<langList.length; i++)
      sel.append($('<option value="' + langList[i].id + '">' + langList[i].lang + '</option>'));
    return This[name] = sel;
  }

  let tmpl = $('.transDialog').clone();
  let slan1 = selectCtrl(tmpl.find('[name=lang1]'));
  parent.append(tmpl);

  this.params = ()=>{
    return {cids: [slan1.val()]}
  }

  return this;
}

TransText.Editor = function(parent, onChange) {

  var layer = $(
    '<div>' +
      '<div>' +
        '<input type="text" name="lang-text" class="text" placeholder="Original phrase"/>' +
      '</div>' +
      '<div class="separate"></div>' +
      '<div class="ftable">' +
        '<input type="text" name="transfer-text" placeholder="Translated" data-locale="translated"/>' +
        '<input type="button" class="btn-primary send" value="Set"></input>' +
      '</div>' +
    '</div>');
  parent.append(Locale.parse(layer));
  parent.head.append($('<div class="right"><span data-locale="stop">Stop</span><input type="checkbox" class="stop"></div>'));

  var This = this;
  var lang_text = layer.find('[name="lang-text"]');
  var transfer_text = layer.find('[name="transfer-text"]');
  var stopcb = parent.find('.stop');
  var This = this;
  var conformity = [];
  var ix;

  layer.find('.send').click(doChange);

  function doChange() {
    if (This.validate()) onChange();
  } 

  function resetConformity(s, e) {
    let i = 0;
    while (i < conformity.length) {
      let it = conformity[i];
      if ((e <= it.start) || (s >= it.end))
        i++;
      else conformity.splice(i, 1);
    }
  }

  function clearConf() {conformity.splice(0);}

  function conformityToText() {
    let orig;
    let text = orig = lang_text.val();
    let ixa = {};
    let transText = '';

    if (conformity.length > 0) {
      conformity.sort((a, b)=>{return a.start - b.start;});

      for (let i=0; i<conformity.length; i++) {
        let im = conformity[i]; 
        ixa[im.start] = ixa[im.end + 1] = 1;
        transText += (transText?'|':'') + im.trans;
      }

      for (let ix in ixa) {
        let s = parseInt(ix);
        if ((s > 1) && (s < text.length - 1)) text = text.substr(0, s - 1) + "|" + text.substr(s);
      }
    } else transText = transfer_text.val();

    return {lang: text, trans: transText};
  }

  function getData() {
    let tdata = conformityToText();
    return [
      tdata.lang,
      tdata.trans,
      stopcb.prop('checked')
    ]
  }

  lang_text.change(clearConf);
  transfer_text.change(clearConf);

  lang_text.langInput();
  transfer_text.select((e)=>{
    if (lang_text.isLayerShow()) {
      let ltsel = lang_text.selectedText();
      lang_text.hideSelect();

      resetConformity(ltsel.start, ltsel.end);
      ltsel.trans = transfer_text.selectedText().text;
      conformity.push(ltsel);
    }
  });

  this.validate = ()=>{
    return true;
  }

  this.setData = (a_data, a_ix)=>{
    conformity  = [];
    ix      = a_ix;

    if (a_data) {   
      lang_text.setVal(a_data.content[ix].text[0]);
      transfer_text.val(a_data.content[ix].text[1]);
      stopcb.prop('checked', a_data.content[ix].stop?true:false);
    } else {
      lang_text.setVal('');
      transfer_text.val('');
      stopcb.prop('checked', false);
    }
  }

  this.clearData = (a_data, a_ix)=>{
    delete a_data.content[ix].text;
    delete a_data.content[ix].stop;
  }

  this.defaultData = ()=>{
    return {text: ['', ''], stop: true};
  }

  this.setTime = (a_time)=>{}

  this.dispose = ()=>{
    layer.remove();
  } 

  this.ApplyItemCommand = function(app, data) {
    var new_data  = getData();
    var back = [data.content[ix].text[0], data.content[ix].text[1], data.stop?true:false];
    var newt = new_data;

    function applyData(lang_text, transfer_text, stop) {
      let cdata = data.content[ix];
      cdata.text = [lang_text, transfer_text];
      cdata.stop = stop;
      app.setItemData(ix, cdata);
    }

    this.execute = ()=>{
      applyData(newt[0], newt[1], newt[2]);
      return true;
    }

    this.undo = ()=>{
      applyData(back[0], back[1], back[2]);
      This.setData(data, ix);
    }

    this.redo = ()=>{
      applyData(newt[0], newt[1], newt[2]);
      This.setData(data, ix);
      return true;
    }

    this.name = 'Translate apply';
  }
}