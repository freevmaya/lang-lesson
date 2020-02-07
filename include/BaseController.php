<?
function Bigintval($value) {
  $value = trim($value);
  if (ctype_digit($value)) {
    return $value;
  }
  $value = preg_replace("/[^0-9](.*)$/", '', $value);
  if (ctype_digit($value)) {
    return $value;
  }
  return 0;
}

class BaseController {

	const YEAR_TIME = 31536000;
	const DAY_TIME = 86400;
	const HOUR_TIME = 3600;

	protected static $dbfields = array(
		'url'=>128,
		'identity'=>128,
		'profile'=>128,
		'first_name'=>64,
		'last_name'=>64,
		'name'=>64,
		'title'=>128,
		'preview_url'=>128,
		'preview_url'=>128,
		'cid'=>128,
		'network'=>64,
		'ids'=>1024,
		'pl'=>64,

		'cids'=>'StringArray',
		'uid'=>'Bigintval',
		'id'=>'Bigintval',
		'pid'=>'Bigintval',
		'thumbnail_width'=>'Int',
		'thumbnail_height'=>'Int',
		'created'=>'Datetime',
		'publish'=>'Int',
		'rate'=>'Int',
		'publish'=>'Int',
		'auth_provider_id'=>'Int',
		'source_uid'=>'Int',
		'voice'=>'Int',
		'value'=>'Float'
	);

	function __construct() {
		GLOBAL $_GET;
		$this->parseRequest(explode('/', @$_GET['q']));
	} 

	protected function parseRequest($params) {

	}

	protected function safeStr($val, $maxLen=false) {
		if ($maxLen)
			return mb_substr(addslashes($val), 0, $maxLen);
		else 
			return addslashes($val);
	}

	protected function safeInt($val) {
		return intval($val);
	}

	protected function safeFloat($val) {
		return floatval($val);
	}

	protected function safeBigintval($val) {
		return Bigintval($val);
	}

	protected function safeStringArray($val) {
		for ($i=0; $i < count($val); $i++)
			$val[$i] = $this->safeStr($val[$i]);
		return $val;
	}

	protected function safeValue($list, $name, $def = 0) {
		if (isset($list[$name])) {
			if (isset(BaseController::$dbfields[$name])) {
				if (is_numeric(BaseController::$dbfields[$name]))
					return $this->safeStr($list[$name], BaseController::$dbfields[$name]);
				else {
					$method = 'safe'.BaseController::$dbfields[$name];
					return $this->$method($list[$name]);
				}
			}	

			return $this->safeStr($list[$name]);
		} else return $def;
	}

	protected function safePost($name, $def = 0) {
		GLOBAL $_POST;
		return $this->safeValue($_POST, $name, $def);
	}

	protected function safeGet($name, $def = 0) {
		GLOBAL $_GET;
		return $this->safeValue($_GET, $name, $def);
	}

	public function baseURL() {
		return (@$_SERVER['HTTPS']?'https':'http').'://'.$_SERVER['HTTP_HOST'].'/';
	}
}
?>