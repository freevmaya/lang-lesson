<?
require_once MAINPATH.'/data-api/vendor/autoload.php';

class discussion extends BaseController {
	public function sendMessage() {
		if ($text = $this->safePost('message')) {
			$values = [
				'uid'=>isset($_COOKIE["uid"])?$_COOKIE["uid"]:0,
				'vid'=>$this->safePost('vid'),
				'tid'=>$this->safePost('tid'),
				'pid'=>$this->safePost('pid'),
				'message'=>$this->safePost('message')
			];

			if (DB::query("INSERT INTO discussion (vid, tid, uid, pid, message) VALUES (:vid, :tid, :uid, :pid, :message)", $values)) {
				$id = DB::lastID();
				echo '{"result": "ok", "id": '.$id.', "data": '.json_encode($values).'}';
				return;
			}
		}
		echo '{"result": "error", "error": "Not enough data"}';
	}

	public function getMessages() {
		if (($vid = $this->safePost('vid')) && ($tid = $this->safePost('tid'))) {

			$list = DB::asArray("SELECT d.id, d.uid, d.pid, d.message, u.last_name, u.first_name, p.name AS provider
				FROM discussion d 
					LEFT JOIN users u ON u.uid = d.uid
					LEFT JOIN auth_providers p ON p.id = u.auth_provider_id
				WHERE vid=:vid AND tid=:tid", ['vid'=>$vid, 'tid'=>$tid]);

			echo '{"result": "ok", "data": '.json_encode($list).'}';
			return;
		}
		echo '{"result": "error", "error": "Not enough data"}';
	}
}
?>