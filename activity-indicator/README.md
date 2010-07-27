NETEYE Activity Indicator
=========================

A jQuery plugin that renders a translucent activity indicator (spinner)
using SVG or VML.

Features
--------

* Lightweight script
* No images required
* No external CSS
* Resolution independent
* Alpha transparency
* Highly configurable appearance
* Works in all major browsers
* Uses feature detection
* Degrades gracefully

Supported Browsers
------------------

The plugin has been successfully tested in the following browsers:

Firefox 2.0
Safari 3.2.1
Internet Explorer 6.0
Opera 10.6

Of course newer versions of the various browsers are also supported.

Dependencies
------------

The plugin requires jQuery v1.4.2 (or higher).
Besides that, no other files are required, especially no style-sheets or images.

Usage
-----

To render the default indicator, invoke `.activity()`. To remove it, call
`.activity(false)`. You may pass an options object to customize the 
appearance:

<dl>
<dt>segments</dt>
<dd>The number of lines to draw. Default is 12.</dd>
<dt>width</dt>
<dd>The width of each line. Default is 4.</dd>
<dt>space</dt>
<dd>The space between the inner ends of the lines. Default is 3.</dd>
<dt>length</dt>
<dd>The length of the lines. Default is 7.</dd>
<dt>color</dt>
<dd>The color. Supported formats are #rgb and #rrggbb. Default is the target element's text color.</dd>
<dt>steps</dt>
<dd>The size of the gradient specified in number of segements. All segments with an index
greater than this value will have the same opacity. Default is segments-1.</dd>
<dt>opacity</dt>
<dd>The opacity of the lightest segment. Default is 1/steps.</dd>
<dt>speed</dt>
<dd>Rotation speed in rounds per second. Default is 1.2.</dd>
<dt>outside</dt>
<dd>Whether the spinner should be added to the body rather than to the target element.
Useful if the target doesn't support nested elements, for example img, object or iframe 
elements. Default is false.</dd>
</dl>

You may change the global defaults by modifying the `$.fn.activity.defaults` object.