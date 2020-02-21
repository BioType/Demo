var tdna;
$(document).ready(function(){
	tdna = new TypingDNA()
	TypingDNA.addTarget("email")
	TypingDNA.addTarget("password")
});
function alertUserInput(){
	var typingPattern = tdna.getTypingPattern({type:2})
	//makeRequest();
	console.log(typingPattern)
	alert(typingPattern)
}
function makeRequest(){
	var https = require('https')

	var base_url = 'api.typingdna.com'
	var apiKey = '{cb83500f32d54ac7eb7e53fef86c7992}'
	var apiSecret = '{13c4ae3564ebe3963ed35ba815ac0896}'
	var id = '{testuser}'
	var options = {
	   hostname : base_url,
	   port : 443,
	   path : '/user/' + id,
	   method : 'GET',
	   headers: {
	       'Cache-Control': 'no-cache',
	       'Authorization': 'Basic ' + new Buffer(apiKey + ':' + apiSecret).toString('base64'),
	   },
	}

	var responseData = ''
	var req = https.request(options, function(res) {
	   res.on('data', function(chunk) {
	       responseData += chunk;
	   })

	   res.on('end', function() {
	       console.log(JSON.parse(responseData));
	   })
	})

	req.on('error', function(e) {
	   console.error(e);
	})

	req.end()
}