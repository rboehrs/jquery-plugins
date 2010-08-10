NETEYE Transform & Transition Plugin
====================================

Plugin to perform CSS-based transformations and transitions in JavaScript.

The plugin takes care of the different vendor-prefixes and event names. It also keeps
track of the transformation-state to allow relative modifications. In browsers that
support 3D transforms, the 3D functions are used instead of their 2D counterparts
to enable hardware acceleration.

Transformations
---------------

Sets or gets the CSS transform state.

* .transform(options)
* .transform(false)
* .transform()

### Options

 - **rotate**
   Sets the rotation to the given degree. Use rotateBy to perform a relative rotation.

 - **scale**
   Sets the scale factor. The value may either be a number (for proportional scaling) or 
   a `{x:number, y:number}` object. Use `scaleBy` for a relative transformation.

 - **translate**
   Translates the element by the given number of pixels. The value must be 
   a `{x:int, y:int}` object. Use `translateBy` to perform a relative translation.

 - **origin**
   String that specifies the transform-origin. Default is `'0 0 '`.


You may use the `$.fn.transform.supported` property to check if the browser supports 
CSS transforms.

### Reset

Calling `.transform(false)` resets the state to its default, i.e.:

	scale: {x: 1, y: 1},
	translate: {x: 0, y: 0},
	rotate: {deg: 0}

### Query State

If called without arguments, the plugin returns the current state:

<div class="liquid highlight javascript"></div>

    {
    	rotate: {deg: int},
    	scale: {x: number, y: number},
    	translate: {x: int, y: int}
    }

<div class="liquid endhighlight"></div>

Transitions
-----------

Performs a transition from the current style to the given CSS values. If the browser does not
support CSS transitions, the new values are applied instantly.

    .transition(css, options)

### Options

 - **delay**
   Delay (in milliseconds) until the transition should start. Default is `0`.

 - **duration**
   Transition duration in seconds. Default is `0.4`.

 - **onFinish**
   Callback that is invoked after the transition is finished. Default is `undefined`.


You may use the `$.fn.transition.supported` property to check if the browser supports 
CSS transitions.


Transform-Transitions
---------------------

Combination of the two functions above.

    .transformTransition(options)

Accepts all options supported by either the `.transform()` or `.transition()` function. 
Additionally a `css` option may be specified to change more than just the transform property.

Example:

<div class="liquid highlight javascript"></div>

    $('#foo').transformTransition({
    	scale: 2,
    	opacity: 0.5,
    	duration: 1.5
    });

<div class="liquid endhighlight"></div>
  
Links
-----
    
* Author:  [Felix Gnass](http://github.com/fgnass)
* Company: [NETEYE](http://neteye.de)
* License: [MIT](http://neteye.github.com/MIT-LICENSE.txt)
* Demo:    http://neteye.github.com/transform.html
