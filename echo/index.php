<?
	header("Content-type: application/json; charset=utf-8");

	$dirname = preg_split("/[\/\\\]+/", dirname(__FILE__));

	$conf = $dirname[count($dirname) - 2];

	include_once('../../config-'.$conf.'.php');
	include(INCLUDE_PATH.'/engine.php');
	putenv('GOOGLE_APPLICATION_CREDENTIALS='.$_SERVER['DOCUMENT_ROOT'].'/../service-account-credentials.json');

	$domains = array('vmaya.ru', 'lang-lesson.ru', '192.168.1.64');
	$ismaindomain = false;
	foreach ($domains as $domain)
		$ismaindomain = $ismaindomain || (strpos($_SERVER['HTTP_REFERER'], $domain) !== false);

	if ($ismaindomain) {
		if ($method = $_GET['task']) {

			$model_name = @$_GET['model']?$_GET['model']:'langEcho';
			include dirname(__FILE__).'/controllers/'.$model_name.'.php';
			$model = new $model_name();
			$model->$method();

			DB::close();
		} else echo '{"error": "Empty request"}';
	} else echo '{"error": "Unresolved domain"}';
?>