function ID3Reader(file_el) {
  var self = this;
  self.init(file_el);
};

ID3Reader.prototype = {
  SUCCESS: 1,
  FAILURE: 2,
  status: 0,
  onload: null,
  file_reader: null,
  result: null,
  worker: null,
  
  
  
  init: function(el) {
    var self = this;
    el.onchange = function(e) {
      self.input_onchange(e);
    };
  },
  
  input_onchange: function(e) {
    var self = this;
    var input_el = e.target;
    if(input_el.tagName != "INPUT") {
      console.log("ID3Reader bound to non-input element.");
      return;
    }
    if(input_el.type != "file") {
      console.log("ID3Reader bound to non-file type input element");
      return;
    }
    var files = input_el.files;
    if(typeof files != "undefined" && files[0] instanceof File && files[0].type.match(/audio\/.*/)) {
      if(!self.worker) {
        self.worker = new Worker('ID3Reader_worker.js');
        self.worker.onmessage = function(evt) {
          if(self.onload != null) {
            self.onload.call(self, evt.data);
          }
        };
      }
      self.worker.postMessage(files[0]);
    }
  },
  
};