var youtube = function(container, vdata, options) {

	var layout = container.find('.videoPlayer');
	var player, ytcontainer;
	var This = this;

	Object.defineProperty(this, 'player', {get: ()=>{return player;}});
	Object.defineProperty(this, 'loaded', {get: ()=>{return player != null;}});

    this.setPlayerSize = (w, h)=>{
		let size = {width: w, height: h};
		if (player) player.originSetSize(w, h);
		else layout.css(size);

		container.css('width', size.width);
		container.find('.langControls').css('width', size.width);
		container.find('.playerSeptum').css('height', h);
		container.trigger('onPlayerSize', size);
    }

    this.reset = function(a_vdata) {
    	vdata = a_vdata;
    	player.css('display', 'block');
    	options.onReady();
    }

    youtube.YouTubeReady = function() {

		var initdata = {
			width: layout.css('width')?parseInt(layout.css('width')):'<?=$width?>',
			height: layout.css('height')?parseInt(layout.css('height')):'<?=$height?>',
			playerVars: { 
				controls: options.dev,
				autoplay: 1,
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
			  	if (!vdata.info) getVideoInfo(vdata.id, (info)=>{
                  		vdata.info = info;
                  		options.onReady(vdata);
                	}
                ); else options.onReady();
			  }
			}
		}

		ytcontainer = $('<div></div>');
		container.find('.videoPlayer').append(ytcontainer);

		player = new YT.Player(ytcontainer[0], initdata);

		$.extend(player, {
			originSetSize: player.setSize,
			setSize: This.setPlayerSize,
			loadVideo: (vdata)=>{
				player.loadVideoById(vdata.id);
			},
			originDestroy: player.destroy,
			destroy: ()=>{
				player.originDestroy();
				player = null;
			}
		});
    }

    function YouTubeAPILoad(afterLoad) {
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }      

	if (!window['YT']) YouTubeAPILoad();
	else youtube.YouTubeReady();
}

var YTKey = 'AIzaSyAMPefFkyce4DuxzSSfWDRczVlCCMr1hpk';
var YTUrl = 'https://www.googleapis.com/youtube/v3/';

function getVideoInfo(id, callback) {
  $.getJSON(YTUrl + 'videos?id=' + id + '&key=' + YTKey + '&part=snippet', null, (a_data)=>{
    if (a_data.items && a_data.items[0])
      callback(a_data.items[0].snippet);
    else callback({title: document.location.host, width: 640, height: 420});
  });
}

function onYouTubeIframeAPIReady() {youtube.YouTubeReady();}