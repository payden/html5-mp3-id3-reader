var field_offsets = {
  tag: 128,
  title: 125,
  artist: 95,
  album: 65,
  year: 35,
  comment: 31,
  zero: 3,
  track: 2,
  genre: 1    
};

var genres = [
              "Blues", "Classic Rock", "Country", "Dance", "Disco", "Funk", "Grunge", "Hip-Hop", "Jazz", "Metal", "New Age",
              "Oldies", "Other", "Pop", "R&B", "Rap", "Reggae", "Rock", "Techno", "Industrial", "Alternative", "Ska",
              "Death Metal", "Pranks", "Soundtrack", "Euro-Techno", "Ambient", "Trip-Hop", "Vocal", "Jazz+Funk", "Fusion",
              "Trance", "Classical", "Instrumental", "Acid", "House", "Game", "Sound Clip", "Gospel", "Noise", "AlternRock",
              "Bass", "Soul", "Punk", "Space", "Meditative", "Instrumental Pop", "Instrumental Rock", "Ethnic", "Gothic",
              "Darkwave", "Techno-Industrial", "Electronic", "Pop-Folk", "Eurodance", "Dream", "Southern Rock", "Comedy",
              "Cult", "Gangsta", "Top 40", "Christian Rap", "Pop/Funk", "Jungle", "Native American", "Cabaret", "New Wave",
              "Psychadelic", "Rave", "Showtunes", "Trailer", "Lo-Fi", "Tribal", "Acid Punk", "Acid Jazz", "Polka", "Retro",
              "Musical", "Rock & Roll", "Hard Rock"
              ];

function _read_null_terminated(dv, offset, max) {
  var str = "";
  var code;
  while((code = dv.getUint8(offset++)) != 0 && max--) {
    str += String.fromCharCode(code);
  }
  return str;
}

self.onmessage = function(evt) {
  var fr = new FileReaderSync();
  var result = fr.readAsArrayBuffer(evt.data);
  var dv = new DataView(result);

  if(_read_null_terminated(dv, result.byteLength - field_offsets.tag, 3) != "TAG") {
    self.postMessage('wtf mate');
    return;
  }
  var title = _read_null_terminated(dv, result.byteLength - field_offsets.title, 30);
  var artist = _read_null_terminated(dv, result.byteLength - field_offsets.artist, 30);
  var album = _read_null_terminated(dv, result.byteLength - field_offsets.album, 30);
  var year = _read_null_terminated(dv, result.byteLength - field_offsets.year, 4);
  var track = null;
  var comment = null;
  if(dv.getUint8(result.byteLength - field_offsets.zero) == 0) {
    track = dv.getUint8(result.byteLength - field_offsets.track);
    comment = _read_null_terminated(dv, result.byteLength - field_offsets.comment, 28);
  } else {
    comment = _read_null_terminated(dv, result.byteLength - field_offsets.comment, 30);
  }
  var genre = dv.getUint8(result.byteLength - field_offsets.genre);
  var tag = {
    title: title.trim(),
    artist: artist.trim(),
    album: album.trim(),
    year: year,
    track: track,
    comment: comment.trim(),
    genre: self.genres[genre]
  };
  
  self.postMessage(tag);
}