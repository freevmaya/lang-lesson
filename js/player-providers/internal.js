var internal = function(container, vdata, options) {

	var layout = container.find('.videoPlayer');
	var player;
	var This = this;

	Object.defineProperty(this, 'player', {get: ()=>{return player;}});
	Object.defineProperty(this, 'loaded', {get: ()=>{return player != null;}});

    this.reset = function(a_vdata) {    	
    	vdata = a_vdata;
    	player.css('display', 'block');
    	options.onReady();
    }

    player = $('<video></video>');

    function onCreateEditor() {
    	player[0].controls = true;
    }

    if (doc.langapp)
    	player[0].controls = true;
    else container.on('onCreateEditor', onCreateEditor);
    var videoEl = player[0];
    var source = $('<source src="/video/' + doc.vid + '.mp4" type="video/mp4"></source>');

    player.append(source);
    layout.html(player);

    player.on('loadeddata', ()=>{
    	options.onReady(vdata);
    	player.trigger('onReady', vdata);
    	videoEl.play();
    });

    let onChangeStage = ()=>{player.trigger('onStateChange', player.getPlayerState())}
    player.on('play', onChangeStage);
    player.on('waiting', onChangeStage);

    $.extend(player, {
		setSize: (w, h)=>{
			let size = {width: w, height: h};
			if (player) {
				player.attr("width", w);
				player.attr("height", h);
			} else layout.css(size);

			container.css('width', size.width);
			container.find('.langControls').css('width', size.width);
			container.find('.playerSeptum').css('height', h);
			container.trigger('onPlayerSize', size);
	    },
	    addEventListener: (type, listener, useCapture)=>{
	    	player.on(type, listener);
	    },
	    getCurrentTime: ()=>{return videoEl.currentTime},
	    seekTo: (time)=>{
	    	if (time != undefined) videoEl.currentTime = time;
	    },
	    getDuration: ()=>{return videoEl.duration;},
	    getPlayerState: ()=>{
	    	if (!videoEl.paused) return PlayerState.PLAYING;
	    	return -1;
	    },
	    pauseVideo: ()=>{videoEl.pause();},
	    stopVideo: ()=>{videoEl.pause();},
	    playVideo: ()=>{videoEl.play();},
	    loadVideo: (vdata)=>{
			source.attr('src', '/video/' + doc.vid + '.mp4');
		},
		destroy: ()=>{
			if (player) {
				container.off('onCreateEditor', onCreateEditor);
				player.remove();
				player = null;
			}
		}
	});
}