/**
 * The fade transition module.
 * @module fade
 * @requires system
 * @requires composition
 * @requires jquery
 */
define(['durandal/system', 'durandal/composition', 'jquery'], 
	function(system, composition, $) {
		var fadeDuration = {
			in: 250,
			out: 250
		};

		/**
		 * @class FadeModule
		 * @constructor
		 */
		var fade = function(context) {
			return system.defer(function(dfd) {
				function endTransition() {
					dfd.resolve();
				}

				function scrollIfNeeded() {
					if (!context.keepScrollPosition) {
						$(document).scrollTop(0);
					}
				}

				if (!context.child) {
					$(context.activeView).fadeOut({
						duration: fadeDuration.out,
						always: endTransition
					});
				} else {
					function startTransition() {
						scrollIfNeeded();
						context.triggerAttach();

						var $child = $(context.child);

						$child.fadeIn({
							duration: fadeDuration.out,
							always: endTransition
						});
					}

					if (context.activeView) {
						$(context.activeView).fadeOut({
							duration: fadeDuration.out,
							always: startTransition
						});
					} else {
						startTransition();
					}
				}
			}).promise();
		};

		return fade;
	}
);
