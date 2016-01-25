var VError = require('verror');

/**
 * Retrieves the root cause of the given VError
 * @param error VError to retrieve root cause from
 * @returns {*}
 */
function getVErrorRoot(error) {
    var root = error;
    while (root instanceof VError && root.cause()) {
        root = root.cause();
    }
    return root;
}

module.exports.getVErrorRoot = getVErrorRoot;