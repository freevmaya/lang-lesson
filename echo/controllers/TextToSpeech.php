<?

require MAINPATH.'/vendor/autoload.php';

// Imports the Cloud Client Library
use Google\Cloud\TextToSpeech\V1\AudioConfig;
use Google\Cloud\TextToSpeech\V1\AudioEncoding;
use Google\Cloud\TextToSpeech\V1\SsmlVoiceGender;
use Google\Cloud\TextToSpeech\V1\SynthesisInput;
use Google\Cloud\TextToSpeech\V1\TextToSpeechClient;
use Google\Cloud\TextToSpeech\V1\VoiceSelectionParams;

define('WORD_MAX_LENGTH', 128);
define('DEFAULT_VOICE', SsmlVoiceGender::FEMALE);

class TextToSpeech extends BaseController {

	private $client;

	function __construct () {
		$this->client = new TextToSpeechClient();
	}

	private function requestWord($text, $voice_a=DEFAULT_VOICE, $lang='en-US') {

		$text = mb_strtolower(mb_substr($text, 0, WORD_MAX_LENGTH));
		$voice = $lang.'_voice_'.$voice_a;
		$path = MAINPATH.'/audio/'.$voice.'/';

		if (!file_exists($path)) {
			mkdir($path);
			chmod($path, 0774);
		}

		$file_path = $path.preg_replace("/[\s]+/", '_', $text).'.mp3';
		$file_url = MAINURL.'/audio/'.$voice.'/'.preg_replace("/[\s]+/", '_', $text).'.mp3';

		if (!file_exists($file_path)) {
			$synthesisInputText = (new SynthesisInput())->setText($text);

			$voice = (new VoiceSelectionParams())
			    ->setLanguageCode($lang)
			    ->setSsmlGender($voice_a);

			$effectsProfileId = "telephony-class-application";
			$audioConfig = (new AudioConfig())
			    ->setAudioEncoding(AudioEncoding::MP3)
			    ->setEffectsProfileId(array($effectsProfileId));
			$response = $this->client->synthesizeSpeech($synthesisInputText, $voice, $audioConfig);
			$audioContent = $response->getAudioContent();
			$file = fopen($file_path, 'w+');
			fwrite($file, $audioContent);
			fclose($file);
		}

		return $file_url;
	} 

	public function prepareSpeech() {
		$urls = [];
		if ($texts = @$_POST['list']) {
			$voice = $this->safePost('voice', SsmlVoiceGender::FEMALE);

			foreach ($texts as $text) { 
				$text = trim($text);
				if ($text && (strlen($text) <= WORD_MAX_LENGTH)) $urls[$text] = $this->requestWord($text, $voice);
			}

			echo '{"urls": '.json_encode($urls).'}';
		}
	}
	
	public function getSpeech() {
		if ($text = trim(@$_POST['text'])) {
			$voice = $this->safePost('voice', SsmlVoiceGender::FEMALE);

			echo '{"url": "'.$this->requestWord($text, $voice).'"}';
		} else echo '{"error": "Unknown error"}';
	}
}

?>