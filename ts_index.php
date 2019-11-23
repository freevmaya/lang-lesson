<?
	$text = @$_POST['text'];
?>
<form method="POST" action="ts_index.php">
	<input type="text" name="text" value="<?=$text?>"/>
	<input type="submit"/>
</form>
<?
// includes the autoloader for libraries installed with composer
require __DIR__ . '/vendor/autoload.php';

// Imports the Cloud Client Library
use Google\Cloud\TextToSpeech\V1\AudioConfig;
use Google\Cloud\TextToSpeech\V1\AudioEncoding;
use Google\Cloud\TextToSpeech\V1\SsmlVoiceGender;
use Google\Cloud\TextToSpeech\V1\SynthesisInput;
use Google\Cloud\TextToSpeech\V1\TextToSpeechClient;
use Google\Cloud\TextToSpeech\V1\VoiceSelectionParams;


putenv('GOOGLE_APPLICATION_CREDENTIALS=..\lang-lesson-da6a316d34e5.json');

// instantiates a client
$client = new TextToSpeechClient();

if ($text) {

	// sets text to be synthesised
	$synthesisInputText = (new SynthesisInput())->setText($text);

	// build the voice request, select the language code ("en-US") and the ssml
	// voice gender
	$voice = (new VoiceSelectionParams())
	    ->setLanguageCode('en-US')
	    ->setSsmlGender(SsmlVoiceGender::FEMALE);

	// Effects profile
	$effectsProfileId = "telephony-class-application";

	// select the type of audio file you want returned
	$audioConfig = (new AudioConfig())
	    ->setAudioEncoding(AudioEncoding::MP3)
	    ->setEffectsProfileId(array($effectsProfileId));

	// perform text-to-speech request on the text input with selected voice
	// parameters and audio file type
	$response = $client->synthesizeSpeech($synthesisInputText, $voice, $audioConfig);
	$audioContent = $response->getAudioContent();

	// the response's audioContent is binary

	$file_name = 'audio/output.mp3';
	$file = fopen($file_name, 'w+');
	fwrite($file, $audioContent);
	fclose($file);

	echo "Audio content written to <a href=\"$file_name\" type=\"audio/mpeg3\" target=\"_blank\">$file_name</a>". PHP_EOL;
}
?>