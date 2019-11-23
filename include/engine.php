<?
  
$error_index = 0;
$error_json = '';
function myErrorHandler($errno, $errstr, $errfile, $errline) {
    GLOBAL $error_index, $error_json;
    $message = $errno.': '.$errstr;
    $error_json .= ($error_json?',':'').'"'.str_replace('"', "'", $message).'"';
    $error_index++;
    return true;
}

function errorJSON() {
    GLOBAL $error_json;
    return $error_json?',"errors":['.$error_json.']':'';
}

set_error_handler('myErrorHandler');

include_once(INCLUDE_PATH.'/fdbg.php');
include_once(INCLUDE_PATH.'/_edbu_pdo.php');
include_once(INCLUDE_PATH.'/BaseController.php');
include_once(INCLUDE_PATH.'/controller.php');

?>