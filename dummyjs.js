import {typingDnaClient} from 'typingdnaclient.js';

var tdna;
var typingDnaClient = new TypingDnaClient('cb83500f32d54ac7eb7e53fef86c7992', '13c4ae3564ebe3963ed35ba815ac0896');
var typingPatternMail;

$(document).ready(function(){
	tdna = new TypingDNA();
	TypingDNA.addTarget("email");
	TypingDNA.addTarget("password");
});

function alertUserInput(){
	typingPatternMail = tdna.getTypingPattern({type: 2});
	makeRequest();
	console.log(typingPattern);
	alert(typingPattern);
}

function makeRequest(){
	typingDnaClient.check(
    { userId : typingPatternMail,
      type: '2',
      device: 'desktop'
    },
    function(error, result) {
      if (error) { console.error(error) }
      console.log(result);
    });
}