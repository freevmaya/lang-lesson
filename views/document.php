<?
    $video = $controller->getVideo();
?>
<div class="playerContainer">
  <div data-auto-component="playerSize">
    <div class="playerSeptum"><div class="vclose"></div>
      <button type="button">
        <span class="glyphicon"></span>
      </button>
    </div>
    <div class="videoPlayer">
      <div class="yt-button"></div>
    </div>
  </div>
  <div class="separator"></div>
  <div class="controlsBlock">
    <div class="langControls" data-auto-component="langControls">
      <button type="button" class="btn left hint backBtn" data-hint="Back marker">
        <span class="glyphicon glyphicon-triangle-left"></span>
      </button>
      <div class="player-area">
      </div>
      <button type="button" class="btn right hint nextBtn" data-hint="Next marker">
        <span class="glyphicon glyphicon-triangle-right"></span>
      </button>
    </div>
    <div class="data-panel" data-auto-component="dataPanel">
      <div class="item btn-group dropup setting-menu-layer">
        <a role="button" data-toggle="dropdown" data-hint="Additional functions" class="hint">
          <span class="glyphicon glyphicon-leaf"></span>
          <div data-locale="service">Service</div>
        </a>
        <div class="setting-menu dropdown-menu" aria-labelledby="setting"></div>  
      </div>
      <div class="item hint" data-hint="Your bonuses" onclick="doc.showScope()">
        <span class="glyphicon glyphicon-star"></span><div class="scope">0</div>
      </div>
      <div class="item hint" data-hint="Rate lesson" onclick="doc.addRate()">
        <span class="glyphicon glyphicon-thumbs-up"></span><div class="rate"><?=$video?$video['rate']:0?></div>
      </div>
      <div class="item hint" data-hint="Lesson comments" onclick="doc.showMessages()">
        <span class="glyphicon glyphicon-comment"></span><div class="comments">0</div>
      </div>
    </div>
    <div class="controls" data-auto-component="controls">
      <select class="timeList">
        <option>---</option>>
      </select>
      <div class="btn stop hint stopBtn" data-hint="Stops playing">hold</div>
    </div>
    <?include(dirname(__FILE__).'/editor.php');?>
  </div>
  <div id="video-description" style="display:<?=$video?'block':'none'?>">
    <?=$video?$video['description']:''?>
  </div>
</div>
<div class="start-info">
  <p data-locale="start_info"></p>
  <div class="buttons">
    <button type="button" class="btn btn-primary" data-locale="good" name="okButton"></button>      
  </div>
</div>
<script type="text/javascript">
  var doc;

  var PlayerDoc = function(container) {
    var This = this;
    var playerApp = new Player(container);
    var params = {};
    var seg = [];
    var vdata, player = null, layout;
    var _record;
    var _vid = 0;
    var _scope = 0;
    var _user=null;
    var _type;
    var _providers = {};
    var _countMessages;

    var audioElement = document.createElement('audio');
    audioElement.volume = 0.4;
    var speechList = {};


    Object.defineProperty(this, 'data', {get: ()=>{return This.getData();}});
    Object.defineProperty(this, 'record', {get: ()=>{return _record;}});
    Object.defineProperty(this, 'vid', {get: ()=>{return _vid;}});
    Object.defineProperty(this, 'editMode', {get: ()=>{return container.hasClass('editContaier');}});
    Object.defineProperty(this, 'scope', {get: ()=>{return _scope;}, set: (value)=>{
      _scope = value;
      container.find('.scope').text(value);
    }});
    Object.defineProperty(this, 'countMessages', {get: ()=>{return parseInt(container.find('.comments').text());}, set: (value)=>{
      container.find('.comments').text(value);
    }});

    Object.defineProperty(this, 'user', {get: ()=>{return _user;}, set: (value)=>{
      if (_user != value) {
        _user = value;
        if (_user == null)
          $.post(echoURL + "?task=logout", function(user) {
            $.removeCookie('uid');
          });

        $(window).trigger('onLoginUser', _user);
        if (_user) {
          $('.user').css('display', 'block');
          $.getJSON(echoURL + '?task=playlist', plMenuUpdate);
          $('.user-title').text(_user.first_name + " " + _user.last_name);
        } else {
          $('.user-title').text('');
          $('.user').css('display', 'none');
        }
      }
    }});

    this.langapp = null;

    this.showStartInfo = ()=>{
      let si = $('.start-info');

      let top = si.css('top');
      si.css({top: -200, display: 'block'});

      setTimeout(()=>{
        si.css({
          top: top,
          opacity: 1
        });
      }, 2000);

      si.find('.btn-primary').click(()=>{
        si.css({
          top: -200,
          opacity: 0
        });
        setTimeout(()=>{si.hide()}, 1000);
      });
    }

    this.getData = ()=>{
      return vdata;
    }

    this.showScope = ()=>{
      $.message(Locale.value('show_scope', {':scope': _scope}));
    }

    this.showMessages = ()=>{
      $.Discussion({vid: _vid, tid: playerApp.index}, <?=$user?json_encode($user):'null'?>);
    }

    this.addRate = ()=>{
      if (_vid && !localStorage.getItem('set_rate_' + _vid)) {
        $.post(echoURL + "?task=addRate", {vid: _vid}, function() {
          $.message(Locale.value('thank_vote'));
          This.setRateLabel(parseInt(container.find('.rate').text()) + 1);
          localStorage.setItem('set_rate_' + _vid, true);
        });
      } else $.message(Locale.value('already_voted'));
    }

    this.setRateLabel = (val)=>{
      container.find('.rate').text(val);
    }

    this.storageScope = ()=>{
      return parseInt(localStorage.getItem('scope')?localStorage.getItem('scope'):0);
    }

    this.changeScope = (incValue, decValue)=>{
      let cf = ()=>{
        This.scope = This.scope + incValue + decValue;
        if (!_user) localStorage.setItem('scope', This.scope); 
      };
      if ((_vid > 0) && _user) {
        $.post(echoURL + '?task=scope', {task_id: _vid, incValue: incValue, decValue: decValue}, (data)=>{
          if (data.result == 'ok') cf(); else $(window).trigger('onAppError', data.error);
        });
      } else cf();
    }

    this.setDiscription = (description)=>{
      description = description?description:'';
      let layer = $('#video-description');
      if (description.trim()) layer.show();
      else layer.show();
      layer.html(description);
    }

    this.loadVideo = (id, doAfterLoad = false)=>{
      $.getJSON(echoURL + '?task=get&id=' + parseInt(id), (result)=>{
        This.setVideo(result, doAfterLoad);
      });
    }

    this.setVideo = (video, doAfterLoad = false)=>{
      if (video && video.data) {
        if (player) {
          layout.css({width: layout.width(), height: layout.height()});
          player.destroy();
        }

        _countMessages = video.countMessages;

        checkStorage((typeof video.data == 'string')?vdecode(video.data):video.data, (a_data)=>{
          _vid = parseInt(video.id);
          _record = video;
          delete _record.data;

          vdata = a_data;

          This.scope = video.scope?video.scope:This.storageScope();

          This.setDiscription(video.description);
          This.setRateLabel(video.rate);

          This.address(undefined, undefined, _vid);

          initProvider(video.type, ()=>{
            if (playerApp) {
              This.resetFromInfo(vdata.info, _record);
              if (This.langapp) This.langapp.newVideo(vdata);

              player.loadVideo(vdata);
              playerApp.setData(vdata);
            }
            if (doAfterLoad) doAfterLoad(vdata);
          });
        })
      }
    }

    this.serviceOn = (price, func)=>{
      if (doc.scope >= price) {
        doc.changeScope(0, -price);
        func();
      } else $.message(Locale.value('not_enough_points', {':price':price}));
    }

    this.resetAnswers = ()=>{
      if (_vid)
        $(window).trigger('onResetAnswers');
    }

    this.address = (seg1, seg2, seg3) =>{

      if (seg1 != undefined) {
        let a = seg1.split('/');
        for (let s in a) seg[s] = a[s];
      }
      if (seg2 != undefined) seg[1] = seg2;
      if (seg3 != undefined) seg[2] = seg3;

      history.replaceState(null, null, '<?=$controller->baseURL()?>' + This.getUri());
    }

    this.getSeg = ()=>{return seg;}

    this.getUri = ()=>{
      let uri = '';
      for (let s in seg) if (seg[s]) uri += (uri?'/':'') + seg[s];
      return uri;
    }

    this.setTitle = (title)=>{
      document.title = title;
      $(".video-title").text(title);
    }

    function splay(url) {
      audioElement.setAttribute('src', url);
      audioElement.play();      
    }

    this.getSpeech = (text, complete)=>{

      let tindex = text.replace(/[\W\s]+/ig, ' ');

      if (speechList[tindex]) splay(speechList[tindex])
      else {
        $.post(echoURL + '?task=getSpeech&model=TextToSpeech', {
          text: tindex
        }, (data)=>{
          if (data.url) {
            complete(data.url);
            speechList[tindex] = data.url;
          } else $(window).trigger('onAppError', 'Get speech');
        }, "json");
      }
    }

    this.speechIndex = (text)=>{
      return text.replace(/[\W\s]+/ig, ' ');
    }

    this.prepareSpeech = (texts, afterFunc)=>{
      let list = [], isCache = texts.length > 0;
      for (let i=0; i<texts.length; i++) {
        let tindex = This.speechIndex(texts[i]);
        if (!speechList[tindex]) list.push(tindex);
        else isCache = true;
      }

      if (list.length > 0) {
        $.post(echoURL + '?task=prepareSpeech&model=TextToSpeech', {
          list: list
        }, (data)=>{
          if (data.urls) {
            for (let i in data.urls)
              speechList[i] = data.urls[i];
            if (afterFunc) afterFunc(data.urls);
          } else $(window).trigger('onAppError', 'Prepare speech');
        }, "json");
      } else if (isCache && afterFunc) afterFunc();
    }

    this.playSpeech = (text) =>{
      This.getSpeech(text, (url)=>{splay(url);})
    }

    this.talkPhrase = (text, price)=>{
      let tindex = This.speechIndex(text);
      if (speechList[tindex]) This.playSpeech(text);
      else {
        This.prepareSpeech([text], (list)=>{
          This.serviceOn(price, ()=>{
            This.playSpeech(text);
          });
        });
      }
    }


    function calcPlayerSize(rate) {
      let w = <?=$width?>;
      let ww = $(window).width();
      if (w > ww) w = ww;

      let wh = $(window).height();
      let vh = w * rate;

      if (vh > wh) {
        w = wh / rate;
        vh = wh;
      }

      return {width: w, height: Math.round(vh)};
    }

    this.setPlayerSize = (w, h)=>{
      let size = {width: w, height: h};
      if (player) player.setSize(w, h);
      else layout.css(size);

      container.css('width', size.width);
      container.find('.langControls').css('width', size.width);
      container.find('.playerSeptum').css('height', h);
      container.trigger('onPlayerSize', size);
    }

    this.setPlayerSizeRate = (rate)=>{
      if (layout) {
        var dec = 0;
        var minHeight = 64;
        let size = calcPlayerSize(rate);
        if (usersize = layout.data('usersize')) size.height = usersize;

        let sizer = {
          playerSize: (c)=>{
            This.setPlayerSize(size.width, size.height);
            return size.height;
          },
          langControls: (c)=>{
            //c.css('min-height', minHeight);
            c.find('.player-area').attr('style', '');
            return c.outerHeight();
          },
          editor: (c)=>{
            return c.css('display') == 'none'?0:c.outerHeight();
          },
          default: (c)=>{
            return c.outerHeight();
          }
        }

        let handler = {
          playerSize: ()=>{
            This.setPlayerSize(size.width, size.height - dec * 0.5);
          },
          langControls: (c)=>{
            let nh = c.height() - dec * 0.5;
            let scale = Math.min(1, nh/c.height());
            if (nh > minHeight) {
              //c.css('min-height',nh);
              if (scale < 0.99) {
                c.find('.player-area').attr('style', 'transform: scale(1, ' + scale + ');height:' + nh + 'px');
                console.log('scale: ' + scale.toString() + ' ' + nh.toString);
              }
            }
          }
        }

        var h = 0;
        $('[data-auto-component]').each((i, itm)=>{
          let fname = $(itm).data('auto-component');
          h += sizer[sizer[fname]?fname:'default']($(itm));
        });

        let wh = $(window).height() - 2;
        if ((wh < h) && !This.editMode) dec = h - wh;

        $('[data-auto-component]').each((i, itm)=>{
            let fname = $(itm).data('auto-component');
            if (handler[fname]) handler[fname]($(itm));
        });
      }
    } 

    this.getSize = (info)=>{
      if (info) {
        if (info.thumbnail_width && info.preview_url) 
          return {
            width: info.thumbnail_width,
            height: info.thumbnail_height,
            url: info.preview_url
          }
        if (info.height)
          return info;
        if (info.thumbnails)
          return info.thumbnails.maxres?info.thumbnails.maxres:info.thumbnails.high;
      }

      return {
        width: 640,
        height: 480,
        url: document.location.host + '/images/preview/default.jpg'
      }
    }

    this.resetFromInfo = (info, record=false)=>{
      if (!info && vdata) {
        info = vdata.info;
        record = _record;
      }

      if (info) {
        let res = This.getSize(record?record:info);
        This.setTitle(info.title);
        This.setPlayerSizeRate(res.height/res.width);
      } 
    }

    this.saveToStorage = (vdata)=>{
      localStorage.setItem('vdata-' + vdata.id, JSON.stringify(vdata));      
      localStorage.setItem('curid', vdata.id);      
    }

    this.readInStorage = (videoID)=>{
      if (videoID) {
        try {
          return JSON.parse(localStorage.getItem('vdata-' + videoID));     
        } catch {}
      }
      return null;
    }

    this.curVideoID = ()=>{
      return localStorage.getItem('curid');
    }

    function onChange() {
      vdata = This.langapp.getData();
      playerApp.setData(vdata);
      This.saveToStorage(vdata);
    }

    function doChangeIndex(index) {
      for (let i=0; i<_countMessages.length; i++) {
          if (_countMessages[i].tid == index) {
            This.countMessages = _countMessages[i].count;
            return;
          }
        }
        This.countMessages = 0;
    }

    function checkAndCreateEditor() {
      if (!This.langapp) {
        This.langapp = new LangApp(playerApp, {onChange: onChange});
        container.find('.Editor').css('display', 'block');
        container.addClass('editContaier');
        container.trigger('onCreateEditor');
      }
    }

    function cmpTimelines(t1, t2) {
      for (let i in t1)
        if (t1[i] != t2[i]) return false;
      for (let i in t2)
        if (t1[i] != t2[i]) return false;

      return true;
    }

    function checkStorage(a_vdata, afterCheck) {
      let s_vdata = This.readInStorage(a_vdata.id);

      function a_afterCheck() {
        if (confirm(Locale.value('unsaved_data'))) {
          if (afterCheck) afterCheck(s_vdata)
          else {
            _vid = parseInt(s_vdata.id);
            vdata = s_vdata;
            This.resetFromInfo(vdata.info, _record);
            if (This.langapp) This.langapp.newVideo(vdata);

            if (player) {
              player.stopVideo();
              player.loadVideo(vdata);
              playerApp.setData(vdata);
            }
          }

          return vdata;

        } else if (afterCheck) afterCheck(a_vdata);

        return a_vdata;
      }

      if (s_vdata && (a_vdata.id == s_vdata.id)) {

        if (!cmpTimelines(s_vdata.timeline, a_vdata.timeline))
          return a_afterCheck(s_vdata);
      }

      if (afterCheck) afterCheck(a_vdata)
      return a_vdata;
    }

    $(window).on('ToEditMode', (e)=>{
      if (vdata) {
        if (!_providers[_type] || !_providers[_type].loaded) {
          initProvider(_type, ()=>{
            checkAndCreateEditor();
            This.langapp.setData(vdata, player.getDuration());
          });
        } else {
          checkAndCreateEditor();
          This.langapp.setData(vdata, player.getDuration());
        }
      }
    });

    function defaultVData() {
      return  {
        id: 0,
        timeline: [],
        content: [],
        info: {
          width: 640,
          height: 480,
          url: document.location.host + '/images/preview/default.jpg'           
        }
      }
    }

    this.newContentYT = (videoID)=>{
      vdata = This.readInStorage(videoID);
      _vid = 0;

      if (!vdata) {
        vdata = defaultVData();
        vdata.id = videoID;
      }

      function afterYTLoad() {
        //checkAndCreateEditor();
        if (This.langapp) This.langapp.newVideo(vdata);

        player.loadVideo(vdata);
        playerApp.setData(vdata);

        getVideoInfo(videoID, (info)=>{
          let size = This.getSize(info);
          _record = $.extend(_record, {
            thumbnail_width: size.width,
            thumbnail_height: size.height,
            preview_url: size.url
          });
          This.resetFromInfo(vdata.info = info);
        });
      }

      if (player) {
        playerApp.stopVideo();
        player.destroy();
        player = null;
      }
      initProvider('youtube', afterYTLoad);
      return false;
    }

    function initProvider(a_type, doAfter) {
      let options = {
        onReady: (a_vdata)=>{
          if (a_vdata != undefined) vdata = a_vdata;

          player = _providers[a_type].player;
          let usersize = layout.data('usersize');

          layout = container.find('.videoPlayer');
          let clcss = {width: '', height: ''};
          if (usersize != undefined) clcss.height = usersize;
          layout.css(clcss);

          _type = a_type;
          if (_type) container.addClass(_type);

          playerApp.init(player);
          if (doAfter) doAfter();

          This.resetFromInfo(vdata.info, _record);
          layout.css('background-image', 'none');          
        }
      }

      if (_type) container.removeClass(_type);
      layout.find('.yt-button').remove();

      if (window[a_type])
        eval('_providers["' + a_type + '"] = new ' + a_type + '(container, vdata, options);');
      else {
        let script = document.createElement( "script" );
        let head = $('head')[0];
        script.src = '/js/player-providers/' + a_type + '.js';
        script.onload = script.onreadystatechange = function( _, isAbort ) {
            script.onload = script.onreadystatechange = null;
            initProvider(a_type, doAfter);
        };
        head.insertBefore(script, head.firstChild);
      }
    }

    function startLayout() {
      if (vdata) {
        playerApp.setData(vdata);
        layout = container.find('.videoPlayer');
        layout.find('.yt-button').click(()=>{
          initProvider(_type);
        });

        if (vdata.info) {
          let w = <?=$width?>;
          let res = This.getSize(vdata.info);
          layout.css('background-image', 'url(' + res.url + ')');
          This.resetFromInfo(vdata.info, _record);
        }

        if (!localStorage.getItem('first_start')) {
          This.showStartInfo();
          localStorage.setItem('first_start', true);
        }
      }    
    }
    
    This.scope = <?=($controller->user && $controller->user['scope'])?$controller->user['scope']:'This.storageScope()'?>;

    $(window).ready(startLayout);
    $(window).resize(()=>{
      if (vdata && vdata.info) This.resetFromInfo(vdata.info, _record);
    }) 

    $(window).on('requirePlayer', (e, callBack)=>{
      if (_providers[_type] == undefined) {
        initProvider(_type, callBack);
      } else callBack();
    });

    $(window).on('newDescription', (e, description)=>{
      $('#video-description').html(description);
    })

    $(window).on('onAfterSaveToLibrary', (e, data)=>{
      _vid = parseInt(data.id);
    });

    $(window).on('onChangeIndex', (e, data)=>{
      doChangeIndex(data.index);
    });

    $(window).on('onGetVideoContent', (e, callback)=>{
      callback(This.getData());
    });



    <?if ($video) {?>
    <?if ($video['data']) {?>
    vdata = checkStorage(<?=$video['data']?>);
    _record = <?=json_encode(array_merge($video, ['data'=>'']))?>;
    <?} else {?>
    vdata = defaultVData();
    <?}?>
    _type = '<?=$video['type']?>';
    _vid = <?=$video['id']?>;
    _countMessages = <?=json_encode($video['countMessages'])?>;
    This.address(undefined, undefined, _vid);
    <?} else {?>
    if (!vdata) {
      vdata = This.readInStorage(This.curVideoID());
    }
    <?
    if ($defvideo = $controller->getDefaultVideo()) {
    ?>
    if (!vdata) vdata = vdecode('<?=$defvideo['data']?>');
    <?}}?>  
  }
  //END DOC CLASS

  doc = new PlayerDoc($('.playerContainer'));
  //function onYouTubeIframeAPIReady() {YouTubeReady();}
  $(window).ready(()=>{
    doc.user = (<?=$controller->user?json_encode($controller->user):'null'?>);
  });

</script>