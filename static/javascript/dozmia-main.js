this.dozmia = {};

!(function (dozmia, Backbone, $, _, Handlebars) {
  "use strict";

  dozmia.u = _;

  dozmia.u.ajax = Backbone.ajax;

  dozmia.log = {
    error: function () {
      var args = Array.prototype.slice.call(arguments);
      window.console.error.apply(window.console, args);
      throw new Error(args.join(" "));
    }
  };

  dozmia.ResourceManager = function (opts) {
    this.factory = opts.factory;
    this.resources = {};
  };

  dozmia.ResourceManager.prototype.request = function (basename, options) {
    var name = this._getName(basename, options);
    if(this.resources[name] == null) {
      this.resources[name] = this.factory[basename].call(this, options);
    }

    return this.resources[name];
  };
  dozmia.ResourceManager.prototype._getName = function (basename, options) {
    return basename + JSON.stringify(options);
  };

  dozmia.rman = new dozmia.ResourceManager({
    factory: {
      "home-view": function (options) {
        var defaults;
        options = options || {};
        defaults = {
          playerModel: dozmia.player,
          el: "#dozmia-container",
          children: {
            "#dozmia-album-art-wall-container": new dozmia.AlbumArtWallView(),
            "#dozmia-player": new dozmia.PlayerView()
          }
        };
        return new dozmia.HomeView(_.defaults(options, defaults));
      },
      "master-view": function () {
        var view;
        view = new dozmia.MasterView({
          el: "#dozmia-container",
          children: {
            "#dozmia-player": new dozmia.PlayerView()
          }
        });
        return view;
      },
      "modal-view": function () {
        var view;
        view = new dozmia.ModalView({
          el: "#modal-container"
        });
        return view;
      }
    }
  });

  dozmia.player = new (Backbone.Model.extend({
    defaults: {
      playingSong: false
    },
    playSong: function (songInfo) {
      this.set("playingSong", songInfo);
      this.trigger("start", songInfo);
    }
  }))();

  dozmia.MainRouter = Backbone.Router.extend({
    routes: {
      "(/)": "home",
      ":page?modal=:modal": "modalOverlay",
      "home": "home",
      "signup": "homeSignUp",
      "thanks": "homeSignUpThanks",
      "login": "homeLogin",
      ":page(/)": "otherPage"
    },
    home: function () {
      var options;
      dozmia.rman.request("master-view").showPage(null);
      dozmia.rman.request("modal-view").$el.hide();
      options = {
        dialogOptions: {
          wideVersion: true 
        }
      };
      dozmia.rman.request("home-view", options).transitionOut(function () {
        this.assignChild(new dozmia.SearchSignUpLoginView(), "#dozmia-cta-container");
        this.render();
      });
    },
    homeSignUp: function () {
      var options;
      dozmia.rman.request("modal-view").$el.hide();
      options = {
        showHeader: true,
        submitHRef: "#thanks"
      };
      dozmia.rman.request("home-view", options).transitionOut(function () {
        this.assignChild(new dozmia.SignUpView(options), "#dozmia-cta-container");
        this.render();
      });
    },
    homeSignUpThanks: function () {
      dozmia.rman.request("modal-view").$el.hide();
      dozmia.rman.request("home-view").transitionOut(function () {
        this.assignChild(new dozmia.HomeSignUpThanksView(), "#dozmia-cta-container");
        this.render();
      });
    },
    homeLogin: function () {
      dozmia.rman.request("modal-view").$el.hide();
      dozmia.rman.request("home-view").transitionOut(function () {
        this.assignChild(new dozmia.LoginView(), "#dozmia-cta-container");
        this.render();
      });
    },
    modalOverlay: function (pageName, modalName) {
      var contentView, modalView;

      switch(modalName) {
        case "sign-up":
          contentView = new dozmia.SignUpView({submitHRef: "#"});
          break;
        case "login":
          contentView = new dozmia.LoginView();
          break;
      }

      dozmia.rman.request("master-view").showPage(pageName);
      modalView = dozmia.rman.request("modal-view").render();

      if(contentView == null) {
        dozmia.log.error("The requested modal does not exist.");
      } else {
        modalView.assignChild(contentView, "#modal-content-container");
      }

      modalView.render().$el.show();
    },
    otherPage: function (pageName) {
      dozmia.rman.request("master-view").showPage(pageName);
      dozmia.rman.request("modal-view").$el.hide();
    }
  });

  dozmia.BaseView = Backbone.View.extend({
    _super: function (method) {
      var args = Array.prototype.slice.call(arguments, 1);
      return this.constructor.__super__[method].apply(this, args);
    },
    initialize: function (options) {
      options = options || {};
      this.children = options.children || {}; 
    },
    render: function () {
      this.$el.html(this.html());
      _.each(this.children, this.assignChild, this);
      if(typeof this.afterRender === "function") {
        this.afterRender.apply(this, arguments);
      }
      return this;
    },
    html: function () {
      var source, template, data;
      source = $("#"+this.template+"-template").html();
      template = Handlebars.compile(source);
      if(typeof this.templateData == "function") {
        data = this.templateData();
      } else {
        data = this.templateData || {};
      }
      return template(data);
    },
    assignChild: function (view, selector) {
      // NOTE: if the app is going to be regularly adding and removing views to the DOM
      // you may want to help prevent memory leaks by cleaning up the resources of child
      // views when a view is removed.
      if(this.children[selector] != null) {
        this.children[selector].remove();
        this.children[selector] = null;
      }
      view.setElement(this.$(selector)).render();
      this.children[selector] = this.children[selector] || view;
      return this;
    }
  });

  dozmia.overflowScollFix = function () {
    // Make `overflow: scroll` work how it ought to.
    $(".u-overflow-scroll").each(function () {
      if($(this).children().height() > $(this).height()) {
        $(this).attr("style", "overflow-y: scroll !important");
      } else {
        $(this).attr("style", "overflow-y: hidden !important");
      }
    });
  };

  $(function () {
    new dozmia.MainRouter();

    Backbone.history.start();

    $(window).resize(function () {
      $(".js-smart-scroll-object").each(function () {
        if($(window).innerHeight() < $(this).height()) {
          $("html").css("overflow-y", "scroll");
        } else {
          $("html").css("overflow-y", "hidden");
        }
      });

      dozmia.overflowScollFix();
    });

  });

})(this.dozmia, this.Backbone, this.$, this._, this.Handlebars);
