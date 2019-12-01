<?
require_once MAINPATH.'/data-api/vendor/autoload.php';

class captions extends BaseController {

	private $client;

	function __construct () {
		$this->client = new Google_Client();
		$this->client->setApplicationName('API code samples');
		$this->client->setScopes([
		    'https://www.googleapis.com/auth/youtube.force-ssl',
		]);

		$this->client->setAuthConfig(MAINPATH.'/../service-account-credentials.json');
	}

	public function getListLang() {
		$result = null;

		if ($vid = @$_GET['vid']) {

			$file_name = MAINPATH.'/captions/'.$vid.'.list';
			if (!file_exists($file_name)) {
				$result = [];

				try {
					$service = new Google_Service_YouTube($this->client);
					$response = $service->captions->listCaptions('snippet', $vid);

					foreach ($response->items as $item) {
						$result[] = ['lang'=>$item->snippet['language'], 'id'=>$item->id];
					}

					$file = fopen($file_name, "w+");
				    fwrite($file, json_encode($result));
				    fclose($file);
				} catch (Exception $e) {
					echo $e->getMessage();
					return;
				} 
			} else {
				echo file_get_contents($file_name);
				return;
			}
		}

		echo json_encode($result);
	}

	private function parseCaptions($captions) {
		$result = [];
		$list = preg_split('/\n/', $captions, -1, PREG_SPLIT_NO_EMPTY);
		$count = count($list);
		$i = 0;
		$item = null;

		while ($i < $count) {
			if (is_numeric($list[$i])) {
				if ($item) $result[] = $item;
				$i++;
				preg_match_all("/(\d\d:\d\d:\d\d,\d\d\d)\s-->\s(\d\d:\d\d:\d\d,\d\d\d)/", $list[$i], $matches);
				if (count($matches[0]) > 0) 
					$item = [$matches[1][0], $matches[2][0], ''];
			} else if ($item) $item[2] .= ($item[2]?' ':'').$list[$i];
			$i++;
		}
		if ($item) $result[] = $item;

		return $result;
	}

	public function getCaptions() {
		$result = [];

		if ($cids = $this->safePost('cids')) {

			foreach ($cids as $i=>$cid) {
				$file_name = MAINPATH.'/captions/'.$cid.'.data';
				if (!file_exists($file_name)) {
					if ($i > 0) sleep(1);
					try {
						$service = new Google_Service_YouTube($this->client);
						$captionResource = $service->captions->download($cid, array(
					        'tfmt' => "srt",
					        'alt' => "media"
					    ));

					    $captions = $captionResource->getBody()->getContents();

					    $file = fopen($file_name, "w+");
					    fwrite($file, $captions);
					    fclose($file);
					} catch (Exception $e) {
						echo '{"error": "'.$e->getMessage().'"}';
						return;
					}
				} else $captions = file_get_contents($file_name);

				$result[] = $this->parseCaptions($captions);
			}
		}

		echo json_encode($result);
	}
}
?>