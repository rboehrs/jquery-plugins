/*!
 * NETEYE Activity Indicator jQuery Plugin
 *
 * Copyright (c) 2010 NETEYE GmbH
 * Licensed under the MIT license
 *
 * Author: Felix Gnass [fgnass at neteye dot de]
 * Version: @{VERSION}
 */
 
/**
 * Plugin that renders a customisable activity indicator (spinner) using SVG or VML.
 */
(function($) {

	$.fn.activity = function(opts) {
		this.each(function() {
			var $this = $(this);
			var el = $this.data('activity');
			if (el) {
				clearInterval(el.data('interval'));
				el.remove();
				$this.removeData('activity');
			}
			if (opts !== false) {
				opts = $.extend({}, $.fn.activity.defaults, opts);
				
				var el = render($this, opts).prependTo($this);
				el.css({
					position: 'absolute',
					marginTop: Math.floor(($this.height() - el.height()) / 2) + 'px',
					marginLeft: Math.floor(($this.width() - el.width()) / 2) + 'px'
				});
				animate(el, opts.segments, Math.round(10 / opts.speed) / 10);
				$this.data('activity', el);
			}
		});
		return this;
	};
	
	$.fn.activity.defaults = {
		segments: 12,
		space: 2,
		length: 7,
		width: 4,
		color: '#fff',
		speed: 1.2
	};
	
	/**
	 * Default rendering strategy. If neither SVG nor VML is available, a div with class-name 'busy' 
	 * is inserted, that can be styled with CSS to display an animated gif as fallback.
	 */
	var render = function() {
		return $('<div>').addClass('busy');
	};
	
	/**
	 * The default animation strategy does nothing as we expect an animated gif as fallback.
	 */
	var animate = function() {
	};
	
	if (document.createElementNS && document.createElementNS( "http://www.w3.org/2000/svg", "svg").createSVGRect) {
	
		// =======================================================================================
		// SVG Rendering
		// =======================================================================================
		
		/**
		 * Utility function to create elements in the SVG namespace.
		 */
		function svg(tag, attr) {
			var el = document.createElementNS("http://www.w3.org/2000/svg", tag || 'svg');
			if (attr) {
				for (n in attr) {
					el.setAttributeNS(null, n, attr[n]);
				}
			}
			return $(el);
		}
	
		/**
		 * Rendering strategy that creates a SVG tree.
		 */
		render = function(target, d) {
			var innerRadius = d.width*2 + d.space;
			var r = (innerRadius + d.length + Math.ceil(d.width / 2) + 1);
			
			var el = svg().width(r*2).height(r*2);
			
			var g = svg('g', {
				'stroke-width': d.width, 
				'stroke-linecap': 'round', 
				stroke: d.color
			}).appendTo(svg('g', {transform: 'translate('+ r +','+ r +')'}).appendTo(el));
			
			for (var i = 0; i < d.segments; i++) {
				g.append(svg('line', {
					x1: 0, 
					y1: innerRadius, 
					x2: 0, 
					y2: innerRadius + d.length, 
					transform: 'rotate(' + (360 / d.segments * i) + ', 0, 0)',
					opacity: (1 / d.segments * (i+1))
				}));
			}
			return $('<div>').append(el).width(2*r).height(2*r);
		}
				
		// Check if Webkit CSS animations are available, as they work much better on the iPad
		// than setTimeout() based animations.
		
		if (document.createElement('div').style.WebkitAnimationName !== undefined) {

			var animations = {};
		
			/**
			 * Adds CSS rule for a linear keyframe animation with the given number of steps.
			 */
			function addAnimation(steps) {
				var name = 'spin' + steps;
				var rule = '@-webkit-keyframes '+ name +' {';
				for (var i=0; i < steps; i++) {
					var p1 = Math.round(100000 / steps * i) / 1000;
					var p2 = Math.round(100000 / steps * (i+1) - 1) / 1000;
					var value = '% { -webkit-transform:rotate(' + Math.round(360 / steps * i) + 'deg); }\n';
					rule += p1 + value + p2 + value; 
				}
				rule += '100% { -webkit-transform:rotate(100deg); }\n}';
				document.styleSheets[0].insertRule(rule);
				return name;
			}
			
			/**
			 * Animation strategy that uses dynamically created CSS animation rules.
			 */
			animate = function(el, steps, duration) {
				if (!animations[steps]) {
					animations[steps] = addAnimation(steps);
				}
				el.css('-webkit-animation', animations[steps] + ' ' + duration +'s linear infinite');
			}
		}
		else {
		
			/**
			 * Animation strategy that transforms a SVG element using setInterval().
			 */
			animate = function(el, steps, duration) {
				var rotation = 0;
				var g = el.find('g g').get(0);
				el.data('interval', setInterval(function() {
					g.setAttributeNS(null, 'transform', 'rotate(' + (++rotation % steps * (360 / steps)) + ')');
				},  duration * 1000 / steps));
			}
		}
		
	}
	else {
		
		// =======================================================================================
		// VML Rendering
		// =======================================================================================
		
		var s = $('<shape>').css('behavior', 'url(#default#VML)').appendTo('body');
			
		if (s.get(0).adj) {
		
			// VML support detected. Insert CSS rules for group, shape and stroke.
			var sheet = document.createStyleSheet();
			$.each(['group', 'shape', 'stroke'], function() {
				sheet.addRule(this, "behavior:url(#default#VML);");
			});
			
			/**
			 * Rendering strategy that creates a VML tree. 
			 */
			render = function(target, d) {
			
				var innerRadius = d.width*2 + d.space;
				var r = (innerRadius + d.length + Math.ceil(d.width / 2) + 1);
				var s = r*2;
				var o = -Math.ceil(s/2);
				
				var el = $('<group>', {coordsize: s + ' ' + s, coordorigin: o + ' ' + o}).css({top: o, left: o, width: s, height: s});
				for (var i = 0; i < d.segments; i++) {
					el.append($('<shape>', {path: 'm ' + innerRadius + ',0  l ' + (innerRadius + d.length) + ',0'}).css({
						width: s,
						height: s,
						rotation: (360 / d.segments * i) + 'deg'
					}).append($('<stroke>', {color: d.color, weight: d.width + 'px', endcap: 'round', opacity: 1 / d.segments * (i+1)})));
				}
				return $('<group>', {coordsize: s + ' ' + s}).css({width: s, height: s, overflow: 'hidden'}).append(el);
			}
		
			/**
		     * Animation strategy that modifies the VML rotation property using setInterval().
		     */
			animate = function(el, steps, duration) {
				var rotation = 0;
				var g = el.get(0);
				el.data('interval', setInterval(function() {
					g.style.rotation = ++rotation % steps * (360 / steps);
				},  duration * 1000 / steps));
			};
		}
		$(s).remove();
	}

})(jQuery);