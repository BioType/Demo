var signer = require('pdf-signer')
const helpers = require('node-signpdf/dist/helpers')


window.signPDF = function(pdfArrayBuffer,certArrayBuffer){
            var certBuffer = toBuffer(certArrayBuffer)
            var pdfBuffer = toBuffer(pdfArrayBuffer)
            //console.log("pdfBuffer:")
            //console.log(pdfBuffer)
            //console.log("certBuffer: ")
            //console.log(certBuffer)
            //var pdfBuffer2 = helpers.plainAddPlaceholder({
            //  pdfBuffer,
            //  reason: 'I have reviewed it.',
            //  signatureLength: 1612,
            //})
            var [x0,y0,canvas_scale, current_page] = getCoordsAndScale()

            if( (typeof x0) != 'number' || (typeof y0) != 'number'){
              x0 = 100*canvas_scale
              y0=600*canvas_scale
            }

            const height = 100
            const width = 200
            var signedPDF = signer.sign(pdfBuffer2,certBuffer,'password',{
                reason: '2',
                email: '',
                location: 'Location, LO',
                signerName: 'Test User',
                annotationAppearanceOptions: {
                  signatureCoordinates: { left: x0/canvas_scale, bottom: y0/canvas_scale, right: x0/canvas_scale+width, top: y0/canvas_scale+height },
                  signatureDetails: [
                    {
                      value: 'Signed by: Biotype',
                      fontSize: 7,
                      transformOptions: { rotate: 0, space: 1, tilt: 0, xPos: 20, yPos: 20 },
                    },
                    {
                      value: 'Date: 2020-07-01',
                      fontSize: 7,
                      transformOptions: { rotate: 0, space: 1, tilt: 0, xPos: 20, yPos: 30 },
                    },
                  ],
                },
              })

            //console.log("This is the signedPDF)
            //console.log(signedPDF)
            var pdfArrayBuffer = toArrayBuffer(signedPDF)
            saveByteArray('signed-document.pdf', pdfArrayBuffer, 'downloadSignedPdf')
          }

function toBuffer(ab) {
    var buf = Buffer.alloc(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

function saveByteArray(reportName, byte,  element) {
    var blob = new Blob([byte], {type: "application/pdf"});
    var link = document.getElementById(element);
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
};
