<?
class Controller extends BaseController {
	
	private $scriptData;
	private $openVideo = '';

	public $user;

	public $uid;
	public $request_uid;
	public $cid;
	public $pl;

	public function getScriptData() {
		return $this->scriptData;
	}

	public function addScriptData($script) {
		$this->scriptData."\n".$script;
	}

	public function getVideo() {
		return $this->openVideo;
	} 

	public function getDefaultVideo() {
		return $this->decodeVideo(DB::line('SELECT * FROM default_items di LEFT JOIN lang_items li ON di.id = li.id ORDER BY di.rate DESC LIMIT 1'));
	} 

	public function getPlaylists() {
		$list = [];
		if ($uid = @$_COOKIE["uid"]) {
			$list = DB::asArray("SELECT * FROM playlist WHERE uid = {$uid}");
		}

		return $list;
	}

	public function getClips($uid) {
		return DB::asArray("SELECT * FROM lang_items WHERE uid={$uid}");		
	} 

	protected function parseRequest($params) {
		if (count($params) > 0) {
			$this->cid = is_numeric($params[count($params) - 1])?$params[count($params) - 1]:null;
			if (is_numeric($params[0])) {
				$this->request_uid = $params[0];
				if (isset($params[1]))
					$this->pl = $params[1];
			} else $this->cid = $params[0];
		}
	}

	protected static function decodeVideo($item) {
		if ($item['data'][0] != '{') 
			$item['data'] = urldecode(base64_decode($item['data']));
		
		return $item;
	}

	public function task() {
		GLOBAL $_COOKIE;

		if ($this->uid = @$_COOKIE["uid"]) {
			if ($this->user = DB::line("SELECT * FROM users WHERE uid={$this->uid}"));
				$this->user['scope'] = DB::one("SELECT incValue + decValue AS value FROM score WHERE user_id=:user_id", [':user_id'=>$this->uid]);
		}

		if (!$this->cid) 
			$this->cid = DB::one('SELECT id FROM default_items ORDER BY rate DESC LIMIT 1');

		if ($this->cid) {
			$where = "";

			if (is_numeric($this->cid))
				$where = "id={$this->cid}";
			else $where = "video_id='{$this->cid}'";

			if ($item = DB::line('SELECT * FROM lang_items WHERE '.$where.' ORDER BY rate DESC')) {
				$item['data'] = stripcslashes($item['data']);
				if (isset($scope)) $item['scope'] = $scope;
				$item['countMessages'] = DB::asArray("SELECT COUNT(id) AS count, tid FROM discussion WHERE vid=:vid GROUP BY tid", [':vid'=>$this->cid]);

				$this->openVideo = $this->decodeVideo($item);
			}
		}
	}
}
?>