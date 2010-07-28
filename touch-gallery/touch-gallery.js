/*!
 * NETEYE Touch-Gallery jQuery Plugin
 *
 * Copyright (c) 2010 NETEYE GmbH
 * Licensed under the MIT license
 *
 * Author: Felix Gnass [fgnass at neteye dot de]
 * Version: @{VERSION}
 */
(function($) {
		
	$.fn.touchGallery = function(opts) {
		opts = $.extend({}, $.fn.touchGallery.defaults, opts);
		var thumbs = this;
		this.live('click', function(ev) {
			ev.preventDefault();
			var clickedThumb = $(this);
			if (!clickedThumb.is('.open')) {
				thumbs.addClass('open');
				openGallery(thumbs, clickedThumb, opts);
			}
		});
		return this;
	};
	
	/**
	 * Default options.
	 */
	$.fn.touchGallery.defaults = {
		getSource: function() {
			return this.href;
		}
	};
	
	// ==========================================================================================
	// Private functions
	// ==========================================================================================
	
	
	// Check if the browser supports touch events
	var touchDevice = !!document.createElement('div').ontouchstart;
	
	/**
	 * Opens the gallery. A spining activity indicator is displayed until the clicked image has
	 * been loaded. When ready, showGallery() is called.
	 */
	function openGallery(thumbs, clickedThumb, opts) {
		clickedThumb.activity();
		var img = new Image();
		img.onload = function() {
			clickedThumb.activity(false);
			showGallery(thumbs, clickedThumb, opts.getSource);
		};
		img.src = $.proxy(opts.getSource, clickedThumb.get(0))();
	}
	
	/**
	 * Creates DOM elements to actually show the gallery.
	 */
	function showGallery(thumbs, clickedThumb, getSrcCallback) {
		var index = thumbs.index(clickedThumb);
		
		$('html').css('overflow', 'hidden');
		
		var viewport = fitToView(preventTouch($('<div id="galleryViewport">').css({
			position: 'absolute',
			top: 0,
			left: 0,
			overflow: 'hidden'
		}).appendTo('body')));
		
		var stripe = $('<div id="galleryStripe">').css({
			position: 'absolute',
			height: '100%',
			top: 0,
			left: (-index * getInnerWidth()) + 'px'
		}).appendTo(viewport);
		
		setupEventListeners(stripe, getInnerWidth(), index, thumbs.length-1);
		
		$(window).bind('orientationchange.gallery', function() {
			fitToView(viewport);
			stripe.find('img').each(centerImage);
		});
		
		thumbs.each(function(i) {
			
			var page = $('<div>').addClass('galleryPage').css({
				display: 'block',
				position: 'absolute',
				left: i * getInnerWidth() + 'px',
				overflow: 'hidden',
				height: '100%'
			}).width(getInnerWidth()).data('thumbs', thumbs).data('thumb', $(this)).appendTo(stripe).activity(i != index);
			
			function insertImage() {
				var $img = $(this).css({position: 'absolute', display: 'block'});
				centerImage(i, this, $img);
				$img.transform('reset');
				if (i == index) {
					makeInvisible($img);
				}
				$img.appendTo(page.activity(false));
				if (i == index) {
					zoomIn(clickedThumb, makeInvisible($img), function() {
						stripe.addClass('ready');
					});
					insertShade(viewport);
				}
			}
			
			var img = new Image();
			img.src = $.proxy(getSrcCallback, this)();
			if (img.complete) {
				// Opera sometimes doesn't invoke the onload handler of the clicked image,
				// hence we invoke it manually if img.completed is true.
				$.proxy(insertImage, img)();
			}
			else {
				img.onload = insertImage;
			}
		});	
	}
	
	function hideGallery(stripe) {
		if (stripe.is('.ready') && !stripe.is('.panning')) {
			$('#galleryShade').remove();
			var page = stripe.find('.galleryPage').eq(stripe.data('galleryIndex'));
			page.data('thumbs').removeClass('open');
			var thumb = page.data('thumb');
			stripe.add(window).add(document).unbind('.gallery');
			zoomOut(page.find('img'), thumb, function() {
				makeVisible(thumb);
				$('#galleryViewport').remove();
				$('html').css('overflow', '');
			});
		}
	}
	
	/**
	 * Inserts a black DIV before the given target element and performs an opacity 
	 * transition form 0 to 1.
	 */
	function insertShade(target, onFinish) {
		var l = Math.max(screen.width, screen.height) + Math.max(getScrollLeft(), getScrollTop());
		$('<div id="galleryShade">').css({
			position: 'absolute', top: 0, left: 0, background: '#000', opacity: 0
		})
		.width(l)
		.height(l)
		.insertBefore(target)
		.transform('reset')
		.transition({opacity: touchDevice ? 1 : 0.8}, {delay: 1, duration: 0.8, onFinish: onFinish});
	}
	
	/**
	 * Scales and centers an element according to the dimensions of the given image.
	 * The first argument is ignored, it's just there so that the function can be used with .each()
	 */
	function centerImage(i, img, el) {
		el = el || $(img);
		if (!img.naturalWidth) {
			//Work-around for Opera which doesn't support naturalWidth/Height. This works because
			//the function is invoked once for each image before it is scaled.
			img.naturalWidth = img.width;
			img.naturalHeight = img.height;
		}
		var s = Math.min(getViewportScale(), Math.min(getInnerHeight()/img.naturalHeight, getInnerWidth()/img.naturalWidth));
		el.css({
			top: Math.round((getInnerHeight() - img.naturalHeight * s) / 2) +  'px',
			left: Math.round((getInnerWidth() - img.naturalWidth * s) / 2) +  'px'
		}).width(Math.round(img.naturalWidth * s));
	}
	
	/**
	 * Performs a zoom animation from the small to the large element. The large element is scaled 
	 * down and centered over the small element. Then a transition is performed that 
	 * resets the transformation.
	 */
	function zoomIn(small, large, onFinish) {
		var b = bounds(large);
		var t = bounds(small);
		var s = Math.max(t.width / large.width(), t.height / large.height());
		large.transform({
			translate: {
				x: t.left - b.left - Math.round((b.width * s - t.width) / 2), 
				y: t.top - b.top - Math.round((b.height * s - t.height) / 2)
			}, 
			scale: s
		});
		makeVisible(large);
		makeInvisible(small);
		large.transformTransition({delay: 1, reset: true, onFinish: onFinish});
	}
	
	/**
	 * Performs a zoom animation from the large to the small element. Since the small version
	 * may have a different aspect ratio, the large element is wrapped inside a div and clipped
	 * to match the aspect of the small version. The wrapper div is appended to the body, as 
	 * leaving it in place causes strange z-index/flickering issues.
	 */
	function zoomOut(large, small, onFinish) {
		if (!$.fn.transition.supported) {
			if (onFinish) {
				onFinish();
			}
			return;
		}
		var b = bounds(large);
		var t = bounds(small);
		
		var w = Math.min(b.height * t.width / t.height, b.width);
		var h = Math.min(b.width * t.height / t.width, b.height);
		
		var s = Math.max(t.width / w, t.height / h);
		
		var div = $('<div>').css({
			overflow: 'hidden',
			position: 'absolute',
			width: w + 'px',
			height: h + 'px',
			top: getScrollTop() + Math.round((getInnerHeight()-h) / 2) + 'px', 
			left: getScrollLeft() + Math.round((getInnerWidth()-w) / 2) + 'px'
		})
		.appendTo('body').append(large.css({
			top: 1-Math.floor((b.height-h) / 2) + 'px', // -1px offset to match Flickr's square crops
			left: -Math.floor((b.width-w) / 2) + 'px'
		}))
		.transform('reset');
		
		b = bounds(div);
		
		div.transformTransition({
			translate: {
				x: t.left - b.left - Math.round((w * s - t.width) / 2), 
				y: t.top - b.top - Math.round((h * s - t.height) / 2)
			}, 
			scale: s,
			onFinish: function() {
				div.remove();
				onFinish();
			}
		});
	}
	
	/**
	 * Registers event listeners to enable flicking through the images.
	 */
	function setupEventListeners(el, pageWidth, currentIndex, max) {
		var scale = getViewportScale();
		var xOffset = parseInt(el.css('left'));
		el.data('galleryIndex', currentIndex);
		
		function getThumb(i) {
			return el.find('.galleryPage').eq(i).data('thumb');
		}
		
		function flick(dir) {
			var i = el.data('galleryIndex');
			makeVisible(getThumb(i));
			i = Math.max(0, Math.min(i + dir, max));
			el.data('galleryIndex', i);
			makeInvisible(getThumb(i));
			
			if ($.fn.transform.supported) {
				el.addClass('panning').transformTransition({translate: {x: -i * pageWidth - xOffset}, onFinish: function() { this.removeClass('panning'); }});
			}
			else {
				el.css('left', -i * pageWidth + 'px');
			}
		}
		
		$(document).bind('keydown.gallery', function(event) {
			if (event.keyCode == 37) {
				el.trigger('prev');
			}
			else if (event.keyCode == 39) {
				el.trigger('next');
			}
			if (event.keyCode == 27 || event.keyCode == 32) {
				el.trigger('close');
			}
			return false;
		});
		
		el.bind('touchstart', function() {
			$(this).data('pan', {
				startX: event.targetTouches[0].screenX,
				lastX:event.targetTouches[0].screenX,
				startTime: new Date().getTime(),
				startOffset: $(this).transform().translate.x,
				distance: function() {
					return Math.round(scale * (this.startX - this.lastX));
				},
				delta: function() {
					var x = event.targetTouches[0].screenX;
					this.dir = this.lastX > x ? 1 : -1;
					var delta = Math.round(scale * (this.lastX - x));
					this.lastX = x;
					return delta;
				},
				duration: function() {
					return new Date().getTime() - this.startTime;
				}
			});
			return false;
		})
		.bind('touchmove', function() {
			var pan = $(this).data('pan');
			$(this).transform({translateBy: {x: -pan.delta()}});
			return false;
		})
		.bind('touchend', function() {
			var pan = $(this).data('pan');
			if (pan.distance() == 0 && pan.duration() < 500) {
				$(event.target).trigger('click');
			}
			else {
				flick(pan.dir);
			}
			return false;
		})
		.bind('prev', function() {
			flick(-1);
		})
		.bind('next', function() {
			flick(1);
		})
		.bind('click close', function() {
			hideGallery(el);
		});
	}
	
	/**
	 * Sets position and size of the given jQuery object to match the current viewport dimensions.
	 */
	function fitToView(el) {
		return el.css({top: getScrollTop() + 'px', left: getScrollLeft() + 'px'}).width(getInnerWidth()).height(getInnerHeight());
	}
	
	/**
	 * Returns the reciprocal of the current zoom-factor.
	 * @REVISIT Use screen.width / screen.availWidth instead?
	 */
	function getViewportScale() {
		return getInnerWidth() / document.documentElement.clientWidth;
	}
	
	/**
	 * Returns a window property with fallback to a property on the 
	 * documentElement in Internet Explorer.
	 */
	function getWindowProp(name, ie) {
		if (window[name] !== undefined) {
			return window[name];
		}
		var d = document.documentElement;
		if (d && d[ie]) {
			return d[ie];
		}
		return document.body[ie];
	}
	
	function getScrollTop() {
		return getWindowProp('pageYOffset', 'scrollTop');
	}
	
	function getScrollLeft() {
		return getWindowProp('pageXOffset', 'scrollLeft');
	}
	
	function getInnerWidth() {
		return getWindowProp('innerWidth', 'clientWidth');
	}
	
	function getInnerHeight() {
		return getWindowProp('innerHeight', 'clientHeight');
	}
	
	function makeVisible(el) {
		return el.css('visibility', 'visible');
	}
	
	function makeInvisible(el) {
		return el.css('visibility', 'hidden');
	}
	
	function bounds(el) {
		var e = el.get(0);
		if (e && e.getBoundingClientRect) {
			return e.getBoundingClientRect();
		}
		return $.extend({width: el.width(), height: el.height()}, el.offset());
	}
	
	function preventTouch(el) {
		return el.bind('touchstart', function() { return false; });
	}

})(jQuery);