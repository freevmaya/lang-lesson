function playerInit(parent, options) {

  var This = this;

  this.videoEl;  
  this.options = options?options:{};

  var vidControls = parent.find('.controls'),
    backBtn = parent.find('.backBtn'),
    nextBtn = parent.find('.nextBtn'),
    stopBtn = parent.find('.stopBtn'),
    timeList = parent.find('.timeList'),
    langControls = parent.find('.langControls'),
    separator = $('.playerContainer .separator'),
    septum = $('.playerContainer .playerSeptum');

  var tindex = -1;
  var tlist = {};
  var content = {};
  var partStop = true, partStopped = false, pauseWord = null;
  var afterSetIndex = false;
  var curText = false;
  var components = {};

  Object.defineProperty(this, 'content', {get: ()=>{return content;}});
  Object.defineProperty(this, 'index', {get: ()=>{return tindex;}});
  Object.defineProperty(this, 'layout', {get: ()=>{return parent;}});
  Object.defineProperty(this, 'time', {get: ()=>{return tlist[tindex];}});

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

  function backBtnRefresh() {
    backBtn.find('span').removeClass('glyphicon-repeat').addClass('glyphicon-triangle-left');
  }

  function play() {
    if (partStopped) backBtnRefresh();

    partStopped = false;

    if (pauseWord != null) {
      pauseWord.removeClass('pfocus');
      pauseWord = null;
    }
    This.videoEl.playVideo();
    updateComponents();
    nextBtn.removeClass('pfocus');
    $(window).trigger('onPlay', This);
  }

  function stopPart() {
    partStopped = true;
    nextBtn.addClass('pfocus');
    backBtn.find('span').removeClass('glyphicon-triangle-left').addClass('glyphicon-repeat');
    This.pauseVideo();
    $(window).trigger('onStopPart', This);
  }

  This.setIndexFromTime = function(time) {
    This.videoEl.seekTo(time, true);
    setIndex(This.calcTIndex(time));
    if (This.videoEl.getPlayerState() == YT.PlayerState.CUED) {
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

  var setIndex = this.setIndex = function setIndex(index, seekSet, startPlay) {
    if (seekSet) This.videoEl.seekTo(tlist[index], true);

    if (tindex != index) {
      tindex = parseInt(index);
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
    if ((tindex > -1) && (content[tindex])) {
      for (let i in components) {
        let v = content[tindex].c.includes(parseInt(i));
        components[i].visible(v);
        if (v) components[i].updateContent(content, tindex);
      }
    }
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

    if (!tlist.hasOwnProperty(tindex)) {
      tindex = -1;
      for (let n in tlist) {
        tindex = parseInt(n);
        break;
      }
    }
    initComponents();
    updateComponents();

    if (This.videoEl) This.setIndexFromTime(This.videoEl.getCurrentTime());
    resetTimeList();
  }

  function resetTimeList() {
    timeList.empty();

    var cindex = -1;
    for (var i in tlist) {
      var selected = '';
      if ((cindex == -1) && This.videoEl && 
          This.videoEl.getPlayerState && (tlist[i] >= This.videoEl.getCurrentTime())) {
        cindex = i;
        selected = ' selected ';
      }

      let s = '';
      for (let n in content[i].c) {
        let cp = content[i].c[n];
        if (components[cp])
          s += wordCount(components[cp].getCaption(content, i), 10);
      }

//      var s = content[i].text?wordCount(content[i].text[0].replace(/\|/ig, ' '), 4):'-';
      timeList.append($('<option value="' + i + '"' + selected +'>' + secondsToTime(tlist[i]) + ' ' + s + '</option>'));
    }
  }

  this.calcTIndex = (time)=>{
    let pt, t=0;
    for (t in tlist) {
      if (pt) {
        if ((tlist[t] > time) && (tlist[pt] <= time)) return parseInt(pt);        
      } else if (time <= tlist[t]) return parseInt(t);
      pt = t;
    }
    return (time > 0)?parseInt(t):0;
  }

  this.accurateIndex = (time, limit)=>{
    let t;
    for (t in tlist)
      if ((tlist[t] >= time - limit) && (tlist[t] <= time + limit)) return parseInt(t);
    return -1;
  }

  this.playing = ()=>{
    return This.videoEl && This.videoEl.getPlayerState && (This.videoEl.getPlayerState() == YT.PlayerState.PLAYING);
  }

  this.pauseVideo = ()=>{
    This.videoEl.pauseVideo();
    langControls.addClass('pause');
  }

  this.hold = (value)=>{
    partStop = value;
    if (value) stopBtn.addClass("stop"); else stopBtn.removeClass("stop");
    if (This.videoEl.getPlayerState && !partStop && !This.playing()) play();
  }

  timeList.change(()=>{
    afterYTPlayer(()=>{
      setIndex(parseInt(timeList.val()), true, partStopped);
    });
  });

  stopBtn.click(()=>{
    This.hold(!partStop);
  });

  function afterYTPlayer(success) {
    if (!This.videoEl) $(window).trigger("requireYTPlayer", success);
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

  backBtn.click(()=>{
    afterYTPlayer(()=>{

      let aix, time = This.videoEl.getCurrentTime();
      if (partStop && partStopped) {
        setIndex(tindex, true, partStopped);
      } else if ((aix = This.accurateIndex(time, 0.5)) > 0) {
        setIndex(aix - 1, true, partStopped);
      } else {
        let ctime = This.calcTIndex(time);
        setIndex(ctime, true, partStopped);
      }
      doAfterNavigate(tindex);
      //backStep();
    });
  });

  nextBtn.click(()=>{
    afterYTPlayer(nextStep);    
  });

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

  this.init = (a_videoEl, startIndex)=>{
    This.videoEl = a_videoEl;

    setInterval(()=>{
      if (This.videoEl && This.videoEl.getCurrentTime) {
        var time = This.videoEl.getCurrentTime();

        if (!afterSetIndex) {
          if (This.playing()) {
            if (langControls.hasClass('pause')) langControls.removeClass('pause');
            if (!partStopped) {
              var a_tindex = parseInt(This.calcTIndex(time));            
              if ((a_tindex > -1) && (a_tindex != tindex) && content[a_tindex]) 
                beforeChangeIndex(a_tindex);
            }
          }
        }
      }
    }, 30);

    This.videoEl.addEventListener('onStateChange', function (e) {  
      if (e.data == YT.PlayerState.PLAYING) {
        if (partStopped) nextStep();
        partStopped = false;
      }
    }, false);

    This.videoEl.addEventListener('onReady', function (e) {
      if ((startIndex > -1) && (tlist.hasOwnProperty(startIndex)))
        setIndex(startIndex, true, false);
    }, false);
  }
}