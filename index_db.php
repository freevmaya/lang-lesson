<?
	
  header("Content-type: text/html; charset=utf-8");

  include_once('../config-lang-lesson.php');
  include(INCLUDE_PATH.'/engine.php');

  $result = DB::line("SELECT id, title, preview_url FROM lang_items WHERE uid=6");

  print_r($result);
?>