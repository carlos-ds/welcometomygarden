// https://stackoverflow.com/a/69959606/4973029
// eslint-disable-next-line import/no-unresolved
const { getFirestore } = require('firebase-admin/firestore');
const removeUndefined = require('../../util/removeUndefined');
const { stripeSubscriptionKeys } = require('../constants');
const getFirebaseUserId = require('../getFirebaseUserId');

const { statusKey, cancelAtKey, canceledAtKey } = stripeSubscriptionKeys;

const db = getFirestore();

/**
 * When a subscription is deleted, that means it's over. We configure it
 * so it only gets deleted at a period's end.
 * This event should lead to the un-provisioning of a superfan.
 * TODO: maybe also a transactional email?
 * https://stripe.com/docs/billing/subscriptions/cancel#events
 * @param {*} event
 * @param {*} res
 */
module.exports = async (event, res) => {
  console.log('Handling customer.subscription.deleted');
  /** @type {import('stripe').Stripe.Subscription} */
  const subscription = event.data.object;
  const uid = await getFirebaseUserId(subscription.customer);

  // Ensure the user is UNmarked as a superfan.
  // (pointless overwrite in case it was already set to true)
  const publicUserProfileDocRef = db.doc(`users/${uid}`);
  await publicUserProfileDocRef.update({ superfan: false });

  // Set the Firebase subscription status
  const privateUserProfileDocRef = db.doc(`users-private/${uid}`);
  await privateUserProfileDocRef.update(
    removeUndefined({
      [statusKey]: subscription.status,
      [cancelAtKey]: subscription.cancel_at,
      [canceledAtKey]: subscription.canceled_at
    })
  );
  return res.sendStatus(200);
};
