$.fn.component = function(Class) {

  var This = this;
  this.addClass('component');
  this.addClass('class-' + Class.id);
  this.append(this.head = $('<div class="head">' +
    '<h3>' + Class.title + '</h3>' +
    (Class.id==0?'':'<button class="btn glyphicon glyphicon-trash trash"></button>') + 
  '</div>'));

  return this;
}

$.fn.editor = function(app) {
  var This = this;
  var components = {};
  var layout = {};

  this.setData = (data, ix)=>{
    if (data.content[ix])
      for (let n in components) {
        let cin = (components[n] instanceof TimeMarker.Editor) || (data && data.content[ix].c.includes(parseInt(n)));
        if (cin) layout[n].show(); else layout[n].hide();
        if (cin) components[n].setData(data, ix);
      }
  }

  this.setTime = (time)=>{
    for (let n in components) 
      components[n].setTime(time);
  }

  this.addComponent = (id, getterData, onDelete)=>{
    if (Components[id]) {
      let cl = $('<div></div>').component(Components[id]);
      cl.find('.trash').click(()=>{
        onDelete(id);
      });
      This.append(cl);
      return components[id] = new Components[id].Editor(layout[id] = cl, ()=>{
          commandManager.executeCmd(new components[id].ApplyItemCommand(app, getterData()));
      });
    }
    return null;
  }

  this.hasComponent = (id)=>{
    return components[id] != undefined;
  }

  this.getComponent = (id)=>{
    return components[id];
  }

  this.clearComponents = ()=>{
    for (let n in components) {
      components[n].dispose();
      layout[n].remove();
    }
    components = {};
    layout = {};
    This.hide();
  }
  This.hide();

  return this;
}

var LangApp = function(playerApp, options) {
  var This = this;
  var data = null;
  var selectIndex = -1;
  var plyerSetCursor = false;
  var clipboard = null
  var tlLayout = $('#timeline');
  var editLayer = $('.itemEditor').editor(this);

  function getAbsData() {return data;};

  function setSelectIndex(ix) {
    if (ix > -1) {
      editLayer.show();
      if (data.content.hasOwnProperty(ix))
        editLayer.setData(data, ix);

      if (playerApp && playerApp.playing()) {
        playerApp.pauseVideo();
      }

      This.refreshPlayer();
    } else editLayer.hide();

    selectIndex = ix;
  }

  function onChangeTime(ix) {
    onChangeMarker(ix);
    options.onChange();
  }

  function onChangeMarker(ix) {
    data.timeline = timeline.getList();
    if (selectIndex == ix)
      editLayer.setTime(secondsToTime(data.timeline[ix], true));
  }

  function deleteComponent(ix, cp_id) {
    let item = data.content[ix];
    editLayer.getComponent(cp_id).clearData(data, ix);
    item.c.splice(item.c.indexOf(cp_id), 1);

    editLayer.setData(data, ix);
    options.onChange();
  }

  var deleteComponentCommand = function(ix, componentId) {

    var prev = $.extend({}, data.content[ix]);

    this.execute = ()=>{
      deleteComponent(ix, componentId);
      return true;
    }

    this.undo = ()=>{
      checkAddComponent(ix, componentId, prev);
    }

    this.redo = ()=>{
      deleteComponent(ix, componentId);
      return true;
    }

    this.name = 'Delete component';
  }

  function onDeleteComponent(id) {
    if ((selectIndex > -1) && data.content[selectIndex].c.includes(id))
      commandManager.executeCmd(new deleteComponentCommand(selectIndex, id));
    //deleteComponent(selectIndex, id);
  }

  var addComponentCommand = function(i, componentId) {

    var prev = $.extend({}, data.content[ix]);

    this.execute = ()=>{
      checkAddComponent(ix, componentId);
      return true;
    }

    this.undo = ()=>{
      deleteComponent(ix, componentId);
    }

    this.redo = ()=>{
      checkAddComponent(ix, componentId);
      return true;
    }

    this.name = 'Add component';
  }

  function checkAddComponent(ix, componentId, content_data) {
    if (componentId != undefined) {
      let item = data.content[ix];

      if (!item)
        item = data.content[ix] = {c: [componentId]};
      else {
        if (item.c.includes(componentId)) return;
        item.c.push(componentId);
      }

      let cp = editLayer.getComponent(componentId);
      if (cp == undefined) cp = editLayer.addComponent(componentId, getAbsData, onDeleteComponent);

      data.content[ix] = $.extend(item, content_data?content_data:cp.defaultData());
      editLayer.setData(data, ix);

    } else if (!data.content.hasOwnProperty(ix))
        data.content[ix] = {c: [Components.defaultComponent]};

    options.onChange();
  }

  function onAddMarker(ix, componentId) {
    data.timeline = timeline.getList();
    checkAddComponent(ix, componentId);
  }

  function onAppendComponent(ix, componentId) {
    if (!data.content[ix].c.includes(componentId))
      commandManager.executeCmd(new addComponentCommand(ix, componentId));
  }

  function onChangeCursor(time) {
    if (!plyerSetCursor && playerApp) {
      playerApp.setIndexFromTime(time);
    }
  }

  function onDelete(ix) {
    data.timeline = timeline.getList();
    options.onChange();
  }

  function onNavigate(time) {
    if (!playerApp.playing())
      timeline.setCursor(time);
  }

  this.setItemTime = (ix, time)=>{
    data.timeline[ix]  = time;
    timeline.refresh();
    playerApp.setData(This.getData());
    options.onChange();
  }

  this.setItemData = (ix, content)=>{
    data.content[ix] = content;
    playerApp.setData(This.getData());
    options.onChange();
  }

  this.copySelect = ()=>{
    if (selectIndex > -1) {
      clipboard = data.content[selectIndex];
    }
  }  

  this.paste = ()=>{
    if (clipboard) {
      let ix = timeline.createMarkerCommand();
      data.content[ix] = clipboard;
      editLayer.setData(data, ix);
      options.onChange();
    }
  } 

  this.insert = ()=>{
    timeline.createMarkerCommand();
  }

  this.delete = ()=>{
    timeline.deleteSelectedMarker(); 
  }

  this.setData = function(a_data, a_totalTime) {

    editLayer.clearComponents();
    editLayer.addComponent(TimeMarker.id, getAbsData);

    data = a_data;

    let cn = data.content;
    for (let i in cn) {
      if (!cn[i].c) cn[i].c = [Components.defaultComponent];

      for (let n=0; n<cn[i].c.length;n++) {
        let CClass = Components[cn[i].c[n]];
        if (!editLayer.hasComponent(CClass.id))
          editLayer.addComponent(CClass.id, getAbsData, onDeleteComponent);
      }
    }

    selectIndex = -1;

    if (a_totalTime == 0) $(window).trigger('onAppError', {code: 100, message: 'Missing duration'});

    timeline.setList(data.timeline, a_totalTime);
    if (playerApp) {
      var pdata = This.getData();
      playerApp.setData(pdata);
    }
  }

  this.refreshPlayer = ()=>{
    if (data && data.info) doc.resetFromInfo(data.info);
  }

  this.getData = function() {
    var tmDic = {};
    var tmList = [];
    for (var i in data.timeline) {
      tmDic[data.timeline[i]] = i; 
      tmList.push(parseFloat(data.timeline[i]));
    }
    tmList.sort(function(a, b){return a - b});

    var result = {
      info: data.info,
      id: data.id,
      timeline: {},
      content: {}
    }

    var nix = 0;
    for (var i=0; i<tmList.length; i++) {
      var ix = tmDic[tmList[i]];
      result.timeline[nix] = data.timeline[ix];
      result.content[nix] = data.content[ix];
      nix++;
    }

    return result;
  }

  var newVideoID = false;
  var newVideoData = null;

  function onNewVideoStateChange(e) {  
    if ((newVideoID !== false) && (e.data == YT.PlayerState.PLAYING)) {
      if (newVideoData == null) newVideoData = {id: newVideoID, timeline: [], content: []};
      This.setData(newVideoData, playerApp.videoEl.getDuration());
      newVideoID = false;
      newVideoData = null;
    }
  }

  playerApp.videoEl.addEventListener('onStateChange', onNewVideoStateChange, false);

  this.newVideo = (videoID, a_data)=>{
    commandManager.clearAll();
    newVideoData = a_data;
    playerApp.videoEl.stopVideo();
    playerApp.videoEl.loadVideoById(newVideoID = videoID, -1);
  }

  $(window).on('newContent', (e, videoID)=>{
    This.newVideo(videoID, doc.readInStorage(videoID));    
    editLayer.setData(null);
  });

  $(window).on('onGetVideoContent', (e, callback)=>{
    callback(This.getData());
  })

  $(window).trigger('onShowEditor');
  
  var timeline = this.timeline = new Timeline(tlLayout, {
    markerWidth: 16,
    onSelect: setSelectIndex,
    onChange: onChangeTime,
    onChangeMarker: onChangeMarker,
    onChangeCursor: onChangeCursor,
    onAddMarker: onAddMarker,
    onAppendComponent: onAppendComponent,
    onDelete: onDelete
  });

  if (playerApp) {
    playerApp.options.onNavigate = onNavigate;
    setInterval(()=>{
      if (playerApp.playing()) {
        plyerSetCursor = true;
        timeline.setCursor(playerApp.videoEl.getCurrentTime());
        plyerSetCursor = false;
      }
    }, 100);

    setTimeout(()=>{timeline.setSelectIndex(playerApp.index)}, 100);
  }

  setTimeout(This.refreshPlayer, 100);  
}