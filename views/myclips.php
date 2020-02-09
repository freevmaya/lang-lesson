<script type="text/javascript">


	var Library = function() {
		var This = this;
		var isVisible = false;
		var layer;
		var del;
		var cliplist;
		var playlist;

		this.auth_uid = 0;

		function doDelete() {
			let list = getTrashList();
			let ids = '';
			for (let i=0; i<list.length; i++)
				ids += (ids?',':'') + $(list[i]).data('id');

			let dlg = $.dialog('Warning!', $('<p>Do you want to delete selected items?</p>'), ()=>{
				$.post(echoURL + "?task=removeUserClips", {
					uid: This.auth_uid,
					ids: ids
				},function(response) {
					if (response.result == 'ok') This.reload(playlist.uid, playlist.id);
					else $(window).trigger('onAppError', response);
		        });
				dlg.close();
			});
		}

		function showClip(data) {
			doc.loadVideo(data.id, ()=>{
				scrollTo($('.videoPlayer'));
			});
		}

		function toggleTrash(button, data) {
			button.parents('.item').toggleClass('selected');

			let list = getTrashList();
			if (list.length > 0) del.addClass('visible');
			else del.removeClass('visible');
		}

		function getTrashList() {
			return cliplist.children('.selected');
		}

		function createItem(d) {
			let item = $("#item-template").clone();
			item.find('.image').css('background-image', 'url(' + d.preview_url + ')');
			item.find('.title').text(d.title);
			item.find('.thumbnail').click(()=>{showClip(d);});
			if (This.auth_uid != playlist.uid)
				item.find('.trash').remove();
			else item.find('.trash').click((e)=>{toggleTrash($(e.currentTarget), d);});
			item.data('id', d.id);
			return item;
		}

		function resetItems(list) {
			cliplist.empty();

			for (let i=0; i<list.length; i++)
				cliplist.append(createItem(list[i]));

			del.removeClass('visible');
			resetHeight();
		}

		function createLayer(list) {
			layer = $("#my-clips-template").clone();
			layer.removeAttr('id');
			del = layer.find('.delete');

			cliplist = layer.find('.clip-list');			

			$('#library').append(layer);

			resetItems(list);
			del.click(doDelete);
		}

		this.reload = (uid, a_pid, success)=> {
			$.getJSON(echoURL + "?task=getUserClips&uid=" + uid + "&pid=" + a_pid, function(result) {
	          if (result.list) {
	          	playlist = result;

	          	if (!layer) createLayer(playlist.list);
	          	else resetItems(playlist.list);
	          	layer.find(".playlist-title").text(playlist.title);
	          	doc.address(playlist.link);

	          	if (success) success();
	          }
	        });
		}

		this.show = (a_pid, a_uid, is_scroll)=>{
			if (!isVisible || (a_pid != playlist.id) || (a_uid != playlist.uid)) {
				if (!a_uid) a_uid = This.auth_uid;

				This.reload(a_uid, a_pid, ()=>{
					isVisible = true;
					if (is_scroll) scrollTo(layer);
				});
			} else if (is_scroll) scrollTo(layer);
		}

		this.dipose = ()=>{
			if (layer) layer.remove();
		}

		function resetHeight() {
			if (layer) layer.find('.list-container').css('height', $('.playerContainer').outerHeight());
		}

		$(window).on('onAfterSaveToLibrary', (e, item)=>{
			if (layer) {
				let id  = parseInt(item.id);
				let list = layer.find('.item');
				for (let i=0; i<list.length; i++)
					if (parseInt($(list[i]).data('id')) == id) 
						return;

				if (cliplist && (item.pid == playlist.id)) cliplist.append(createItem(item));
			}
		});

		$(window).ready(()=>{
			$('.playerContainer').on('onPlayerSize', resetHeight);
			<?if ($controller->request_uid && $controller->pl) {?>
			This.show('<?=$controller->pl?>', <?=$controller->request_uid?>);
			<?}?>

		})
	}

	var myLibrary = new Library();

	$(window).on('onLoginUser', (e, user)=>{
		if (user) myLibrary.auth_uid = user.uid;
	});

</script>

<div id="library">
</div>

<div class="hidden">
	<div class="my-clips" id="my-clips-template">
		<div class="playlist-title">My works</div>
		<div class="list-container">
			<div class="clip-list">
			</div>
		</div>
		<button class="btn-warning delete btn">Delete</button>
	</div>

	<div class="item" id="item-template">
		<div class="thumbnail">
			<a>
				<div class="image">
				</div>
			</a>
		</div>
		<div class="item-controls">
			<button class="btn glyphicon glyphicon-trash trash"></button>
		</div>
		<div class="title"></div>
	</div>
</div>