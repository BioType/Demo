    let pdf ;
    let canvas;
    let isPageRendering;
    let  pageRenderingQueue = null;
    let canvasContext;
    let totalPages;
    let currentPageNum = 1;
    let _scale = 1;

    // events
    /*
    window.addEventListener('load', function () {
        isPageRendering= false;
        pageRenderingQueue = null;
        canvas = document.getElementById('pdf_canvas');
        canvasContext = canvas.getContext('2d');

        initEvents();
        initPDFRenderer();
    });
    */

    function initEvents() {
        let prevPageBtn = document.getElementById('prev_page');
        let nextPageBtn = document.getElementById('next_page');
        //let goToPage = document.getElementById('go_to_page');
        prevPageBtn.addEventListener('click', renderPreviousPage);
        nextPageBtn.addEventListener('click',renderNextPage);
        //goToPage.addEventListener('click', goToPageNum);
    }

    // init when window is loaded
    function initPDFRenderer() {
      document.getElementById('downloadSignedPdf').disabled=true;
      document.getElementById('downloadSignedPdf').removeAttribute('href');
      document.getElementById('downloadSignedPdf').style.textDecoration = 'none';
      document.getElementById('downloadCert').disabled=true;
      document.getElementById('downloadCert').removeAttribute('href');
      document.getElementById('downloadCert').style.textDecoration = 'none';

      document.getElementById("privateKey").value = ''
      document.getElementById("publicKey").value = ''

      isPageRendering= false;
      pageRenderingQueue = null;
      canvas = document.getElementById('pdf_canvas');
      canvasContext = canvas.getContext('2d');
      currentPageNum = 1
      initEvents();

      var pdfDoc = document.getElementById('sign').files[0];
      var fileReader = new FileReader();
      fileReader.onload = async function(fileLoadedEvent) {
        var contents = fileReader.result;
        pdfjsLib.getDocument(contents).promise.then(pdfData => {
            totalPages = pdfData.numPages;
            let pagesCounter= document.getElementById('total_page_num');
            pagesCounter.textContent = totalPages;

            // assigning read pdfContent to global variable
            pdf = pdfData;
            //console.log(pdfData);
            renderPage(currentPageNum);
        });
      }
      fileReader.readAsArrayBuffer(pdfDoc);
    }

    function renderPage(pageNumToRender = 1, scale = 1) {
        isPageRendering = true;
        document.getElementById('current_page_num').textContent = pageNumToRender;
        pdf.getPage(pageNumToRender).then(page => {
            // original width of the pdf page at scale 1
            var pdf_original_width = page.getViewport(1).width;
            _scale = canvas.width / pdf_original_width;
            const viewport = page.getViewport({scale:_scale});
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            let renderCtx = {canvasContext ,viewport};
            page.render(renderCtx).promise.then(()=> {
                isPageRendering = false;
                if(pageRenderingQueue !== null) { // this is to check of there is next page to be rendered in the queue
                    renderPage(pageNumToRender);
                    pageRenderingQueue = null;
                }
            });
        });
    }

    function renderPageQueue(pageNum) {
        if(pageRenderingQueue != null) {
            pageRenderingQueue = pageNum;
        } else {
            renderPage(pageNum);
        }
    }

    function renderNextPage(ev) {
        if(currentPageNum >= totalPages) {
            //alert("This is the last page");
            return ;
        }
        currentPageNum++;
        renderPageQueue(currentPageNum);
    }

    function renderPreviousPage(ev) {
        if(currentPageNum<=1) {
            //alert("This is the first page");
            return ;
        }
        currentPageNum--;
        renderPageQueue(currentPageNum);
    }




  let coordinates = []
  let updateCoordinates = function () {
          let _str = coordinates.map((x) => Math.round(x)).join(",")
          //document.getElementById("coords").innerHTML = _str
  }

  function getCoordsAndScale(){
    updateCoordinates()
    var x = coordinates[0]
    var y = coordinates[1]
    return [x,y, _scale,currentPageNum]
  }
  window.onload =  function(){
          let pdfContainer = document.getElementById('canvas')

          pdfViewer = new pdfjsViewer.PDFViewer({
                  container : pdfContainer
          })
          pdfContainer.addEventListener('click', (evt) => {

                  var pg = document.getElementById('canvas')
                  var rect = pg.getBoundingClientRect()
                  var bodyElt = document.body;

                  let x = evt.pageX - rect.left - bodyElt .scrollLeft
                  let y = evt.pageY - rect.top -  bodyElt .scrollTop

                  coordinates[0]=x
                  coordinates[1]=y
                  updateCoordinates()
          })

  }
