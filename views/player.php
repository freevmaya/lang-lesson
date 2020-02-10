<div class="player-wrap">
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
        <div class="btn-group dropup setting-menu-layer">
          <a href="#" role="button" data-toggle="dropdown"><span class="glyphicon glyphicon-cog"></span></a>
          <div class="setting-menu dropdown-menu" aria-labelledby="setting"></div>  
        </div>
        <div><span class="glyphicon glyphicon-star"></span><span id="scope">0</span></div>
      </div>
      <div class="controls" data-auto-component="controls">
        <select class="timeList">
          <option>---</option>>
        </select>
        <div class="btn stop hint stopBtn" data-hint="Stops playing">hold</div>
      </div>
      <?include(dirname(__FILE__).'/editor.php');?>
    </div>
  </div>
  <?
    include_once('views/myclips.php');
  ?>
</div>
<script type="text/javascript">
  var doc;

  var PlayerDoc = function(container) {
    var This = this;
    var vdata, player = null, layout;
    var playerApp = new playerInit(container);
    var params = {};
    var seg = [];
    var _vid = 0;
    var _scope = 0;
    var _user=null;

    var audioElement = document.createElement('audio');
    var speechList = {};


    Object.defineProperty(this, 'data', {get: ()=>{return This.getData();}});
    Object.defineProperty(this, 'vid', {get: ()=>{return _vid;}});
    Object.defineProperty(this, 'editMode', {get: ()=>{return container.hasClass('editContaier');}});
    Object.defineProperty(this, 'scope', {get: ()=>{return _scope;}, set: (value)=>{
      _scope = value;
      container.find('#scope').text(value);
    }});

    Object.defineProperty(this, 'user', {get: ()=>{return _user;}, set: (value)=>{
      if (_user != value) {
        _user = value;
        if (_user == null)
          $.post(echoURL + "?task=logout", function(user) {
            $.removeCookie('uid');
          });

        doAfterLogin(_user);
      }
    }});

    this.langapp = null;

    this.getData = ()=>{
      return vdata;
    }

    doAfterLogin = (user)=>{
      $(window).trigger('onLoginUser', user);
      if (user) {
        $('.user').css('display', 'block');
        $.getJSON(echoURL + '?task=playlist', plMenuUpdate);
        $('.user-title').text(user.first_name + " " + user.last_name);
      } else {
        $('.user-title').text('');
        $('.user').css('display', 'none');
      }
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

    this.loadVideo = (id, afterLoad)=>{

      if (!player) This.YouTubeAPILoad();
      
      $.getJSON(echoURL + '?task=get&id=' + parseInt(id), (result)=>{
        if (result && result.data) {

          _vid = parseInt(result.id);
          This.scope = result.scope?result.scope:This.storageScope();

          result = vdecode(result.data);
          if (playerApp) 
            $(window).trigger('onOpenVideoContent', result);
          else vdata = result;

          This.address(undefined, undefined, id);

          if (afterLoad) afterLoad(vdata);
        }
      });
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
/*
    function calcPlayerSize(rate) {
      let w = <?=$width?>;
      let ww = $(window).width();
      if (w > ww) w = ww;

      let wh = $(window).height() - 140;
      let vh = w * rate;

      if (vh > wh) {
        w = wh / rate;
        vh = wh;
      }

      if (vh > 640) {
        let delta = container.find('.videoPlayer').offset().top + vh + container.find('.controlsBlock').height() - 
                  ($(window).height() * 0.9);
        if (delta > 0)
          vh -= delta;
      }

      return {width: w, height: Math.round(vh)};
    }
*/


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
      if (player) player.originSetSize(w, h);
      else layout.css(size);

      container.css('width', size.width);
      container.find('.langControls').css('width', size.width);
      container.find('.playerSeptum').css('height', h);
      container.trigger('onPlayerSize', size);
    }

/*
    this.setPlayerSizeRate = (rate)=>{
      let size = calcPlayerSize(rate);
      let usersize = layout.data('usersize');
      if (usersize) size.height = usersize;
      This.setPlayerSize(size.width, size.height);
    }
*/

    this.setPlayerSizeRate = (rate)=>{
      if (layout) {
        var dec = 0;
        let size = calcPlayerSize(rate);
        if (usersize = layout.data('usersize')) size.height = usersize;

        let sizer = {
          playerSize: (c)=>{
            This.setPlayerSize(size.width, size.height);
            return size.height;
          },
          langControls: (c)=>{
            c.css('height', 'auto');
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
            let scale = nh/c.height();
            c.find('.player-area').attr('style', 'transform: scale(1, ' + scale + ');');
            c.css('height', nh);
          }
        }

        var h = 0;
        $('[data-auto-component]').each((i, itm)=>{
          let fname = $(itm).data('auto-component');
          h += sizer[sizer[fname]?fname:'default']($(itm));
        });

        let wh = $(window).height();
        if (wh < h) dec = h - wh;
        $('[data-auto-component]').each((i, itm)=>{
            let fname = $(itm).data('auto-component');
            if (handler[fname]) handler[fname]($(itm));
        });
      }
    } 

    this.getSize = (info)=>{
      if (info.height)
        return info;

      return info.thumbnails.maxres?info.thumbnails.maxres:info.thumbnails.high;
    }

    this.resetFromInfo = (info)=>{
      if (!info && vdata) info = vdata.info;

      if (info) {
        let res = This.getSize(info);
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

    this.afterYTLoad = null;
    this.autoplay = 0;

    this.YouTubeAPILoad = function(afterLoad) {
      this.afterYTLoad = afterLoad;
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    this.isYTLoaded = function() {
      return player != null;
    }

    this.YouTubeReady = function() {

      var initdata = {
        width: layout.css('width')?parseInt(layout.css('width')):'<?=$width?>',
        height: layout.css('height')?parseInt(layout.css('height')):'<?=$height?>',
        playerVars: { 
          controls: <?=($_GET['dev']?"1":"0")?>,
          autoplay: This.autoplay,
          iv_load_policy:3,
          enablejsapi:1,
          origin: document.location.host,
          rel: 0,
          modestbranding: 1, 
          showinfo: 0, 
          ecver: 2
        }
      }

      if (vdata && vdata.id) {
        initdata.videoId = vdata.id;
        initdata.events = {
          onReady: ()=>{
            let usersize = layout.data('usersize');

            layout = container.find('.videoPlayer');
            let clcss = {width: '', height: ''};
            if (usersize != undefined) clcss.height = usersize;
            layout.css(clcss);

            if (vdata.info) This.resetFromInfo(vdata.info);
            else getVideoInfo(vdata.id, (info)=>{
              This.resetFromInfo(vdata.info = info);
            })

            if (This.afterYTLoad) This.afterYTLoad();
          }
        }
      }

      player = new YT.Player(container.find('.videoPlayer')[0], initdata);
      player.originSetSize = player.setSize;
      player.setSize = This.setPlayerSize;
      playerApp.init(player);
    } 

    function onChange() {
      vdata = This.langapp.getData();
      playerApp.setData(vdata);
      This.saveToStorage(vdata);
    }

    function checkAndCreateEditor() {
      if (!This.langapp) {
        This.langapp = new LangApp(playerApp, {onChange: onChange});
        container.find('.Editor').css('display', 'block');
        container.addClass('editContaier');
      }
    }

    $(window).on('ToEditMode', (e)=>{
      if (vdata && vdata.id) {
        if (!This.isYTLoaded()) This.YouTubeAPILoad(()=>{
          checkAndCreateEditor();
          This.langapp.setData(vdata, player.getDuration());
        }); else {
          checkAndCreateEditor();
          This.langapp.setData(vdata, player.getDuration());
        }
      }
    });

    This.openVideoContent = (a_data)=>{
      function afterYTLoad() {
        vdata = a_data;

        if (!vdata.info) {
          getVideoInfo(vdata.id, (info)=>{
            vdata.info = info;
            This.resetFromInfo(vdata.info);
          }) 
        } else This.resetFromInfo(vdata.info);

        if (This.langapp) This.langapp.newVideo(vdata.id, vdata);
        else {
          player.stopVideo();
          player.loadVideoById(vdata.id);
          playerApp.setData(vdata);
        }
      }

      if (a_data.id) {
        if (!This.isYTLoaded()) This.YouTubeAPILoad(afterYTLoad); 
        else afterYTLoad();
      }
    }

    $(window).on('onOpenVideoContent', (e, a_data)=>{This.openVideoContent(a_data);});

    $(window).on('newContent', (e, videoID)=>{
      function afterYTLoad() {
        checkAndCreateEditor();

        let a_data = This.readInStorage(videoID);
        console.log("Video ID: " + videoID + ", data - " + a_data);
        if (a_data) {
          vdata = a_data;
          This.langapp.newVideo(videoID, vdata);
          if (vdata.info) This.resetFromInfo(vdata.info);
          else getVideoInfo(videoID, (info)=>{This.resetFromInfo(vdata.info = info)});
        } else {
          getVideoInfo(videoID, (info)=>{
            vdata = {
              info: info,
              id: videoID,
              timeline: [],
              content: []
            };
            This.langapp.newVideo(videoID, vdata);
            This.resetFromInfo(info);
          });
        }

        _vid = 0;
      }

      if (!This.isYTLoaded()) This.YouTubeAPILoad(afterYTLoad); 
      else afterYTLoad();

      e.stopPropagation();
      return false;
    });

    function startLayout() {
      if (vdata) {
        playerApp.setData(vdata);
        if (vdata.info) {
          layout = container.find('.videoPlayer');
          let w = <?=$width?>;
          let res = This.getSize(vdata.info);
          layout.find('.yt-button').click(()=>{
            This.autoplay = 1;
            This.YouTubeAPILoad();
          });
          layout.css('background-image', 'url(' + res.url + ')');
          This.resetFromInfo(vdata.info);
        }
      }    
    }

    <?if ($video = $controller->getVideo()) {?>
    vdata = vdecode('<?=$video['data']?>');
    _vid = <?=$video['id']?>;
    This.scope = <?=$video['scope']?$video['scope']:'This.storageScope()'?>;
    This.address(undefined, undefined, _vid);
    <?} else {?>
    if (!vdata) {
      vdata = This.readInStorage(This.curVideoID());
      This.scope = This.storageScope();
    }
    <?
    if ($defvideo = $controller->getDefaultVideo()) {
    ?>
    if (!vdata) vdata = vdecode('<?=$defvideo['data']?>');
    <?}}?>

    $(window).ready(startLayout);
    $(window).resize(()=>{
      if (vdata && vdata.info) This.resetFromInfo(vdata.info);
    }) 

    $(window).on('requireYTPlayer', (e, callBack)=>{
      if (!This.isYTLoaded()) This.YouTubeAPILoad(callBack);
    });

    $(window).on('onAfterSaveToLibrary', (e, data)=>{
      _vid = parseInt(data.id);
    });

    $(window).on('onGetVideoContent', (e, callback)=>{
      callback(This.getData());
    });
  }
  //END DOC CLASS

  doc = new PlayerDoc($('.playerContainer'));
  function onYouTubeIframeAPIReady() {doc.YouTubeReady();}

  $(window).ready(()=>{
    doc.user = (<?=$controller->user?json_encode($controller->user):'null'?>);
  });

</script>