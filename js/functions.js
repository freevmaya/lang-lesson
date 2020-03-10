(function() {
  let w = $(window);
  w.ready(()=>{
    let pc = $('.page-content');

    function onResize() {
      let pf = $('.page-footer');
      let size = w.height() - pf.outerHeight() - $('.navbar').outerHeight();

      pf.css('position', (pc.outerHeight() > size)?'relative':'fixed');
    };

    let layers = ['page-content'];

    var observer = new ResizeObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.target == pc[0]) onResize();
      });
    });
    observer.observe(pc[0]);

    onResize();
  });
})();

$.urlParam = function(name){
var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
return (results && results.length)?results[1]:0;
}

// расчет отображаемого времени
function secondsToTime(time, mls) {

  var h = Math.floor(time / (60 * 60)),
  dm = time % (60 * 60),
  m = Math.floor(dm / 60),
  ds = dm % 60,
  s = Math.floor(ds);
  if (s === 60) {
    s = 0;
    m = m + 1;
  }
  if (s < 10) {
    s = '0' + s;
  }
  if (m === 60) {
    m = 0;
    h = h + 1;
  }
  if (m < 10) {
    m = '0' + m;
  }
  if (mls) {
    s += '.' + Math.floor((ds - s) * 10);
  }
  if (h === 0) {
    fulltime = m + ':' + s;
  } else {
    fulltime = h + ':' + m + ':' + s;
  }
  return fulltime;
}

function parseTime(val) {
  let r = 0;
  if ($.isNumeric(val)) r = parseFloat(val);
  else if (val) {
    let a = val.split(':');
    let t = 1;
    for (let i=a.length - 1; i>=0; i--) {
      r += parseFloat(a[i].replace(',', '.')) * t;
      t *= 60;
    }
  }
  return r;
}

function wordCount(str, count) { // получаем столько слов сколько нужно
  if (str) {
    var a = str.split(/\s/);
    if (a.length > count) return a.splice(0, count).join(' ') + '...';
  }
  return str;
}

function toObj(arr) {
  let result = {};
  for (let i=0; i<arr.length; i++)
    result[i] = arr[i];
  return result;
}

function toArr(obj) {
  let result = [];
  for (let i in obj) result.push(obj[i]);
  return result;
}

function vcode(adata) {
    return window.btoa(unescape(encodeURIComponent(JSON.stringify(adata))));
}

function vdecode(str) {
    return str?JSON.parse(decodeURIComponent(escape(window.atob(str)))):null;
}

/*
function getYTCaptions(videoID, callback) {
  $.getJSON(YTUrl + 'captions?part=snippet&videoId=' + videoID + '&key=' + YTKey, 
    null, (a_data)=>{
      for (let i=0; i<a_data.items.length; i++) {
        let itm = a_data.items[i];
        if (itm.snippet.language == 'en') {
          $.getJSON(YTUrl + 'captions/' + itm.id + '&key=' + YTKey, 
            (a_data)=>{
              console.log(a_data);
          });

          break;
        }
      }
  });
}*/

function isInputActive()
{
  activeObj = document.activeElement;
  return (activeObj.tagName == "INPUT" || activeObj.tagName == "TEXTAREA");
}

function urlLit(w,v) {
  var tr='a b v g d e [\"zh\",\"j\"] z i y k l m n o p r s t u f h c ch sh [\"shh\",\"shch\"] ~ y ~ e yu ya ~ [\"jo\",\"e\" ]'.split(' ');
  var ww=''; w=w.toLowerCase();
  for(i=0; i<w.length; ++i) {
    cc=w.charCodeAt(i); 
    ch=(cc>=1072?tr[cc-1072]:w[i]);
    try {
    if (ch.length<3) 
      ww += ch; 
    else ww += eval(ch)[v];
    } catch {}
  }
  return(ww.replace(/[^a-zA-Z0-9\-]/g,'-').replace(/[-]{2,}/gim, '-').replace( /^\-+/g, '').replace( /\-+$/g, ''));
}

//Shortcut key
$(window).ready(()=>{

  var keys = [];
  $('.shortcut').each((i, item)=>{
    let span = $(item).find('span');
    let key = span.text();
    let keya = key.split('+');
    key = keya[keya.length - 1];
    keya.splice(keya.length - 1, 1);
    keys.push({
      key: key.toUpperCase(),
      extra: keya,
      target: span.parent('a')
    });
  });

  $(window).keydown((e)=>{
    if (!isInputActive()) {
      let key = e.key.toUpperCase();
      for (let i=0;i<keys.length;i++) {
        let data = keys[i];
        if (data.key == key) {
          let r = true;
          let nk = ['ctrlKey', 'shiftKey', 'altKey'];
          for (let n=0;n<data.extra.length;n++) {
            let extra = data.extra[n].toLowerCase() + 'Key';
            r = r && e[extra];
            nk.splice(nk.indexOf(extra));
          }
          nk.forEach((extra)=>{r = r && !e[extra];});
          if (r) {
            var evt = document.createEvent("MouseEvents");
            evt.initEvent("click", true, false);
            data.target[0].dispatchEvent(evt);
            e.preventDefault();
            return false;
          }
        }
      }
    }
    return true;
  });
});

function scrollTo(elem) {
  $('html, body').animate({
      scrollTop: elem.offset().top - $('nav').outerHeight()
  }, 500);
}

$(window).on('onAppError', (e, error)=>{
  console.error('Application error: ' + JSON.stringify(error));
});

var tooltip = new function(){
  var This = this;
  this.handle = null;

  this.show = (x, y, text)=>{
    if (This.handle) {
      if (text) This.text(text);
      if (x && y) This.pos(x, y);
      This.handle.show(150);
    }
  };

  this.pos = (x, y)=>{
    if (This.handle) {
      This.handle.css({
          left: (x - 22) + "px",
          bottom: ($(window).height() - y + 15) + "px",
          opacity: "0.8"
      });
    }
  };

  this.text = (text)=>{
    if (This.handle) This.handle.text(text);
  }

  this.hide = ()=>{
    if (This.handle) This.handle.hide();
  }

  this.hint = (p)=>{
    let hl = p.find('.hint');
    hl.mouseenter(onMouseEnter);
    hl.mousemove(onMouseMove);
    hl.mouseleave(onMouseLeave);
  }

  function onMouseEnter(e) {
    let c = $(e.currentTarget);
    let t = c.data('hint');
    if (t) This.show(e.pageX, e.pageY, t);
  }

  function onMouseMove(e) {This.pos(e.pageX, e.pageY);}
  function onMouseLeave(e) {This.hide();}

  $(window).ready(()=>{
    $("body").append($('<div class="tooltip-layer"></div>').append(This.handle = $('<div class="tooltip"></div>')));
    This.hint($("body"));
  });
};

$.equals = function (arr1, arr2) {
  return JSON.stringify(arr1) == JSON.stringify(arr2);
}



function tround(t) {
  return Math.round(t * 1000) / 1000;
}


var PlayerState = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
}