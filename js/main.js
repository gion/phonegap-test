;(function(global, $, _, Backbone){
	var app = global.app || {};
	$(document).ready(function(){
		$.extend(app, {
			urls : {
		//		mainPath : 'http://bogdang.users.projects-directory.com/scoreace/demoApi.php'
				login : 'http://bogdang.users.projects-directory.com/scoreace/demoApi.php?method=login',
				getLeagues : 'http://bogdang.users.projects-directory.com/scoreace/demoApi.php?method=getLeagues',
				ranks : 'http://bogdang.users.projects-directory.com/scoreace/demoApi.php?method=ranks',
				getLeagueDetails : 'http://bogdang.users.projects-directory.com/scoreace/demoApi.php?method=getLeagueDetails',
			},


			initRouter : function(){
				app._router = Backbone.Router.extend({
					routes : {
					//	'' : 'login',
						"login" : 'login',
						'home'	: 'home',
						'league-:leagueId' : 'getLeagueDetails',
						'ranks' : 'ranks',
						'league-details' : 'what'
					},
					what : function(){
						alert(3);
						console.log(arguments);
					},
					login : function(){
						console.log('login');
						if(false && app.user)
							{
								app.navigate('home');
								app.changePage($('#home'));
							}
						else
							{
								app.navigate('login');
								app.changePage($('#login'));
							}
					},

					home : function(){
						console.log('home');
						app.pages.home.model.update();
					},

					ranks : function(){
						console.log('ranks');
						app.pages.ranks.model.update();
					},

					getLeagueDetails : function(leagueId){
						console.log('league Id : ', leagueId);

					//	app.changePage($('#league-details'));
					}
				});
				return this;
			},
			bindEventHandlers : function(){
				 $(document)
		            .on("click", "a:not([data-bypass])", function (evt) {
		                // Get the anchor href and protcol
		                var href = $(this).attr("href");
		                var protocol = this.protocol + "//";

		                // Ensure the protocol is not part of URL, meaning it's relative.
		                if (href && href.slice(0, protocol.length) !== protocol &&
		                    href.indexOf("javascript:") !== 0) {
		                    // Stop the default event to ensure the link will not cause a page
		                    // refresh.
		                    evt.preventDefault();

		                    // `Backbone.history.navigate` is sufficient for all Routers and will
		                    // trigger the correct events. The Router's internal `navigate` method
		                    // calls this anyways.
		                    app.navigate(href);
		                }
		            })

		            .on('pagebeforechange', function(e){
		            	console.log('pagebeforechange', arguments);
		            	/*e.preventDefault();
		            	e.stopPropagation();*/
		            })

		            // prevent jqm from listening to haschange events & stuff
		            .on("mobileinit", function () {
		                $.mobile.ajaxEnabled = false;
		                $.mobile.hashListeningEnabled = false;
		                $.mobile.pushStateEnabled = false;
		                $.mobile.linkBindingEnabled = false; //-- works properly with jqm 1.1.1 rc1

		                $.mobile.defaultDialogTransition = "none";
		                $.mobile.defaultPageTransition = "slide";
		                $.mobile.page.prototype.options.degradeInputs.date = true;
		                $.mobile.page.prototype.options.domCache = false;

		                //enable flag to disable rendering
		                $.mobile.ignoreContentEnabled=true;
		                // enable loading page+icon
		                $.mobile.loader.prototype.options.text = "loading";
		                $.mobile.loader.prototype.options.textVisible = false;
		                $.mobile.loader.prototype.options.theme = "a";
		                $.mobile.loader.prototype.options.html = "";


		                $.support.cors = true;
    					$.mobile.allowCrossDomainPages = true;
		            })
					.trigger('mobileinit')

					.on('vclick', '[data-rel="back"]', function(e){
						e.preventDefault();
						history.back();
					});



		            $('#login_form').on('submit', function(e){
		            	e.stopPropagation();
		            	e.preventDefault();

		            	$.mobile.loading('show');

		            	var credentials = {
		            		user : $('#login_user').val(),
		            		pass : $('#login_password').val()
		            	};

		            	$.ajax({
		            		url : app.urls.login,
		            		dataTypeString : 'JSON',
		            		type : 'post',
		            		data : credentials	            		
			            }).done(function(response){
		            		console.log('response', arguments);
		            		app.user = response.result;
		            		$.mobile.loading('hide');
		            		app.navigate('home');
		            	});
		            });

				return this;
			},
			changePageOptions : {
				transition : 'slide',
				reverse : false,
				changeHash : false
			},

			changePage : function(page, options){
				$.mobile.initializePage(page);
				var o = $.extend(app.changePageOptions, options);
			//	page.trigger("create");
				$.mobile.changePage(page, o, o.reverse, o.changeHash);
			//	page.trigger("pagecreate");
				return this;
			},
			
			navigate : function(page, options){
				app.router.navigate(page, $.extend(app.navigateOptions, options));
				return this;
			},

			navigateOptions : {
				replace : false,
				trigger : true
			},

			initPages : function(){

				app.pages = {
					home : {

						league : Backbone.Model.extend({
							defaults : {
								score : 0,
								rank : 0,
								template : _.template($('#league-template').html())
							},
							initialize : function(){
								this.view = new app.pages.home.leagueView({model : this});
							}
						}),

						leagueView : Backbone.View.extend({
							tagName : "li",
							className : 'ui-grid-b league league-prop',
							render : function(){
								return this.$el.html(this.model.get('template')(this.model.toJSON()));
							},
							events : {
								'vclick' : 'goToLeague'
							},
							goToLeague : function(e){
								e.preventDefault();
								e.stopPropagation();
								console.log('go to league', arguments);
								app.navigate('league-' + this.model.id);
							},
						}),

						leagues : Backbone.Collection.extend({


								url : app.urls.getLeagues,

								initialize : function(){
									this.model = app.pages.home.league;
									this.on('reorder', function(){
										app.pages.home.model.view.render();
									}, this);
								},

								parse: function(response) {
									console.log(response);
									return response.result;
								},

								sortBy : function(prop, descendent){
								/*	this.comparator = function(model){
										return model.get(prop);
									}

									this.sort();
									if(descendent)
										this.models = this.models.reverse();
									this.trigger('reorder');*/
								}
						}),

						_model : Backbone.Model.extend({
							initialize : function(){
								this.leagues = new app.pages.home.leagues();
							},

							
							update : function(){
								this.leagues.fetch({
									success : function(){
										app.pages.home.model.view.render();
									},
									error : function(){

									}
								});
							}
						}),

						_view : Backbone.View.extend({
							el : '#home',
						//	model : app.pages.home.model,
							initialize : function(){
								this.model.view = this;
							},
							events : {
								'click .leagues-wrapper>.list-header>div' : 'sortLeagues'
							},
							render : function(doNotChangePage){
								var leaguesContainer = this.$('.leagues').empty();
								this.model.leagues.each(function(el, i){
									leaguesContainer.append(el.view.render());
								});

								if(!doNotChangePage)
									app.changePage(this.$el);

								//$(this.el).trigger( "pagecreate" );
							},
							sortLeagues : function(e){
								this.model.leagues.sortBy($(e.target).attr('class').replace(/.*?\bleague-(.*?)\b.*?/,'$1'));
							}
						})
					}
				};


			

				$.extend((app.pages.ranks = {}),{
					_model : Backbone.Model.extend({
						initialize : function(){
							this.leagues = new app.pages.home.leagues();
							this.leagues.url = app.urls.ranks;
						},
						
						update : function(){
							var self = this;
							this.leagues.fetch({
								success : function(){
									self.view.render();
								},
								error : function(){

								}
							});
						}
					}),
					_view : app.pages.home._view.extend({
						el : '#ranks'
					})
				});


				$.each(app.pages, function(k, v){
					if(v._model)
						v.model = new v._model;
					if(v._view)
						v.view = new v._view({model:v.model});
				});

				return this;
			},

			init : function(){
				this
					.initPages()
					.initRouter()
					.bindEventHandlers();

				app.router = new app._router();

	

				Backbone.history.start({
					pushState : false,
					root : '/github/phonegap-test/'
				});


				return this;
			}
		});
		

		global.app = app;
	});
})(this, jQuery, _, Backbone)