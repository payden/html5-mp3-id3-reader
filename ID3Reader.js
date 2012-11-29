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
  field_offsets: {
    title: 125,
    artist: 95,
    album: 65,
    year: 35,
    comment: 31,
    zero: 3,
    track: 2,
    genre: 1    
  },
  
  genres: [
           "Blues", "Classic Rock", "Country", "Dance", "Disco", "Funk", "Grunge", "Hip-Hop", "Jazz", "Metal", "New Age",
           "Oldies", "Other", "Pop", "R&B", "Rap", "Reggae", "Rock", "Techno", "Industrial", "Alternative", "Ska",
           "Death Metal", "Pranks", "Soundtrack", "Euro-Techno", "Ambient", "Trip-Hop", "Vocal", "Jazz+Funk", "Fusion",
           "Trance", "Classical", "Instrumental", "Acid", "House", "Game", "Sound Clip", "Gospel", "Noise", "AlternRock",
           "Bass", "Soul", "Punk", "Space", "Meditative", "Instrumental Pop", "Instrumental Rock", "Ethnic", "Gothic",
           "Darkwave", "Techno-Industrial", "Electronic", "Pop-Folk", "Eurodance", "Dream", "Southern Rock", "Comedy",
           "Cult", "Gangsta", "Top 40", "Christian Rap", "Pop/Funk", "Jungle", "Native American", "Cabaret", "New Wave",
           "Psychadelic", "Rave", "Showtunes", "Trailer", "Lo-Fi", "Tribal", "Acid Punk", "Acid Jazz", "Polka", "Retro",
           "Musical", "Rock & Roll", "Hard Rock"
           ],
  
  
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
    if(typeof files != "undefined" && files[0] instanceof File && files[0].type == "audio/mp3") {
      self.file_reader = new FileReader();
      self.file_reader.onloadend = function(evt) {
        self.filereader_onloadend(evt);
      };
      self.file_reader.readAsArrayBuffer(files[0]);
    }
  },
  
  filereader_onloadend: function(e) {
    var self = this;
    var fr = e.target;
    var result = fr.result;
    var dv = new DataView(result);
    self.result = result;
    if(String.fromCharCode(dv.getUint8(result.byteLength - 128)) != "T" || String.fromCharCode(dv.getUint8(result.byteLength - 127)) != "A" ||
        String.fromCharCode(dv.getUint8(result.byteLength - 126)) != "G") {
      console.log("Unable to locate ID3v1 information");
      return;
    }
    var title = self._read_null_terminated(dv, result.byteLength - self.field_offsets.title, 30);
    var artist = self._read_null_terminated(dv, result.byteLength - self.field_offsets.artist, 30);
    var album = self._read_null_terminated(dv, result.byteLength - self.field_offsets.album, 30);
    var year = self._read_null_terminated(dv, result.byteLength - self.field_offsets.year, 4);
    var track = null;
    var comment = null;
    if(dv.getUint8(result.byteLength - self.field_offsets.zero) == 0) {
      track = dv.getUint8(result.byteLength - self.field_offsets.track);
      comment = self._read_null_terminated(dv, result.byteLength - self.field_offsets.comment, 28);
    } else {
      comment = self._read_null_terminated(dv, result.byteLength - self.field_offsets.comment, 30);
    }
    var genre = dv.getUint8(result.byteLength - self.field_offsets.genre);
    var tag = {
      title: title.trim(),
      artist: artist.trim(),
      album: album.trim(),
      year: year,
      track: track,
      comment: comment.trim(),
      genre: self.genres[genre]
    };
    if(self.onload != null) {
      self.onload.call(self, tag);
    }
    
    self.file_reader = null;
    
    
  },
  
  _read_null_terminated: function(dv, offset, max) {
    var str = "";
    var code;
    while((code = dv.getUint8(offset++)) != 0 && max--) {
      str += String.fromCharCode(code);
    }
    return str;
  }
  
};