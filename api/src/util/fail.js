const functions = require('firebase-functions');
/*
 * Possible `code` values (taken from the functions.https.HttpsError docs):
 *
 * - `cancelled`: The operation was cancelled (typically by the caller).
 *
 * - `unknown`: Unknown error or an error from a different error domain.
 *
 * - `invalid-argument`: Client specified an invalid argument. Note that this
 *   differs from `failed-precondition`. `invalid-argument` indicates
 *   arguments that are problematic regardless of the state of the system
 *   (e.g. an invalid field name).
 *
 * - `deadline-exceeded`: Deadline expired before operation could complete.
 *   For operations that change the state of the system, this error may be
 *   returned even if the operation has completed successfully. For example,
 *   a successful response from a server could have been delayed long enough
 *   for the deadline to expire.
 *
 * - `not-found`: Some requested document was not found.
 *
 * - `already-exists`: Some document that we attempted to create already
 *   exists.
 *
 * - `permission-denied`: The caller does not have permission to execute the
 *   specified operation.
 *
 * - `resource-exhausted`: Some resource has been exhausted, perhaps a
 *   per-user quota, or perhaps the entire file system is out of space.
 *
 * - `failed-precondition`: Operation was rejected because the system is not
 *   in a state required for the operation's execution.
 *
 * - `aborted`: The operation was aborted, typically due to a concurrency
 *   issue like transaction aborts, etc.
 *
 * - `out-of-range`: Operation was attempted past the valid range.
 *
 * - `unimplemented`: Operation is not implemented or not supported/enabled.
 *
 * - `internal`: Internal errors. Means some invariants expected by
 *   underlying system has been broken. If you see one of these errors,
 *   something is very broken.
 *
 * - `unavailable`: The service is currently unavailable. This is most likely
 *   a transient condition and may be corrected by retrying with a backoff.
 *
 * - `data-loss`: Unrecoverable data loss or corruption.
 *
 * - `unauthenticated`: The request does not have valid authentication
 *   credentials for the operation.
 */
module.exports = (code) => {
  // https://firebase.google.com/docs/functions/callable#handle_errors
  throw new functions.https.HttpsError(code);
};
