!(function (dozmia, Masonry) {
  "use strict";

  dozmia.HomeView = dozmia.BaseView.extend({
    html: function () {
      return "<div class=\"dozmia-album-art-wall\">"+this._generateRandomArtMarkup()+"</div>";
    },
    afterRender: function () {
      var msnry, $artWall;
      $artWall = this.$(".dozmia-album-art-wall");

      msnry = new Masonry($artWall[0], {
        columnWidth: 45,
        itemSelector: ".dozmia-album-art"
      });
    },
    _generateRandomArtMarkup: function () {
      return dozmia.u.times(500, function () {
        var size;
        size = dozmia.u.random(1);
        if(size === 0) {
          return "<div class=\"dozmia-album-art\"></div>";
        } else {
          return "<div class=\"dozmia-album-art dozmia-album-art--half\"></div>";
        }
      }).join("");
    }
  });

})(this.dozmia, this.Masonry);
