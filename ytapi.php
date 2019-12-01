<?php
if (($vid = @$_POST['vid']) && ($lang = @$_POST['lang'])) {
	
	if (!file_exists(__DIR__ . '/data-api/vendor/autoload.php')) {
	  throw new Exception(sprintf('Please run "composer require google/apiclient:~2.0" in "%s"', __DIR__));
	}
	require_once __DIR__ . '/data-api/vendor/autoload.php';

	$client = new Google_Client();
	$client->setApplicationName('API code samples');
	$client->setScopes([
	    'https://www.googleapis.com/auth/youtube.force-ssl',
	]);

	$client->setAuthConfig('../service-account-credentials.json');

	$service = new Google_Service_YouTube($client);


	$response = $service->captions->listCaptions('snippet', $vid);
	foreach ($response->items as $item) {
		if (!$lang || ($item->snippet['language'] == $lang)) {

		    $captionResource = $service->captions->download($item->id, array(
		        'tfmt' => "srt",
		        'alt' => "media"
		    ));

		    $captions = $captionResource->getBody()->getContents();
		    echo $captions;
		    break;
		}
	}
} else {
?>
<form action="ytapi.php" method="POST">
	<input type="text" name="vid"><br>
	<input type="text" name="lang" value="en"><br>
	<input type="submit">
</form>
<?
}

?>