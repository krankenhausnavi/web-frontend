/**
 * See: https://stackoverflow.com/a/46324042
 */
define("initBootstrap", ["popper"], function(popper) {
    // set popper as required by Bootstrap
    window.Popper = popper;
    require(["bootstrap"], function(bootstrap) {
        // do nothing - just let Bootstrap initialise itself
    });
});