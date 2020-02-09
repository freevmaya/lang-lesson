<?
class langEcho extends BaseController {

	public function login() {
		$network = $this->safePost('network');
		$uid = $this->safePost('uid');
		$url = $this->safePost('profile');
		$last_name = $this->safePost('last_name');
		$first_name = $this->safePost('first_name');

		if (!($networkRec = DB::line("SELECT * FROM auth_providers WHERE name = '{$network}'"))) {
			DB::query("INSERT INTO auth_providers (name) VALUES ('{$network}')");
			$provider_id = DB::lastID();
		} else $provider_id = $networkRec['id'];

		if (!($user = DB::line("SELECT * FROM users WHERE source_uid = {$uid} AND auth_provider_id = {$provider_id}"))) {
			DB::query("INSERT INTO users (source_uid, auth_provider_id, url, last_name, first_name) ".
						"VALUES ({$uid}, {$provider_id}, '{$url}', '{$last_name}', '{$first_name}')");
			$id = DB::lastID();
			$user = DB::line("SELECT * FROM users WHERE uid = {$id}");
		} else $id = $user['uid'];

		setcookie("uid", $id, time() + BaseController::YEAR_TIME, '/', $_SERVER['HTTP_HOST']);

		echo json_encode($user);
	}

	public function logout() {
		setcookie("uid", null, -1, '/', $_SERVER['HTTP_HOST']);
		unset($_COOKIE['uid']);
		echo '{"result": 1}';
	}

	public function get() {
		if ($id = intval($_GET['id'])) {
			if ($item = DB::line("SELECT * FROM lang_items WHERE id={$id}")) {
				$item['data'] = stripcslashes($item['data']);

				if ($uid = isset($_COOKIE["uid"])?$_COOKIE["uid"]:false) 
					$scope = DB::one("SELECT incValue + decValue AS value FROM score WHERE user_id=:user_id", [':user_id'=>$uid]);
				//else $scope = DB::one("SELECT incValue + decValue AS value FROM score WHERE task_id=:task_id", [':task_id'=>$id]);

				if ($scope)	$item['scope'] = $scope;
				
				echo json_encode($item);
				return;
			}
		}
		echo '{"result": "error", "error": "Receive data"}';
	} 

	public function removeUserClips() {
		$c_uid = isset($_COOKIE["uid"])?$_COOKIE["uid"]:0;
		if (($uid = $this->safePost('uid')) == $c_uid) {
			$ids = $this->safePost('ids');
			if (DB::query("DELETE FROM lang_items WHERE id IN ({$ids})")) {
				echo '{"result": "ok"}';
				return;
			}
		} else echo '{"result": "error", "error": "You cannot delete other people\'s files"}';
	}

	public function getUserClips() {
		if ($uid = $this->safeGet('uid')) {

			$defplaylist = array('list'=>[], 'title'=>'My library', 'id'=>0, 'link'=>'default_playlist', 'uid'=>$uid);
			$playlist = null;
			$pid = 0;

			if (is_numeric($_GET['pid'])) {
				if ($pid = $this->safeGet('pid'))
					$playlist = DB::line("SELECT * FROM playlist WHERE id={$pid}");
				else $playlist = $defplaylist;

				$playlist['list'] = DB::asArray("SELECT id, title, preview_url FROM lang_items WHERE uid={$uid} AND pid={$pid}");
			} else {
				$link = $this->safeStr($_GET['pid'], 64);
				if ($link != $defplaylist['link']) {
					if ($playlist = DB::line("SELECT * FROM playlist WHERE uid={$uid} AND link='{$link}'")) 
						$playlist['list'] = DB::asArray("SELECT id, title, preview_url FROM lang_items WHERE uid={$uid} AND pid={$playlist['id']}");
					else $playlist = $defplaylist;
				} else {
					$playlist = $defplaylist;
					$playlist['list'] = DB::asArray("SELECT id, title, preview_url FROM lang_items WHERE uid={$uid} AND pid=0");
				}
			}

			$playlist['link'] = $uid.'/'.$playlist['link'];

			echo json_encode($playlist);
		}
	}

	public function playlist() {
		$uid = isset($_COOKIE["uid"])?$_COOKIE["uid"]:0;
		if ($uid)
			echo json_encode(DB::asArray("SELECT * FROM playlist WHERE uid={$uid}"));
		else echo '{"result": "error", "error": "No authorization"}';
	}

	public function addPlaylist() {
		$uid = isset($_COOKIE["uid"])?$_COOKIE["uid"]:0;
		if ($uid && ($title = $this->safePost('title'))) {
			DB::query("INSERT INTO playlist (uid, title) VALUES ($uid, '{$title}')");
			echo DB::lastID();
		}
	}

	public function removePlaylist() {
		$uid = isset($_COOKIE["uid"])?$_COOKIE["uid"]:0;
		if ($uid && ($id = $this->safePost('id'))) {
			if (DB::query("DELETE FROM playlist WHERE id={$id}"))
				echo '{"result": "ok"}';
			else echo '{"result": "error", "error": "can`t delete playlist"}';
		}
	}

	public function scope() {
		if ($uid = isset($_COOKIE["uid"])?$_COOKIE["uid"]:false) {
			if ($task_id = $this->safePost('task_id')) {
				if (!$item = DB::line("SELECT * FROM score WHERE task_id=:task_id", [':task_id'=>$task_id])) {
					DB::query("INSERT INTO score (task_id, user_id, start_time) VALUES (:task_id, $uid, NOW())", [':task_id'=>$task_id]);
					$item = DB::line("SELECT * FROM score WHERE task_id=:task_id", [':task_id'=>DB::lastID()]);
				}
				if (($value = $this->safePost('value', false)) !== false) {
					if (DB::query("UPDATE score SET incValue = :incValue, decValue = :decValue WHERE task_id=:task_id", 
							[':task_id'=>$task_id, ':incValue'=>$value>0?$value:0, ':decValue'=>$value<0?$value:0])) {
						echo '{"result": "ok"}';
						return;
					}
				} else {
					$incvalue = $this->safePost('incValue', 0);
					$decvalue = $this->safePost('decValue', 0);

					if (DB::query("UPDATE score SET incValue = incValue + :incvalue, decValue = decValue + :decvalue WHERE task_id=:task_id", 
							[':task_id'=>$task_id, ':incvalue'=>$incvalue, ':decvalue'=>$decvalue])) {
						echo '{"result": "ok"}';
						return;
					}
				}
			}
		} else {
			echo '{"result": "empty UID"}';
			return;
		}
		echo '{"result": "error", "error": "can`t set scope"}';
	}

	public function getScope() {
		$uid = isset($_COOKIE["uid"])?$_COOKIE["uid"]:0;
		if ($uid) {
			if ($item = DB::one("SELECT * FROM score WHERE user_id=:user_id", [':user_id'=>$uid])) {
				echo json_encode($item);
				return;
			}
		}
		echo '{"result": "error", "error": "can`t get scope"}';		
	}

	public function create() {
		GLOBAL $_COOKIE;
		$uid = isset($_COOKIE["uid"])?$_COOKIE["uid"]:0;
		if (($data = $_POST['data']) && ($video_id = $_POST['video_id']) && $uid) {

			$pl = $this->safePost('pl', 0); 
			$id = $this->safePost('id', 0);
			$data = $this->safePost('data');
			$title = $this->safePost('title');
			$preview_url = $this->safePost('preview_url');
			$thumbnail_width = $this->safePost('thumbnail_width');
			$thumbnail_height = $this->safePost('thumbnail_height');

			if (is_numeric($pl)) $pid = $pl;
			else {
				$pllink = $this->safePost('pllink', '');
				DB::query("INSERT INTO playlist (uid, link, title) VALUES ({$uid}, '{$pllink}', '{$pl}')");
				$pid = DB::lastID();
			}

			if ($id) {
				$clip_uid = DB::one("SELECT uid FROM lang_items WHERE id=:id", [':id'=>$id]);
				if ($clip_uid != $uid) $id = false;
			}

			if ($id) {
				$query = "UPDATE lang_items SET `pid`={$pid}, `data`='{$data}', `title`='{$title}', `preview_url`='{$preview_url}', `thumbnail_width`={$thumbnail_width}, `thumbnail_height`={$thumbnail_height} WHERE id={$id}";
				DB::query($query);
			} else {
				$query = "INSERT INTO lang_items (`pid`, `uid`, `data`, `video_id`, `created`, `title`, `preview_url`, `thumbnail_width`, 
				`thumbnail_height`) 
				VALUES ({$pid}, {$uid}, '{$data}', '{$video_id}', NOW(), '{$title}', '{$preview_url}', {$thumbnail_width}, {$thumbnail_height})";

				DB::query($query);
				$id = DB::lastID();
			}

			echo json_encode(DB::line("SELECT id, pid, title, preview_url FROM lang_items WHERE id={$id}"));
			return;
		}
		echo '{"result": "error", "error": "Receive data"}';
	}
}
?>