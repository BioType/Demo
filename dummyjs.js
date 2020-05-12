//import {typingDnaClient} from 'typingdnaclient.js';
var TypingDnaClient = require('./typingdnaclient');
var TypingDNA = require('./typingdna');



var tdna;
var typingDnaClient = new TypingDnaClient('c87e1d0300aa010574347254b0189f5a', '52873510602e7b608bba3e2d0af696a3','api.typingdna.com');
var typingPatternMail;

$(document).ready(function(){
	tdna = new TypingDNA();
	tdna.addTarget("email");
	tdna.addTarget("password");
});

window.alertUserInput = function(){
  typingPatternMail = tdna.getTypingPattern({type: 2, targetId: "email"});
  typingPatternPassword = tdna.getTypingPattern({type: 2, targetId: "password"});
	//makeRequest();
	document.getElementById('emailpattern').value = typingPatternMail;
	document.getElementById('passwordpattern').value = typingPatternPassword;
}


function makeRequest(){
	typingDnaClient.check(
    { userId : '{testuser}',
      type: '2',
      device: 'desktop'
    },
    function(error, result) {
      if (error) { console.error(error) }
      console.log(result);
    });
}
