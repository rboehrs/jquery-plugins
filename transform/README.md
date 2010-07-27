NETEYE Transform & Transition Plugin
====================================

Plugin to perform CSS-based transformations and transitions in JavaScript.

Transformations
---------------

.transform(options)

### Options

<dl>
<dt>rotate</dt>
<dd>Sets the rotation to the given degree. Use rotateBy to perform a relative rotation.</dd>

<dt>scale</dt>
<dd>Sets the scale factor. The value may either be a number (for proportional scaling) or 
a `{x:number, y:number}` object. Use `scaleBy` for a relative transformation.</dd>

<dt>translate</dt>
<dd>Translates the element by the given number of pixels. The value must be a `{x:int, y:int}` object.
Use `translateBy` to perform a relative translation.</dd>

<dt>origin</dt>
<dd>String that specifies the transform-origin. Default is `'0 0 '`.</dd>
</dl>


Transitions
-----------

Performs a transition from the current style to the given CSS values. If the browser does not
support CSS transitions, the new values are applied instantly.

.transition(css, options)

### Options

<dl>
<dt>delay</dt>
<dd>Delay (in milliseconds) until the transition should start. Default is `0`.</dd>

<dt>duration</dt>
<dd>Transition duration in seconds. Default is `0.4`.</dd>

<dt>onFinish</dt>
<dd>Callback that is invoked after the transition is finished. Default is `undefined`.</dd>
</dl>

Transform-Transitions
---------------------

Combination of the two functions above.

.transformTransition(options)

Accepts all options supported by either the `.transform()` or `.transition()` function. 
Additionally a `css` option may be specified to change more than just the transform property.

Example:

    $('#foo').transformTransition({scale: 2, opacity: 0.5, duration: 1.5});