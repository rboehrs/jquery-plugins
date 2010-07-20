NETEYE Touch Gallery
====================

A fullscreen photo gallery for touch devices.

Supported Browsers
------------------

The plugin was written and optimized for Mobile Safari running on the iPad or iPhone 4.

It also runs in Opera and Chrome (and possibly other Webkit-based browsers) but the performance
isn't as good as in Safri which provides hardware accelleration.

The gallery is viewable in Firefox, but the transition effects are missing.
Internet Explorer currently isn't supported at all.

Dependencies
------------

NETEYE Touch Gallery depends on two other plugins that are also part of the NETEYE Plugin 
Collection: transform and activity-indicator. When you download this plugin as distribution 
archive, you get an all-in-one JavaScript file that contains all required files.

The plugin requires jQuery v1.4.2 (or higher).

Usage
-----

	<div id="gallery">
	<a href="image1.jpg">
		<img src="thumb1.jpg" />
	</a>
	<a href="image2.jpg">
		<img src="thumb2.jpg" />
	</a>
	<a href="image3.jpg">
		<img src="thumb3.jpg" />
	</a>
	</div>
	
	<script>
		$('#gallery a').touchGallery();
	</script>

As optional argument a function may be passed to the plugin that returns the high-resolution URL
for a thumbnail. Here is an example that uses a HTML5 data-attribute instead of links:

	<img src="thumb1.jpg" data-large="image1.jpg" />
	<img src="thumb2.jpg" data-large="image2.jpg" />
	<img src="thumb3.jpg"  data-large="image3.jpg" />
	
	<script>
		$('img[data-large]').touchGallery(function() { 
			return $(this).attr('data-large');
		});
	</script>

