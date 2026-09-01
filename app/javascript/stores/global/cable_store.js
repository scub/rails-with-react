import { createConsumer } from '@rails/actioncable';
import { proxy } from 'valtio';

// One mailbox slot, not a queue: every incoming message overwrites
// `cableStore.state.event`, and every domain store that cares registers its
// own subscribe() and filters by message.channel. Mirrors the real app's
// app/javascript/stores/global/cable_store.js.
const cableStore = proxy({ state: { event: { message: {}, event_type: '' } } });

let consumer = null;

function connectToCable(realtimeToken) {
  if (consumer || !realtimeToken) return;

  consumer = createConsumer(`${window.root_url || ''}/cable`);
  consumer.subscriptions.create(
    { channel: 'RealtimeChannel', realtime_token: realtimeToken },
    {
      connected() {
        cableStore.state.event = { event_type: 'open', message: {} };
      },
      received(data) {
        cableStore.state.event = { event_type: 'message', message: data };
      },
    }
  );
}

export { cableStore, connectToCable };
