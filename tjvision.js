/**
* Author : Victor Dibia
* Title : TJVision ... nodejs to capture and i
*/

var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var watson = require('watson-developer-cloud');
var fs = require('fs');
var config = require("./config");
var child_process = require('child_process');
var buffer = "";
var letter = "";
var visual_recognition = new VisualRecognitionV3({
  api_key: config.VisionKey,
  version_date: config.VisionVersion
});



var snapinterval = 6000 ; // take a picture every X milliseconds
var i = 0 ;
 setInterval(function () {
   launchVision()
 }, snapinterval);
//launchVision()
/**
* Process Images every X seconds
* @return {null} null
*/
function launchVision()
{
   
        var filename = 'photos/pic_'+i+'.jpg';
        //var args = ['-vf', '-hf','-w', '960', '-h', '720', '-o', filename, '-t', '1'];
        var args = ['-w', '960', '-h', '720', '-o', filename, '-t', '10'];
        var spawn = child_process.spawn('raspistill', args);

        spawn.on('exit', function(code) {
        console.log('A photo is saved as '+filename+ ' with exit code, ' + code);
        let timestamp = Date.now();
        processImage(filename)
        i++;
        });
}


/**
* [processImage send the given image file to Watson Vision Recognition for Analysis]
* @param  {[type]} imagefile [description]
* @return {[type]}           [description]
*/
function processImage(imagefile)
{
  	var params =
	 {
    		images_file: fs.createReadStream(imagefile),
    		classifier_ids: ["alphabet_15101076"]
  	};
    
  	visual_recognition.classify(params, function(err, res) 
	{
    		if (err)
		{
      			console.log(err);
    		} 
		else 
		{
			if(res.images[0].classifiers.length > 0)
			{
      				result = res.images[0].classifiers[0].classes
      				if(result !== null & result.length > 0)
				{
        				result.forEach(function(obj)
					{
          					console.log(obj.class)
          					switch(obj.class)
						{
							case 'H':
								buffer += "h";
                                                                console.log(buffer);
								letter = "h"
								speak(letter);
								break;
							case 'E':
								buffer += "e";
								console.log(buffer);
								letter = "e";
								speak(letter);
								break;
							case 'L':
								buffer += "l";
								console.log(buffer);
								letter = "l";
								speak(letter);
								break;
							case 'O':
								buffer += "o";
								console.log(buffer)
								letter = "o";
								speak(letter);
								break;
							default:
								speak(buffer);
								buffer = "";
						}
        				})

     				 }
			}
			else 
			{
                                console.log("I cannot understand that gesture. Please try again.");
        			var msg = "I cannot understand that gesture. Please try again.";
        			speak(msg);
     			 }
      
   		 }
 	 });
}

var Sound = require('node-aplay');
var music ;
var text_to_speech = watson.text_to_speech({
  username: config.TTSUsername,
  password: config.TTSPassword,
  version: 'v1'
});

function speak(textstring){
  var params = {
    text: textstring,
    voice: config.voice,
    accept: 'audio/wav'
  };
  text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav')).on('close', function() {
    // var create_audio = exec('ffplay -autoexit output.wav', function (error, stdout, stderr) { // if on mac
    music = new Sound("output.wav");
    music.play();
    music.on('complete', function () {
      console.log('Done with playback!');
    });
  });
}


function deleteFile(filepath) {
  fs.unlink(filepath, function(err) {
    if (err) {
       return console.error(err);
    }
    console.log(filepath + ' has been deleted.');
  });
}
