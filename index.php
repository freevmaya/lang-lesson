<?
  header("Content-type: text/html; charset=utf-8");

  include_once('../config-lang-lesson.php');
  include(INCLUDE_PATH.'/engine.php');

  $isEditor = @$_GET['editor']?true:false;

  $controller = new Controller();
  $controller->task();

  $site_name = 'Дополнительный контент для вашего видео.';
  $title = '';
  $site_image = '';  

  $width = 980;
  $height = round($width / 1.78);
?>
<!DOCTYPE html>
<html>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <?include("views/og.php");?>

    <link rel="stylesheet" type="text/css" href="<?=$mainURL?>css/styles.css">
    <link rel="stylesheet" type="text/css" href="<?=$mainURL?>css/timeline.css">
    <link rel="stylesheet" type="text/css" href="<?=$mainURL?>css/item-editor.css">
    <link rel="stylesheet" type="text/css" href="<?=$mainURL?>css/jquery-ui.css">
    <link rel="stylesheet" type="text/css" href="<?=$mainURL?>css/colors.css">

    <link href="<?=$mainURL?>css/bootstrap.min.css" rel="stylesheet" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <link href="<?=$mainURL?>bootstrap4-glyphicons/css/bootstrap-glyphicons.css" rel="stylesheet">


    <script src="<?=$mainURL?>js/jquery-3.4.1.min.js"></script>
    <script src="<?=$mainURL?>js/jquery-ui.js"></script>
    <script src="<?=$mainURL?>js/jquery.maskedinput.min.js"></script>
    <script src="<?=$mainURL?>js/jquery.cookie.js"></script>
    <script src="<?=$mainURL?>js/timeline.js"></script>
    <script src="<?=$mainURL?>js/player.js"></script>
    <script src="<?=$mainURL?>js/lang-data.js"></script>
    <script src="<?=$mainURL?>js/editor-app.js"></script>
    <script src="<?=$mainURL?>js/template.js"></script>
    <script src="<?=$mainURL?>js/functions.js"></script>
    <script src="<?=$mainURL?>js/controls.js"></script>
    <script src="<?=$mainURL?>js/command/command.js"></script>
    <script src="<?=$mainURL?>js/command/study-commands.js"></script>
    <script src="<?=$mainURL?>js/components/time-marker.js"></script>
    <script src="<?=$mainURL?>js/components/trans-text.js"></script>
    <script src="<?=$mainURL?>js/components/title.js"></script>
    <script src="<?=$mainURL?>js/components/puzzle.js"></script>

    <style type="text/css">
      .playerContainer {
        width: <?=$width?>px;
      }

      .langControls {
        width: <?=$width?>px;
      }

      @media screen and (max-width: <?=$width + 200?>px) {
        .player-wrap {
          display: block;
        }

        .list-container {
          height: auto !important;
          overflow-y: auto !important;
        }
      }

      @media screen and (max-width: <?=$width?>px) {
        nav {
          width: auto;
          padding: 0.2em !important;
        }

        nav.bg-light {          
          background-color: #f8f9fa00 !important;
        }

        nav.bg-light:hover {          
          background-color: #f8f9faFF !important;
          box-shadow: 0 0 6px black;
        }

        .player-wrap {
          margin-top: 0px;          
        }

        .navbar-collapse {
          margin: 0.5em;
        }

        .navbar-toggler {
          background: #f8f9fa8c;
          width: 2em;
          height: 2em;
          padding: 0px;
        }

        .playerContainer {
          left: 0px;
          right: 0px;
          margin-top: 0px;
        }

        .controls {
        }

        .Editor {
        }

        .transText {
          font-size: 1.5em;
        }

        .transTextAll {
          font-size: 1em;
        }

        .langControls .btn {
          opacity: 1 !important;
        }
        
        .item .trash {
          opacity: 1;
        }

        .CPuzzle {
          padding: 0 !important;
        }

        .tooltip-layer {
          display: none;
        }
      }
    </style>
  <body>
    <div class="hidden">
      <!-- Modal -->
      <div class="modal fade" id="dialogModal" tabindex="-1" role="dialog" aria-labelledby="dialogModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title title" id="exampleModalLabel"></h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body content">                    
            </div>
            <div class="error">
              <h3>Error</h3>
              <span></span>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" name="okButton"></button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <?include_once("views/templates.php")?>
    <div class="d-flex w-100 mx-auto flex-column page-wrapper">
      <?include_once("views/navbar.php")?>
      <?include_once("views/player.php")?>
      <main role="main" class="inner">
        <div>
          <?include_once("views/content.php")?>
        </div>
      </main>
      <footer class="page-footer text-center">
        <div class="inner">
          <p>© 2019 Copyright: <a href="http://vmaya.com/">Vmaya</a></p>
        </div>
      </footer>
    </div>

    <!-- Popper.js, then Bootstrap JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

    <script type="text/javascript">
      var Components = {
        defaultComponent: TransText.id
      }

      Components[TimeMarker.id] = TimeMarker;
      Components[TransText.id] = TransText;
      Components[CTitle.id] = CTitle;
      Components[CPuzzle.id] = CPuzzle;

      var echoURL = '<?=$mainURL?>echo/';
      <?$controller->getScriptData();?>
    </script>
  </body>
</html>