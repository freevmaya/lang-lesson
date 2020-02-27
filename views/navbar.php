<?
  $lessons = DB::asArray("SELECT * FROM playlist WHERE type='training'");

?>
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="navbar-title">
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
    </button>
    <span class="video-title lwidth">
      Video HD
    </span>
  </div>

  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item active">
        <a class="nav-link dropdown-toggle"  id="navbarFile" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-locale="file">
          File
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarFile">
          <a class="dropdown-item"  onclick="navigate.new()" data-locale="new">New</a>
          <a class="dropdown-item file-menu"  onclick="navigate.open()" data-locale="open">Open</a>
          <a class="dropdown-item file-menu"  onclick="navigate.save()" data-locale="save_to_disk">Save to disk</a>
          <a class="dropdown-item user"  onclick="navigate.saveTo()" data-locale="save_to_lib">Save to my library</a>
          <div class="dropdown-divider edit"></div>
          <a class="dropdown-item edit"  onclick="navigate.edit()" data-locale="edit">Edit</a>
          <div class="dropdown-divider user"></div>
          <a class="dropdown-item dropdown-toggle user"  id="navbarPlaylist" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-locale="playlist">
              Playlist
          </a>
          <div class="dropdown-menu" aria-labelledby="navbarPlaylist" id="menuPlayList">
            <a class="dropdown-item"  onclick="myLibrary.show(0, undefined, true);" data-locale="my_library">My library</a>
          </div>
        </div>
      </li>
      <li class="nav-item dropdown edit-menu">
        <a class="nav-link dropdown-toggle"  id="navbarEdit" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-locale="edit">
          Edit
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarEdit">
          <a class="dropdown-item shortcut"  onclick="commandManager.undo()"><dt data-locale="undo">Undo</dt><span>Ctrl+Z</span></a>
          <a class="dropdown-item shortcut"  onclick="commandManager.redo()"><dt data-locale="redo">Redo</dt><span>Ctrl+Y</span></a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item shortcut"  onclick="navigate.copy()"><dt data-locale="copy">Copy</dt><span>Ctrl+C</span></a>
          <a class="dropdown-item shortcut"  onclick="navigate.paste()"><dt data-locale="paste">Paste</dt><span>Ctrl+V</span></a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item shortcut"  onclick="if (doc.langapp) doc.langapp.insert();"><dt data-locale="insert_marker">Insert marker</dt><span>I</span></a>
          <a class="dropdown-item shortcut"  onclick="if (doc.langapp) doc.langapp.delete();"><dt data-locale="delete_marker">Delete marker</dt><span>Delete</span></a>
          <a class="dropdown-item"  onclick="navigate.descriptionEdit()" data-locale="description_edit">Edit description</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item"  onclick="navigate.captions()" data-locale="youtube_captions">Youtube captions</a>
        </div>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle"  id="navbarShare" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-locale="lessons">
          Lessons
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarLessons">
        <?
          foreach ($lessons as $lesson) {
            ?><a class="dropdown-item" onclick="myLibrary.show(<?=$lesson['id']?>, <?=$lesson['uid']?>, true);" ><?=$lesson['title']?></a><?
          }
        ?>
        </div>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle"  id="navbarShare" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-locale="share">
          Share
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarShare">
          <a class="dropdown-item"  onclick="navigate.linkShow()">link</a>
          <div class="dropdown-divider"></div>
          <div>
            <script src="https://yastatic.net/es5-shims/0.0.2/es5-shims.min.js"></script>
            <script src="https://yastatic.net/share2/share.js"></script>
            <div class="ya-share2" data-services="collections,vkontakte,facebook,odnoklassniki,moimir"></div>
          </div>          
        </div>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" id="navbarLogin" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-locale="login">Login</a>
        <div class="dropdown-menu" aria-labelledby="navbarLogin">
          <script src="//ulogin.ru/js/ulogin.js"></script>
          <div id="uLogin" data-ulogin="display=panel;theme=flat;fields=first_name,last_name;providers=vkontakte,odnoklassniki,mailru,facebook;hidden=other;redirect_uri=http%3A%2F%2F<?=$_SERVER['HTTP_HOST']?>;mobilebuttons=0;callback=ulogin"></div>
        </div>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle user user-title" id="navbarUser" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><?
          if ($controller->user)
            echo $controller->user['first_name'].' '.$controller->user['last_name'];
        ?></a>
        <div class="dropdown-menu" aria-labelledby="navbarUser">
          <a class="dropdown-item user" onclick="doc.user = null;" data-locale="logout">Logout</a>
        </div>
      </li>
    </ul>
  </div>
  <span class="video-title hwidth">
    Video HD
  </span>  
</nav>

<script type="text/javascript">

  function plMenuUpdate(list) {
    let plmenu = $('#menuPlayList');

    plmenu.find('.pl').remove();

    for (let i=0; i<list.length; i++) {
      plmenu.append($('<a class="dropdown-item pl"  onclick="myLibrary.show(' + list[i].id + 
                  ', undefined, true);">' + list[i].title + '</a>'));
    }
  }

  function ulogin(token) {
    $.getJSON("//ulogin.ru/token.php?host=" + encodeURIComponent(location.toString()) + "&token=" + token + "&callback=?",
      function(data){
          data = $.parseJSON(data.toString());
          if(!data.error) {
            $.post(echoURL + "?task=login", data, function(user) {
              if (user.uid) {
                $.cookie('uid', user.uid);
                doc.user = user;
              }
            });
          }
      }
    );
  }

  function Navigate() {
    var nav = $('nav');
    var This = this;
    var uid = 0;

    $(window).on('onLoginUser', (e, a_user)=>{
      uid = a_user?a_user.uid:null;
    });
    
    this.new = ()=>{

      var newDialog = $.dialog('New content', $('#newVideoTemplate').clone(), ()=>{

        let link = newDialog.find('[name="link"]');
        let slink = link.val();
        let r = null;
        if (slink && /youtu\.?be/.exec(slink)) {
          r = slink.match(/be\/([\w_\-\d]+)|v=([\w_\-\d]+)/);
        }
        else r = slink.match(/^([\w_-\d]+)$/);

        if (r && (r.length >= 2)) {
          $(window).trigger('newContent', (r[2] != undefined)?r[2]:r[1]);
          newDialog.modal("hide");
          return;
        }

        link.focus();

      }, 'New content');
    }

    this.save = ()=>{
      $(window).trigger('onGetVideoContent', (a_data)=>{
        var link = $('<a download="video_content.txt" href="data:text/plain;base64,' + vcode(a_data) + '"></a>');
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, false);
        link[0].dispatchEvent(evt);
      });
    }

    this.saveTo = ()=>{
      $(window).trigger('onGetVideoContent', (a_data)=>{
        $.getJSON(echoURL + '?task=playlist', (list)=>{

          let content = $('#saveToLibTemplate').clone();
          content.removeAttr('id');

          var input = content.find('[name="title"]');
          var plinput = content.find('[name="playlist-input"]');
          var plid = 0;
          input.val(doc.getData().info.title);

          let pl = content.find('.playlist');
          let ddm = pl.find('.list');
          for (let i=0; i<list.length; i++) 
            ddm.append('<a class="dropdown-item" data-id="' + list[i].id + '">' + list[i].title + '</a>');

          pl.dropdown();
          pl.find('.dropdown-item').click((e)=>{
            let a = $(e.currentTarget);
            plid = a.data('id');
            pl.find('.dropdown-menu').removeClass('show');
            pl.find('.title').text(a.text());

            plinput.css('display', plid != undefined?'none':'block');
            e.stopPropagation();return false;
          });

          var dialog = $.dialog('Save to my library', content, ()=>{
            a_data.info.title = input.val();

            if ((plinput.css('display') == 'block') && (!plinput.val().trim())) {
              plinput.focus();
            } else {
              let size = doc.getSize(a_data.info);
              let pltitle = plinput.val();
              let params = {
                uid: uid,
                pl: (plid != undefined)?plid:pltitle,
                pllink: urlLit(pltitle),
                data: vcode(a_data), 
                video_id: a_data.id,
                title: a_data.info.title,
                preview_url: size.thumbnail_url?size.thumbnail_url:size.url,
                thumbnail_width: size.width,
                thumbnail_height: size.height
              };
              if (doc.vid) params.id = doc.vid;
              $.post(echoURL + "?task=create", params, function(result) {
                if (result && result.id) {
                  dialog.close();
                  $(window).trigger('onAfterSaveToLibrary', result);
                }
              });
            }
          }, 'Save');
        })
      });
    }

    this.open = ()=>{
      var input = $('<input type="file" accept=".txt,.json">');
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      input[0].dispatchEvent(evt);

      input.change(()=>{
        if (input[0].files.length > 0) {
          var reader = new FileReader();
          var file = input[0].files[0];
          reader.readAsText(file, "UTF-8");
          reader.onload = function (e) {
            if (e.target.readyState == 2) {
              try {
                let data = JSON.parse(e.target.result);
                $(window).trigger('onOpenVideoContent', data);
              } catch {
                $(window).trigger('onAppError', {code: 101, message: 'Error read file ' + file.name});
              }
            }
          }
        }
      })
    }

    function showLinkDialog(params) {
      var link = document.location.protocol + '//' +  document.location.host + params;

      var ctmpl = $('#linkVideoTemplate').clone();
      var input = ctmpl.find('[name="link"]');
      input.val(link);
      var succeed = false;

      input.click(()=>{
        if (!succeed) {
          input[0].select();
          try {
            if (succeed = document.execCommand("copy")) {
              ctmpl.find('.success').show();
            }
          } catch(e) {
            succeed = false;
          }
        }
      });

      $.dialog('Link', ctmpl);
    }

    this.linkShow = ()=>{
      let seg = doc.getSeg();
      if ((seg.length > 0) && $.isNumeric(seg[seg.length - 1])) {
        showLinkDialog('/' + doc.getUri());
      } else {
        $(window).trigger('onGetVideoContent', (a_data)=>{
          let size = doc.getSize(a_data.info);
          $.post(echoURL + "?task=create", {
            uid: 0,
            data: vcode(a_data), 
            video_id: a_data.id,
            title: a_data.info.title,
            preview_url: size.url,
            thumbnail_width: size.width,
            thumbnail_height: size.height
          }, function(result) {
            if (result && result.id) {
              showLinkDialog('/' + result.id);
            }
          });
        });
      }
    }

    this.copy = ()=>{
      if (doc.langapp) doc.langapp.copySelect();
    }

    this.paste = ()=>{
      if (doc.langapp) doc.langapp.paste();
    }

/*
    $(window).on('keydown', (e)=>{
      if (e.ctrlKey) {
        switch (e.keyCode) {
          case 90: commandManager.undo();
                  e.preventDefault();
                  return false;
          case 89: commandManager.redo();
                  e.preventDefault();
                  return false;
        }
      }
    });
*/
    this.edit = ()=>{
      $(window).trigger('ToEditMode');
    }

    this.captions = ()=>{
      captionDialog($('#videoCaptions'));
    }

    this.descriptionEdit = ()=>{
      if (doc.vid) {
        let ctmpl = $('.descriptionDialog').clone();
        let text = ctmpl.find('textarea');

        text.val($('#video-description').html());

        let dlg = $.dialog(Locale.value('description'), ctmpl, ()=>{
          let tx = text.val();
          if (tx) {
            $.post(echoURL + '?task=setDescription', {description: tx, id: doc.vid}, (data)=>{

              dlg.onAfterClose = ()=>{
                if (data.result == 'error') $.message(Locale.value(data.error));
                else $(window).trigger('newDescription', tx);
              }

              dlg.close();
            });
          }
        });
      } else $.message(Locale.value('first_save_to_lib'));
    }

    $(window).on('onShowEditor', ()=>{
      nav.find('.edit').hide();
      nav.find('.file-menu').addClass('dropdown-item');
      nav.find('.edit-menu').show();
    });

    nav.find('.edit-menu').hide();

    nav.mouseleave((e)=>{
      var nc = nav.find('.navbar-collapse');
      if (($(window).width() < <?=$width;?>) && nc.hasClass('show')) {
        //let cm = $(e.currentTarget);
        //if ($.contains(nav, cm))
        nc.removeClass('show');
      }
    }); 
  }
  var navigate = new Navigate();

</script>