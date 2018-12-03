/**
 * SETUP
 **/
  var app = app || {};



/**
 * MODELS
 **/
  app.PostCreate = Backbone.Model.extend({
    url: function() {
      return '/1/post';
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
        'submit form': 'preventSubmit',
        'click button[data-toggle=save-post]': 'save',
        'click .btn-file': 'initPreview'
    },
    initialize: function() {
      this.model = new app.PostCreate();
      this.listenTo(this.model, 'sync', this.render);
      //this.listenTo(this.model, 'change', this.render);
      this.render();
      //this.fetchData();
      this.initUploader();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    initPreview: function() {
      var preview =  this.$el.find('.fileinput-preview');
      
      preview.removeClass('hide');
    },
    initUploader: function () {
      var self = this;

      self.$el.find('#step2').addClass('hide');
      self.$el.find('#step1').removeClass('hide');

      $("button[data-toggle='upload-photo']").on('click', function() {
        var nickname = $(this).data('nickname');
        var data = new FormData();

        data.append('file', $('#photo-upload')[0].files[0]);

        $.ajax({
          url: '/1/upload/photo',
          data: data,
          cache: false,
          contentType: false,
          processData: false,
          type: 'POST',
          xhr: function() {
            var xhr = jQuery.ajaxSettings.xhr()
                , percentComplete
                , progress = self.$el.find('.progress')
                , me = self.$el.find('.progress-bar[role="progressbar"]');

            progress.removeClass('hide');

            if (xhr.upload) {
                xhr.upload.addEventListener('progress', function (evt) {
                  if (evt.lengthComputable) {  
                    percentComplete = Math.round(evt.loaded / evt.total * 100);

                    me.css('width', percentComplete + '%')
                    me.text(percentComplete + '%');
                  }
                }, false);
            }

            return xhr;
          },
          success: function (data, textStatus, jqXHR) {
            $('.background').css('background-image', 'url(/uploads/' + data.filename + ')');

            // Filename is at data.filename
            //console.log('Filename: ' + data.filename);
            self.model.set('filename', data.filename);

            // next step
            self.$el.find('#step2').removeClass('hide');
            self.$el.find('#step1').addClass('hide');
          },
          complete: function (data, textStatus, jqXHR) {
          }
        });
      });
    },
    fetchData: function() {
      var id = this.$el.find('[name="id"]').val()
        , self = this;

      if (id !== '') {
	      $.ajax({
	        url: '/1/post/' + id,
	        type: 'GET',
	        dataType: "json",
	        success: function (data, textStatus, jqXHR) {
	        	if (data.success !== true) return;

            self.model.set('post', data.post);
            self.$el.find('[name="content"]').val(data.post.content);
	        },
	        complete: function (data, textStatus, jqXHR) {
		        $.notify('正在修改一篇文章', { position: 'bottom right', className: 'info' });
	        }
	      });
      }
    },
    save: function() {
        this.$el.find('button[data-toggle=save-post]').removeClass('btn-warning').addClass('disabled').text('Saving ...');

        // always not new
        var id = this.$el.find('[name="id"]').val()
          , subject = this.$el.find('[name="subject"]').val()
          , content = this.$el.find('[name="content"]').val()

        // must use this style when handling errors with underscore template
        this.model.save({
          subject: subject,
          content: content
        });  // no 'id': POST (create a new post)
    }
  });

/**
 * BOOTUP
 **/
  $(document).ready(function() {
    app.PostCreateView = new app.PostCreateView();
  });

