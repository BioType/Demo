
function createCertificate(pdfArrayBuffer,imageArrayBuffer){
  var caPair = forge.pki.rsa.generateKeyPair(2048);
  var pair = forge.pki.rsa.generateKeyPair(2048);

  var pemPrivateKey = forge.pki.privateKeyToPem(pair.privateKey);
  var pemPublicKey = forge.pki.publicKeyToPem(pair.publicKey);

  document.getElementById("privateKey").value = pemPrivateKey
  document.getElementById("publicKey").value = pemPublicKey

  var name = document.getElementById("usrname").value;
  var family = document.getElementById("family").value;


  console.log('Creating self-signed certificate...');
  var cert = forge.pki.createCertificate();
  cert.publicKey = pair.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  cert.signatureOid = "1.2.840.113549.1.1.11";
  console.log(cert.md)

  var attrsSubject = [{
    name: 'commonName',
    value: name +' ' + family
  }, {
    name: 'countryName',
    value: 'US'
  }, {
    shortName: 'ST',
    value: ''
  }, {
    name: 'localityName',
    value: 'New York'
  }, {
    name: 'organizationName',
    value: 'organization'
  }, {
    shortName: 'OU',
    value: ' '
  }];
  var attrsIssuer = [{
    name: 'commonName',
    value: 'Biotype.co'
  }, {
    name: 'countryName',
    value: 'US'
  }, {
    shortName: 'ST',
    value: 'Virginia'
  }, {
    name: 'localityName',
    value: 'Blacksburg'
  }, {
    name: 'organizationName',
    value: 'Biotype'
  }, {
    shortName: 'OU',
    value: 'Biotype'
  }];
  cert.setSubject(attrsSubject);
  cert.setIssuer(attrsIssuer);
  cert.setExtensions([{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 6, // URI
      value: 'http://biotype.co'
    }]
  }]);

  cert.sign(caPair.privateKey,forge.md.sha256.create());
  console.log('Certificate created.');


  // create PKCS12
  console.log('\nCreating PKCS#12...');
  var password = 'password';
  var newPkcs12Asn1 = forge.pkcs12.toPkcs12Asn1(
    pair.privateKey, [cert], password,
    {algorithm: '3des', generateLocalKeyId: true, friendlyName: 'test'});
  var newPkcs12Der = forge.asn1.toDer(newPkcs12Asn1).getBytes();

  var a = document.getElementById('downloadCert');
  a.download = 'certificate.p12';
  a.href = 'data:application/x-pkcs12;base64,' + forge.util.encode64(newPkcs12Der)

  var certArrayBuffer = base64StringToArrayBuffer(forge.util.encode64(newPkcs12Der))

  signPDF(pdfArrayBuffer,certArrayBuffer,imageArrayBuffer)

}

function loadPkcs12(pkcs12Der, password, caStore) {
  var pkcs12Asn1 = forge.asn1.fromDer(pkcs12Der);
  var pkcs12 = forge.pkcs12.pkcs12FromAsn1(pkcs12Asn1, false, password);

  // load keypair and cert chain from safe content(s) and map to key ID
  var map = {};
  for(var sci = 0; sci < pkcs12.safeContents.length; ++sci) {
    var safeContents = pkcs12.safeContents[sci];
    console.log('safeContents ' + (sci + 1));

    for(var sbi = 0; sbi < safeContents.safeBags.length; ++sbi) {
      var safeBag = safeContents.safeBags[sbi];
      console.log('safeBag.type: ' + safeBag.type);

      var localKeyId = null;
      if(safeBag.attributes.localKeyId) {
        localKeyId = forge.util.bytesToHex(
          safeBag.attributes.localKeyId[0]);
        console.log('localKeyId: ' + localKeyId);
        if(!(localKeyId in map)) {
          map[localKeyId] = {
            privateKey: null,
            certChain: []
          };
        }
      }
      else {
        // no local key ID, skip bag
        continue;
      }

      // this bag has a private key
      if(safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
        console.log('found private key');
        map[localKeyId].privateKey = safeBag.key;
      }
      // this bag has a certificate
      else if(safeBag.type === forge.pki.oids.certBag) {
        console.log('found certificate');
        map[localKeyId].certChain.push(safeBag.cert);
      }
    }
  }

  console.log('\nPKCS#12 Info:');

  for(var localKeyId in map) {
    var entry = map[localKeyId];
    console.log('\nLocal Key ID: ' + localKeyId);
    if(entry.privateKey) {
      var privateKeyP12Pem = forge.pki.privateKeyToPem(entry.privateKey);
      var encryptedPrivateKeyP12Pem = forge.pki.encryptRsaPrivateKey(
        entry.privateKey, password);

      console.log('\nPrivate Key:');
      console.log(privateKeyP12Pem);
      console.log('Encrypted Private Key (password: "' + password + '"):');
      console.log(encryptedPrivateKeyP12Pem);
    }
    else {
      console.log('');
    }
    if(entry.certChain.length > 0) {
      console.log('Certificate chain:');
      var certChain = entry.certChain;
      for(var i = 0; i < certChain.length; ++i) {
        var certP12Pem = forge.pki.certificateToPem(certChain[i]);
        console.log(certP12Pem);
      }

      var chainVerified = false;
      try {
        chainVerified = forge.pki.verifyCertificateChain(caStore, certChain);
      }
      catch(ex) {
        chainVerified = ex;
      }
      console.log('Certificate chain verified: ', chainVerified);
    }
  }
}
