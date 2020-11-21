$.fn.settingMenu = function(){
  this.appendItem = (cap_index, func, cap_params)=>{
    let em = $('<a class="dropdown-item" href="#" data-locale="' + cap_index + '">' + Locale.value(cap_index, cap_params) + '</a>');
    em.click(func);
    this.append(em);
  }
}

function Player(parent, options) {

  var This = this;

  videoEl = null;  
  this.options = options?options:{};

  var vidControls = parent.find('.controls'),
    backBtn = parent.find('.backBtn'),
    nextBtn = parent.find('.nextBtn'),
    stopBtn = parent.find('.stopBtn'),
    timeList = parent.find('.timeList'),
    settingMenu = parent.find('.setting-menu'),
    settingMenuLayer = parent.find('.setting-menu-layer'),
    langControls = parent.find('.langControls'),
    separator = $('.playerContainer .separator'),
    septum = $('.playerContainer .playerSeptum');
    septButton = $('.playerContainer .playerSeptum button');
    septBtState = 'none';

  var tindex = -1;
  var tlist = {};
  var content = {};
  var partStop = true, partStopped = false, pauseWord = null;
  var afterSetIndex = false;
  var curText = false;
  var components = {};
  var onStateChangeListeners = [];

  Object.defineProperty(this, 'content', {get: ()=>{return content;}});
  Object.defineProperty(this, 'index', {get: ()=>{return tindex;}});
  Object.defineProperty(this, 'layout', {get: ()=>{return parent;}});
  Object.defineProperty(this, 'time', {get: ()=>{return tlist[tindex];}});
  Object.defineProperty(this, 'storage_id', {get: ()=>{return 'player-state-' + (doc && doc.record?doc.record.id:'null');}});  
  Object.defineProperty(this, 'startIndex', {get: ()=>{
    let si = parseInt(localStorage.getItem(This.storage_id));
    if (si == undefined) si = -1;
    return si;
  }});

  settingMenu.settingMenu();

  separator.draggable({
    axis: "y",
    start: ()=>{septum.show();},
    stop: ()=>{septum.hide();},
    drag: ()=>{
      let minh = Math.round($(window).height() * 0.2);
      let vp = $('.videoPlayer');
      let ph = separator.offset().top - vp.offset().top;
      if (ph > minh) {
        doc.setPlayerSize(vp.width(), ph);
        vp.css({height: ph});
        vp.data('usersize', ph);
      }
    }
  });

  septum.click((e)=>{
    afterPlayer(()=>{
      if (septBtState == 'none') {
        if (This.playing()) {
          septButtonState('pause');
          This.pauseVideo();
        } else play();
        e.stopPropagation();
        return false;
      } else if (septBtState == 'pause') {
        play();
        e.stopPropagation();
      } else if (septBtState == 'repeat') {
        setIndex(tindex, true, partStopped);
        e.stopPropagation();
      }
    });
  });

  this.playing = ()=>{
    return videoEl && videoEl.getPlayerState && (videoEl.getPlayerState() == PlayerState.PLAYING);
  }

  this.hold = (value)=>{
    partStop = value;
    if (value) stopBtn.addClass("stop"); else stopBtn.removeClass("stop");
    if (videoEl.getPlayerState && !partStop && !This.playing()) play();
  }

  this.getDuration = ()=>{
    return videoEl?videoEl.getDuration():0;
  }

  this.stopVideo = ()=>{
    videoEl.stopVideo();
  }

  this.pauseVideo = ()=>{
    videoEl.pauseVideo();
    langControls.addClass('pause');
  }

  this.loadVideoById = (videoID)=>{
    videoEl.loadVideoById(videoID, -1);
  }

  this.onStateChange = (onEvent)=>{
    if (videoEl) 
      videoEl.addEventListener('onStateChange', onEvent, false);    
    onStateChangeListeners.push(onEvent);
  }

  this.getCurrentTime = ()=>{
    return videoEl.getCurrentTime();
  }

  onStateChangeListeners.push(function (e) {  
    if (e.data == PlayerState.PLAYING) {
      if (partStopped) nextStep();
      partStopped = false;
    }
  });

  this.init = (a_videoEl)=>{
    videoEl = a_videoEl;

    $(window).keydown((e)=>{
      if (!((e.target.type == 'text') || (e.target.type == 'textarea')) && (e.keyCode == 32) && ($.dialog.show == null)) {
        if (This.playing()) This.pauseVideo();
        else play();
        e.stopPropagation();
        return false;
      }
    });

    setInterval(()=>{
      if (videoEl && videoEl.getCurrentTime) {
        var time = videoEl.getCurrentTime();

        if (!afterSetIndex) {
          if (This.playing()) {
            if (langControls.hasClass('pause')) langControls.removeClass('pause');
            if (!partStopped) {
              var a_tindex = parseInt(calcTIndex(time));            
              if ((a_tindex > -1) && (a_tindex != tindex) && content[a_tindex])
                beforeChangeIndex(a_tindex);
            }
          }
        }
      }
    }, 30);

    for (let i=0; i<onStateChangeListeners.length; i++)
      videoEl.addEventListener('onStateChange', onStateChangeListeners[i], false);

    videoEl.addEventListener('onReady', function (e) {
      if ((This.startIndex > -1) && (tlist.hasOwnProperty(This.startIndex)))
        setIndex(This.startIndex, true, false);
    }, false);
  }

  function accurateIndex(time, limit) {
    let t;
    for (t in tlist)
      if ((tround(tlist[t]) >= tround(time - limit) && (tround(tlist[t]) <= tround(time + limit)))) return parseInt(t);
    return -1;
  }

  function calcTIndex(time) {
    let pt, t=0;
    for (t in tlist) {
      if (pt) {
        if ((tround(tlist[t]) > tround(time)) && (tround(tlist[pt]) <= tround(time))) return parseInt(pt);        
      } else if (tround(time) <= tround(tlist[t])) return parseInt(t);
      pt = t;
    }
    return (time > 0)?parseInt(t):0;
  }  

  function backBtnRefresh() {
    backBtn.find('span').removeClass('glyphicon-repeat').addClass('glyphicon-triangle-left');
  }

  function septButtonState(state) {
    if (septBtState != state) {
      septBtState = state;
      let span = septButton.find('span');
      span.removeClass('glyphicon-repeat').removeClass('glyphicon-play');
      if (state == 'none') septButton.css('display', 'none');
      else {
        septButton.css('display', 'block');
        if (state == 'repeat') span.addClass('glyphicon-repeat');
        else span.addClass('glyphicon-play');
      }
    }
  }

  function play() {
    if (partStopped) backBtnRefresh();

    partStopped = false;

    if (pauseWord != null) {
      pauseWord.removeClass('pfocus');
      pauseWord = null;
    }
    videoEl.playVideo();
    updateComponents();
    nextBtn.removeClass('pfocus');
    septButtonState('none');
    $(window).trigger('onPlay', This);
  }

  function stopPart() {
    partStopped = true;
    nextBtn.addClass('pfocus');
    backBtn.find('span').removeClass('glyphicon-triangle-left').addClass('glyphicon-repeat');
    septButtonState('repeat');
    This.pauseVideo();
    $(window).trigger('onStopPart', This);
  }

  This.setIndexFromTime = function(time) {
    if (videoEl) {
      videoEl.seekTo(time, true);
      setIndex(calcTIndex(time));
      if (videoEl.getPlayerState() == PlayerState.CUED) {
        function onCheckState() {
          if (This.playing()) {
            This.pauseVideo();
            clearTimeout(timer);
          }
        }

        let timer = setInterval(onCheckState, 100);
      }
      partStopped = false;
    }
  }

  var setIndex = this.setIndex = function setIndex(index, seekSet, startPlay) {
    if (seekSet && videoEl) videoEl.seekTo(tlist[index], true);

    if (tindex != index) {
      tindex = parseInt(index);
      localStorage.setItem(This.storage_id, tindex);
      timeList.val(tindex);
      updateComponents();
      afterSetIndex = true;
      setTimeout(()=>{afterSetIndex = false;}, 500);
      $(window).trigger('onChangeIndex', This);
    }
    if (startPlay) play();
    backBtnRefresh();
  }

  function disposeComponents() {
    for (let i in components)
      components[i].dispose();

    components = {};
  }

  function initComponents() {
    for (let i in content) {
      if (!content[i].c) content[i].c = [Components.defaultComponent];

      for (let n=0; n<content[i].c.length;n++) {
        let ci = content[i].c[n];
        if (typeof ci != 'number')
          ci = content[i].c[n] = Components.defaultComponent;
        
        if (components[ci] == undefined)
          components[ci] = new Components[ci](This);
      }
    }
  }

  function updateComponents() {
    settingMenu.empty();

    let isMenu = false;
    if ((tindex > -1) && (content[tindex])) {
      for (let i in components) {
        let v = content[tindex].c.includes(parseInt(i));
        components[i].visible(v);
        if (v) {
          components[i].updateContent(content, tindex);
          if (isMenu = components[i].settingMenu != undefined)
            components[i].settingMenu(settingMenu);
        }
      }
    }
    settingMenuLayer[isMenu?'show':'hide']();
    doc.resetFromInfo();
  }

  This.setData = function(a_vdata) {

    disposeComponents();

    tlist = {};
    for (var i in a_vdata.timeline)
      tlist[i] = parseTime(a_vdata.timeline[i]);

    content = {};
    for (let i in a_vdata.content)
      content[i] = $.extend({}, a_vdata.content[i]);

    partStopped = false;
    tindex = This.startIndex;

    if (!tlist.hasOwnProperty(tindex)) {
      tindex = -1;
      for (let n in tlist) {
        tindex = parseInt(n);
        break;
      }
    }
    initComponents();
    updateComponents();

    //if (videoEl) This.setIndexFromTime(videoEl.getCurrentTime());
    $(window).trigger('onChangeIndex', This);

    resetTimeList();
    septButtonState('none');
  }

  function resetTimeList() {
    timeList.empty();

    var cindex = -1;
    for (var i in tlist) {
      var selected = '';
      if ((cindex == -1) && videoEl && 
          videoEl.getPlayerState && (tlist[i] >= videoEl.getCurrentTime())) {
        cindex = i;
        selected = ' selected ';
      }

      let s = '';
      let time = secondsToTime(tlist[i]);
      if (content[i] && content[i].c) {
        for (let n in content[i].c) {
          let cp = content[i].c[n];
          if (components[cp])
            s += wordCount(components[cp].getCaption(content, i), 10);
        }
//      var s = content[i].text?wordCount(content[i].text[0].replace(/\|/ig, ' '), 4):'-';
        timeList.append($('<option value="' + i + '"' + selected +'>' + time + ' ' + s + '</option>'));
      } else {
        console.log('No content index:' + i + ', time: ' + time);
      }
    }
  }

  timeList.change(()=>{
    afterPlayer(()=>{
      setIndex(parseInt(timeList.val()), true, partStopped);
    });
  });

  stopBtn.click(()=>{
    This.hold(!partStop);
  });

  function afterPlayer(success) {
    if (!videoEl) $(window).trigger("requirePlayer", success);
    else success();
  }

  function doAfterNavigate(index) {
    if (This.options.onNavigate) This.options.onNavigate(tlist[index]);    
  }

  function nextStep() {
    for (let t in tlist)
      if (tindex < t) {
        setIndex(t, true, partStop && partStopped);
        doAfterNavigate(t);
        break;
      }
  }

  function backStep() {
    let p = tindex;
    for (let t in tlist) {
      if (tindex == t) {
        setIndex(p, true, partStop && partStopped);
        doAfterNavigate(p);
        break;
      }
      p = t;
    }
  }

  function backBtnClick() {
    afterPlayer(()=>{      
      let aix, time = videoEl.getCurrentTime();
      if (partStop && partStopped) {
        setIndex(tindex, true, partStopped);
      } else if ((aix = accurateIndex(time, 0.5)) > 0) {
        setIndex(aix - 1, true, partStopped);
      } else {
        let ctime = calcTIndex(time);
        setIndex(ctime, true, partStopped);
      }
      doAfterNavigate(tindex);
    });
  }

  backBtn.click(backBtnClick);
  nextBtn.click(()=>{afterPlayer(nextStep);});

  function beforeChangeIndex(a_tindex) {
    let edata = {
      stop: false,
      current: tindex,
      next: a_tindex,
      player: This
    };
    $(window).trigger('beforePayerIndex', edata);

    let stop = false;
    if (tindex > -1) {
      let c = content[tindex].c;
      for (var i = 0; i < c.length; i++) {
        stop = stop || components[c[i]].stop(This, tindex);
      }
    }

    if (stop && partStop && (a_tindex == tindex + 1)) stopPart();
    else setIndex(a_tindex);
  }

  $(window).on('onResetAnswers', ()=>{
    setIndex(0);
  }); 
}