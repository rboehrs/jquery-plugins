/*!
 * NETEYE Transform & Transition Plugin
 *
 * Copyright (c) 2010 NETEYE GmbH
 * Licensed under the MIT license
 *
 * Author: Felix Gnass [fgnass at neteye dot de]
 * Version: @{VERSION}
 */
(function($) {
	
	$.fn.transition = function(css, opts) {
	
		opts = $.extend({
			delay: 0,
			duration: 0.4
		}, opts);
		
		var property = '';
		for (var n in css) {
			property += n + ',';
		}

		this.each(function() {
			var $this = $(this);
		
			var _duration = $this.css('-webkit-transition-duration');		
			
			function apply() {
				$this.css({'-webkit-transition-property': property, '-webkit-transition-duration': opts.duration + 's'});
				
				$this.css(css);
				if (opts.duration > 0) {
					$this.one('webkitTransitionEnd', afterCompletion);
				}
				else {
					setTimeout(afterCompletion, 1);					
				}
			}
			
			function afterCompletion() {
				$this.css('-webkit-transition-duration', _duration);
					
				if (opts.onFinish) {
					$.proxy(opts.onFinish, $this)();
				}
			}
			
			if (opts.delay > 0) {
				setTimeout(apply, opts.delay);
			}
			else {
				apply();
			}
		});
		return this;
	};
	
	$.fn.transform = function(commands, opts) {
		opts = $.extend({
			origin: '0 0',
		}, opts);
		
		var result = this;
		this.each(function() {
			var $this = $(this);
			
			var t = transform($this, commands);
			if (!commands) {
				result = t.fn;
				return false;
			}
			$this.css({'-webkit-transition-duration': '0s', '-webkit-transform-origin': opts.origin, '-webkit-transform': t.format()});
		});
		return result;
	};
	
	$.fn.transformTransition = function(commands, opts) {
		opts = $.extend({
			origin: '0 0',
		}, opts);
		var css = $.extend(opts.css, {'-webkit-transform': transform(this, commands).format()});
		this.css('-webkit-transform-origin', opts.origin).transition(css, opts);
	};
	
	
	function transform(el, commands) {
		var t = el.data('transform');
		if (!t) {
			t = new Transformation();
			el.data('transform', t);
		}
		
		if (commands === 'reset') {
			t.reset();
		}
		else {
			t.exec(commands);
		}
		return t;
	}
	
	/**
	 * Class that keeps track of numeric values and converts them into a string representation
	 * that can be used as value for the -webkit-transform property. TransformFunctions are used
	 * internally by the Transformation class.
	 *
	 * // Example:
	 *
	 * var t = new TransformFunction('translate3d({x}px,{y}px,{z}px)', {x:0, y:0, z:0});
	 * t.x = 23;
	 * console.assert(t.format() == 'translate3d(23px,0px,0px)')
	 */
	function TransformFunction(pattern, defaults) {
		function fillIn(pattern, data) {
			return pattern.replace(/\{(\w+)\}/g, function(s, p1) { return data[p1]; });
		}
		this.reset = function() {
			$.extend(this, defaults);
		};
		this.format = function() {
			return fillIn(pattern, this);
		};
		this.reset();
	}
	
	/**
	 * Class that encapsulates the state of multiple TransformFunctions. The state can be modified
	 * using commands and converted into a string representation that can be used as value for 
	 * the -webkit-transform property. The class is used internally by the transform plugin.
	 */
	function Transformation() {
		var fn = {
			translate: new TransformFunction('translate3d({x}px,{y}px,{z}px)', {x:0, y:0, z:0}),
			scale: new TransformFunction('scale3d({s},{s},1)', {s: 1}),
			rotate: new TransformFunction('rotate({deg}deg)', {deg:0})
		};
		var commands = {
			rotate: function(deg) {
				fn.rotate.deg = deg;
			},
			rotateBy: function(deg) {
				fn.rotate.deg += deg;
			},
			scale: function(s) {
				fn.scale.s = s;
			},
			scaleBy: function(s) {
				fn.scale.s *= s;
			},
			translate: function(s) {
				var t = fn.translate;
				if (!s) s = {x: 0, y: 0, z: 1};
				t.x = (s.x !== undefined) ? parseInt(s.x) : t.x;
				t.y = (s.y !== undefined) ? parseInt(s.y) : t.y;
				t.z = (s.z !== undefined) ? parseInt(s.z) : t.z;
			},
			translateBy: function(s) {
				var t = fn.translate;
				t.x += parseInt(s.x) || 0;
				t.y += parseInt(s.y) || 0;
				t.z += parseInt(s.z) || 0;
			},
			zIndex: function(z) {
				fn.translate.z = parseInt(z);
			}
		};
		this.fn = fn;
		this.exec = function(cmd) {
			for (var n in cmd) {
				commands[n](cmd[n]);
			}
		};
		this.reset = function() {
			$.each(fn, function() {
				this.reset();
			});
		};
		this.format = function() {
			var s = '';
			for (var n in fn) {
				s += fn[n].format() + ' ';
			}
			return s;
		}
	};
	
})(jQuery);