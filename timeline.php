<!DOCTYPE html>
<html>
    <meta name="viewport" content="width=<?=$width?>px, user-scalable=no">
    <link rel="stylesheet" type="text/css" href="css/styles.css">
    <link rel="stylesheet" type="text/css" href="css/timeline.css">
    <link rel="stylesheet" type="text/css" href="css/item-editor.css">
    <link rel="stylesheet" type="text/css" href="css/jquery-ui.css">
    <link rel="stylesheet" type="text/css" href="css/colors.css">

    <link rel="stylesheet" href="css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

    <link href="//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap-glyphicons.css" rel="stylesheet">

    <script src="js/jquery-3.4.1.min.js"></script>
    <script src="js/jquery-ui.js"></script>
    <script src="js/jquery.maskedinput.min.js"></script>
    <script src="js/timeline.js"></script>
    <script src="js/item-editor.js"></script>
    <script src="js/player.js"></script>
    <script src="js/editor-app.js"></script>
    <script src="video/data.js"></script>

    <style type="text/css">
      .playerContainer {width: 800px;}
    </style>

    <script type="text/javascript">
      $(window).ready(()=>{

        function onChange() {

        }
        var langapp = new LangApp(null, {onChange: onChange});

        var vdata = videoData[3];
        $('#clear').click(()=>{
          langapp.setData(vdata, parseTime(vdata.timeline[vdata.timeline.length - 1]));
        });
        langapp.setData(vdata, parseTime(vdata.timeline[vdata.timeline.length - 1]));
      })
    </script>
  <body>
    <div class="playerContainer"> 
      <button class="btn btn-primary add" id="clear">clear</button>
      <div class="timeline" id="timeline">
        <div class="timeline-container">
          <div class="timeline-bar">
            <div class="cursor"></div>
          </div>
          <div class="buttons">
            <button type="button" class="btn btn-primary add">+</button>
            <button type="button" class="btn btn-primary delete">-</button>
          </div>
        </div>
        <div class="slider">
        </div>
      </div>
      <div class="itemEditor">
        <table>
          <tr>
            <td><h3 class="secondary-heading mb-4">Редактор перевода</h3></td>
            <td width="60px"><input type="text" name="time"></td>
          </tr>
          <tr>
            <td colspan="2">
              <textarea name="lang-text"></textarea>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <textarea name="transfer-text"></textarea>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>