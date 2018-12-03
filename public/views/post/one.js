/**
 * SETUP
 **/
  var app = app || {};



/**
 * MODELS
 **/
  app.PostCreate = Backbone.Model.extend({
    id: undefined,
    url: function() {
      return '/1/post/' + this.attributes.id;
    },
    background: function() {
      return '/uploads/' + this.attributes.filename;
    },
    defaults: {
      success: false,
      errors: [],
      errfor: {},

      subject: '',
      content: '',
      filename: ''
    }
  });



/**
 * VIEWS
 **/
  app.PostCreateView = Backbone.View.extend({
    el: '#post',
    template: _.template( $('#tmpl-post').html() ),
    events: {
    },
    initialize: function() {
      this.model = new app.PostCreate();
      this.listenTo(this.model, 'sync', this.render);
      //this.listenTo(this.model, 'change', this.render);
      this.fetchData();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
      $('.background').css('background-image', 'url(' + this.model.background() + ')');
    },
    fetchData: function() {
      var id = this.$el.data('post-id')
        , self = this;
      
      this.model.set('id', id);
      this.model.fetch({
        success: function(model, response, options) {
          self.model.set('subject', response.data.subject);
          self.model.set('content', response.data.content);
          self.model.set('filename', response.data.filename);
        }
      });
    }
  });

/**
 * BOOTUP
 **/
  $(document).ready(function() {
    app.PostCreateView = new app.PostCreateView();
  });

