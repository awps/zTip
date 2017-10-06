;(function( $ ) {

	"use strict";

	$.fn.zTip = function( options ) {

		if (this.length > 1){
			this.each(function() {
				$(this).zTip(options);
			});
			return this;
		}

		/* Setup options
		---------------------*/
		var settings = $.extend({
			// Theme
			theme: 'default',

			// TODO
			source: 'attr:title',

			// Tooltip positon relative to element
			position: 'top',

		}, options );

		// Is this instance
		var plugin = this;

		// Is the tooltip hidden at the end of body
		var holder;

		// Get data-* attributes
		$.each(settings, function( option ) {
			var data_attr = option.replace(/([A-Z])/g, '-$1').toLowerCase().toString(), //`optionsName` becomes `option-name`
			new_val       =  plugin.data( data_attr );

			if( new_val || false === new_val ){
				settings[ option ] = new_val;
			}
		});

		// Constructor
		var init = function() {
			plugin.firstInit();
			plugin.build();
		};

		this.firstInit = function(){
			// Create the holder that will be used later to display the tooltip
			if( $('body').find('.ztip-holder').length < 1 ){
				var spans = '<span class="zt-text"></span><span class="zt-arrow"></span>';
				$('body').append('<div class="ztip-holder ztip-position-top">'+ spans +'</div>');
			}

			holder = $('body').find('.ztip-holder');
		};

		this.build = function(){
			plugin.on( 'mouseover', function() {
				var elem = $(this),
				tip      = plugin.getElemTip( elem );

				if( ! tip ) {
					return;
				}

				// Refresh holder theme if needed...
				plugin.refreshHolderTheme();

				// Add the new tooltip text to holder
				holder.children('.zt-text').html( tip );

				var coords = plugin.getElementCoordinates( elem );

				// If the target elem is larger than the holder, allow the max-width to be equal to it
				if( holder.outerWidth() < coords.width ) {
					holder.css({
						'max-width': coords.width + 'px',
					});
				}

				// TODO: Improve this switch. DRY
				switch ( settings.position ) {
					case 'right':
						plugin.displayRight( coords );
						break;

					case 'bottom':
						console.log( holder.outerHeight() + 10 );
						console.log( coords.fromBottom );
						if( holder.outerHeight() + 10 > coords.fromBottom ) {
							plugin.displayTop( coords );
						}
						else{
							plugin.displayBottom( coords );
						}
						break;

					case 'left':
						if( holder.outerWidth() + 10 > coords.left ) {
							plugin.displayRight( coords );
						}
						else{
							plugin.displayLeft( coords );
						}
						break;

					case 'top-right':
						plugin.displayTopRight( coords );
						break;

					case 'bottom-right':
						plugin.displayBottomRight( coords );
						break;

					case 'top-left':
						plugin.displayTopLeft( coords );
						break;

					case 'bottom-left':
						plugin.displayBottomLeft( coords );
						break;

					default:
						if( holder.outerHeight() + 10 > coords.top ) {
							plugin.displayBottom( coords );
						}
						else{
							plugin.displayTop( coords );
						}
						break;
				}

				holder.addClass('ztip-show');
				console.log( coords );
			} );

			// When the mouse leaves the container
			plugin.on( 'mouseout', function() {
				if( holder ) {
					holder.removeClass('ztip-show').css({
						'top': 0,
						'right': '',
						'bottom': '',
						'left': '-110%',
						'max-width': '',
					});
				}
			} );

			// When the window is modified
			$(window).on( 'scroll resize', function() {
				if( holder ) {
					holder.removeClass('ztip-show');
				}
			} );
		};

		this.getElemTip = function( elem ){
			// No misleading title buble. The tooltip acts like a replacer for title tag,
			// and even if the source is not the title tag, we must disabe it so only one
			// tip is displayed and that should be ours.
			var _old_title = elem.attr('title');

			if( _old_title ) {
				elem.attr('data-ztip-title', _old_title ).removeAttr('title');
			}

			// It's a callback
			if( typeof settings.source === "function" ) {
				return settings.source.call(this, elem);
			}

			// The source is the title attribute
			else if( plugin.stringStartsWith( settings.source, 'attr:title' ) ){
				return elem.attr('data-ztip-title');
			}

			// The source is another attribute
			else if(plugin.stringStartsWith( settings.source, 'attr:' )) {
				return elem.attr( settings.source.replace( 'attr:', '' ) );
			}

			// The is a child of this element
			else if(plugin.stringStartsWith( settings.source, '>' )) {
				return elem.children( settings.source.replace( '>', '' ) ).html();
			}

			// Its a DOM element? Probably...
			else {
				return $( settings.source ).html();
			}

		};

		// TODO: Improve next `display???` functions. Maybe combine them in one...
		this.displayTop = function( coords ){
			plugin.changeHolderPosition( 'top' );

			plugin.holderCss({
				'top': coords.top - holder.outerHeight() - 10 + 'px',
				'left': coords.centerX - holder.outerWidth() / 2 + 'px'
			},
			{});
		};

		this.displayBottom = function( coords ){
			plugin.changeHolderPosition( 'bottom' );

			plugin.holderCss({
				'top': coords.bottom + 10 + 'px',
				'left': coords.centerX - holder.outerWidth() / 2 + 'px'
			},
			{});
		};

		this.displayRight = function( coords ){
			plugin.changeHolderPosition( 'right' );

			plugin.holderCss({
				'top': coords.centerY - holder.outerHeight() / 2 + 'px',
				'left': coords.right + 10 + 'px'
			},
			{});
		};

		this.displayLeft = function( coords ){
			plugin.changeHolderPosition( 'left' );

			plugin.holderCss({
				'top': coords.centerY - holder.outerHeight() / 2 + 'px',
				'left': coords.left - holder.outerWidth() - 10 + 'px',
			},
			{
				// 'top'        : coords.bottom - coords.centerY,
				// 'margin-top' : - holder.children('.zt-arrow').outerHeight() / 2,
			});
		};

		this.displayTopRight = function( coords ){
			plugin.changeHolderPosition( 'top-right' );

			plugin.holderCss({
				'top': coords.top - holder.outerHeight() - 10 + 'px',
				'left': coords.left + 'px',
			},
			{
				'left'        : coords.right - coords.centerX,
				'margin-left' : - holder.children('.zt-arrow').outerWidth() / 2,
			});
		};

		this.displayBottomLeft = function( coords ){
			plugin.changeHolderPosition( 'bottom-left' );

			plugin.holderCss({
				'top': coords.bottom + 10 + 'px',
				'left': coords.right - holder.outerWidth() + 'px',
			},
			{
				'right'        : coords.right - coords.centerX,
				'margin-right' : - holder.children('.zt-arrow').outerWidth() / 2,
			});
		};

		this.displayTopLeft = function( coords ){
			plugin.changeHolderPosition( 'top-left' );

			plugin.holderCss({
				'top'  : coords.top - holder.outerHeight() - 10 + 'px',
				'left' : coords.right - holder.outerWidth() + 'px',
			},
			{
				'right'        : coords.right - coords.centerX,
				'margin-right' : - holder.children('.zt-arrow').outerWidth() / 2,
			});
		};

		this.displayBottomRight = function( coords ){
			plugin.changeHolderPosition( 'bottom-right' );

			plugin.holderCss({
				'top'  : coords.bottom + 10 + 'px',
				'left' : coords.left + 'px',
			},
			{
				'left'        : coords.right - coords.centerX,
				'margin-left' : - holder.children('.zt-arrow').outerWidth() / 2,
			});
		};

		this.holderCss = function( holder_css, arrow_css ){
			var new_holder_css = {
				'top': holder_css.top || '',
				'right': holder_css.right || '',
				'bottom': holder_css.bottom || '',
				'left': holder_css.left || '',
			};

			var new_arrow_css = {
				'top': arrow_css.top || '',
				'right': arrow_css.right || '',
				'bottom': arrow_css.bottom || '',
				'left': arrow_css.left || '',
				'margin-top': arrow_css['margin-top'] || '',
				'margin-right': arrow_css['margin-right'] || '',
				'margin-bottom': arrow_css['margin-bottom'] || '',
				'margin-left': arrow_css['margin-left'] || '',
			};

			holder.css( new_holder_css ).children('.zt-arrow').css( new_arrow_css );
		};

		/**
		 * Get element coordinates.
		 *
		 * @param {object} elem The jQuery element object to get coordinates for.
		 * @return {object} Element coordinates.
		 */
		this.getElementCoordinates = function( elem ){
			// pure JS selected element
			var element = elem;

			// jQuery selected element
			if( elem instanceof jQuery ) {
				element = elem[0];
			}

			// Get top/left rectangular positions.
			var rec = element.getBoundingClientRect();

			// Get element dimensions
			var
				width  = rec.right - rec.left,
				height = rec.bottom - rec.top;

			// Return the coordinates of this element in current viewport
			return {
				width   : width,
				height  : height,
				top     : rec.top,
				left    : rec.left,
				bottom  : rec.bottom,
				right   : rec.right,

				fromTop     : rec.top,
				fromLeft    : rec.left,
				fromBottom  : window.innerHeight - rec.bottom,
				fromRight   : window.innerWidth - rec.right,

				centerX : rec.left + width / 2,
				centerY : rec.top + height / 2,
			};
		};

		/**
		 * Get viewport dimensions
		 *
		 * @return {object}
		 */
		this.getViewport = function(){
			return {
				width  : window.innerWidth,
				height : window.innerHeight,
			};
		};

		this.changeHolderPosition = function( position ){
			var new_class = 'ztip-position-' + position;

			if( ! holder.hasClass( new_class ) ) {
				holder.removeClass (
					function ( index, css ) {
						return ( css.match (/\bztip-position-\S+/g) || [] ).join(' ');
					}
				).addClass( new_class );
			}

			return holder;
		};

		this.refreshHolderTheme = function(){
			var new_theme = 'ztip-theme-' + settings.theme;

			if( ! holder.hasClass( new_theme ) ) {
				holder.removeClass (
					function ( index, css ) {
						return ( css.match (/\bztip-theme-\S+/g) || [] ).join(' ');
					}
				).addClass( new_theme );
			}
		};

		this.stringStartsWith = function(the_string, search_string, position){
			return the_string.substr(position || 0, search_string.length) === search_string;
		};

		init();
		return this;
	};

})(jQuery);
