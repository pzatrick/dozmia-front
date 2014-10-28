!(function (dozmia, Masonry) {
  "use strict";

  dozmia.AlbumArtWallView = dozmia.BaseView.extend({
    initialize: function () {
      this.totalWidth = window.screen.width || 1920;
      this.totalHeight = window.screen.height || 1080;
      this.nTiles = 40;
      this.tileWidth = Math.sqrt((this.totalWidth * this.totalHeight) / this.nTiles) / 1.5;
    },
    events: {
      "click .js-album": function () {
         
      }
    },
    html: function () {
      return "<div class=\"dozmia-album-art-wall\">"+this._generateRandomArtMarkup()+"</div>";
    },
    afterRender: function () {
      var msnry, $artWall;
      $artWall = this.$(".dozmia-album-art-wall");

      $artWall
        .width(this.totalWidth)
        .height(this.totalHeight);
      $(".dozmia-album-art:not(.dozmia-album-art--half)")
        .width(this.tileWidth * 2)
        .height(this.tileWidth * 2);
      $(".dozmia-album-art.dozmia-album-art--half")
        .width(this.tileWidth)
        .height(this.tileWidth);
      msnry = new Masonry($artWall[0], {
        columnWidth: this.tileWidth,
        itemSelector: ".dozmia-album-art"
      });

      this.$(".js-album").each(function () {
        $(this).append("<div><article><h6><a href=\"#album-details\">Premiere Ballade</a></h6>"+
                       "<aside><a href=\"#artist-details\">Chopin</a></aside></article>"+
                       "<button class=\"u-normalize js-play-album\">&gt;</button></div>");
      });
    },
    _generateRandomArtMarkup: function () {
      var layout = dozmia.u.random(1);
      return dozmia.u.times(this.nTiles, function (index) {
        var size;
        size = (index + layout) % 2;
        if(size === 0) {
          return "<div class=\"dozmia-album-art js-album\"></div>";
        } else {
          return "<div class=\"dozmia-album-art dozmia-album-art--half js-album\"></div>"+
                 "<div class=\"dozmia-album-art dozmia-album-art--half js-album\"></div>"+
                 "<div class=\"dozmia-album-art dozmia-album-art--half js-album\"></div>";
        }
      }).join("");
    }
  });

})(this.dozmia, this.Masonry);